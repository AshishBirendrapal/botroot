import { MandiRecord, UP_MANDI_LOCATIONS } from '../data/upMandiData.ts';
import { memoryStore } from '../data/memoryStore.ts';
import { isDbConnected } from '../config/db.ts';
import { MandiPriceModel } from '../models/MandiPrice.ts';
import { CalculatorService, LocationCoord } from './calculatorService.ts';

export interface MandiFilterQuery {
  commodity?: string;
  district?: string;
  market?: string;
  search?: string;
}

export interface MandiComparisonResult {
  mandi: MandiRecord;
  distanceKm: number;
  breakdown: {
    grossSale: number;
    transportCost: number;
    handlingCost: number;
    mandiCess: number;
    otherCharges: number;
    totalDeductions: number;
    netRealization: number;
    effectiveRatePerQuintal: number;
  };
  isHighestNetRealization: boolean;
  rank: number;
  differenceFromBest: number;
}

export class MandiService {
  /**
   * Fetches latest UP mandi prices with multi-criteria filters
   */
  public static async getPrices(filter: MandiFilterQuery): Promise<MandiRecord[]> {
    let records: MandiRecord[] = [];

    if (isDbConnected()) {
      try {
        const query: any = { state: 'Uttar Pradesh' };
        if (filter.commodity) {
          query.commodity = new RegExp(filter.commodity, 'i');
        }
        if (filter.district) {
          query.district = new RegExp(filter.district, 'i');
        }
        if (filter.market) {
          query.market = new RegExp(filter.market, 'i');
        }

        const dbRecords = await MandiPriceModel.find(query).lean();
        if (dbRecords && dbRecords.length > 0) {
          records = dbRecords.map((r: any) => ({
            id: r._id.toString(),
            state: r.state,
            district: r.district,
            market: r.market,
            commodity: r.commodity,
            variety: r.variety,
            arrivalDate: r.arrivalDate,
            minPrice: r.minPrice,
            maxPrice: r.maxPrice,
            modalPrice: r.modalPrice,
            lat: r.coordinates?.lat || 26.8467,
            lng: r.coordinates?.lng || 80.9462,
          }));
        }
      } catch (err) {
        console.warn('[MandiService] DB fetch failed, falling back to memory store.');
      }
    }

    if (records.length === 0) {
      records = memoryStore.mandiPrices;
    }

    // Apply in-memory filtering
    return records.filter((item) => {
      if (filter.commodity && !item.commodity.toLowerCase().includes(filter.commodity.toLowerCase())) {
        return false;
      }
      if (filter.district && !item.district.toLowerCase().includes(filter.district.toLowerCase())) {
        return false;
      }
      if (filter.market && !item.market.toLowerCase().includes(filter.market.toLowerCase())) {
        return false;
      }
      if (filter.search) {
        const term = filter.search.toLowerCase();
        const matches =
          item.commodity.toLowerCase().includes(term) ||
          item.district.toLowerCase().includes(term) ||
          item.market.toLowerCase().includes(term) ||
          item.variety.toLowerCase().includes(term);
        if (!matches) return false;
      }
      return true;
    });
  }

  /**
   * Returns list of unique commodities available in UP mandis
   */
  public static async getDistinctCommodities(): Promise<string[]> {
    const prices = await this.getPrices({});
    const set = new Set(prices.map((p) => p.commodity));
    return Array.from(set).sort();
  }

  /**
   * Returns list of districts and markets in UP
   */
  public static async getDistrictsAndMarkets(): Promise<Record<string, string[]>> {
    const prices = await this.getPrices({});
    const mapping: Record<string, Set<string>> = {};

    for (const p of prices) {
      if (!mapping[p.district]) {
        mapping[p.district] = new Set();
      }
      mapping[p.district].add(p.market);
    }

    const result: Record<string, string[]> = {};
    for (const [dist, marketSet] of Object.entries(mapping)) {
      result[dist] = Array.from(marketSet).sort();
    }
    return result;
  }

  /**
   * Resolves coordinates for a given district name in UP
   */
  public static getCoordinatesForDistrict(district: string): LocationCoord {
    const loc = UP_MANDI_LOCATIONS[district];
    if (loc) {
      return loc;
    }
    // Return Uttar Pradesh central coordinate default (Lucknow)
    return { lat: 26.8467, lng: 80.9462 };
  }

  /**
   * Compares multiple Mandis for a crop & quantity from farmer's location.
   * Ranks mandis by Net Realization and highlights the highest yielding market.
   */
  public static async compareMandis(params: {
    crop: string;
    quantityQuintals: number;
    farmerCoord: LocationCoord;
    customFreightRate?: number;
    handlingChargePerQuintal?: number;
    mandiCessPercent?: number;
    maxDistanceKm?: number;
  }): Promise<{
    bestMandi: MandiComparisonResult;
    allMandis: MandiComparisonResult[];
    totalAnalyzed: number;
    recommendationSummary: string;
  }> {
    const {
      crop,
      quantityQuintals,
      farmerCoord,
      customFreightRate,
      handlingChargePerQuintal,
      mandiCessPercent,
      maxDistanceKm = 300,
    } = params;

    const availablePrices = await this.getPrices({ commodity: crop });

    if (availablePrices.length === 0) {
      throw new Error(`No mandi prices currently found for crop: '${crop}' in Uttar Pradesh.`);
    }

    const comparisonList: MandiComparisonResult[] = [];

    for (const mandi of availablePrices) {
      const mandiCoord: LocationCoord = {
        lat: mandi.lat,
        lng: mandi.lng,
      };

      const distanceKm = CalculatorService.calculateHaversineDistance(farmerCoord, mandiCoord);

      // Filter mandis within reasonable transport distance if specified
      if (maxDistanceKm && distanceKm > maxDistanceKm) {
        continue;
      }

      const breakdown = CalculatorService.calculateNetRealization({
        mandiRate: mandi.modalPrice,
        quantityQuintals,
        distanceKm,
        freightRatePerKmQuintal: customFreightRate,
        handlingChargePerQuintal,
        mandiCessPercent,
      });

      comparisonList.push({
        mandi,
        distanceKm,
        breakdown,
        isHighestNetRealization: false,
        rank: 0,
        differenceFromBest: 0,
      });
    }

    if (comparisonList.length === 0) {
      throw new Error(`No mandis found within ${maxDistanceKm}km for crop '${crop}'. Try increasing the search distance.`);
    }

    // Sort descending by net realization
    comparisonList.sort((a, b) => b.breakdown.netRealization - a.breakdown.netRealization);

    const highestNet = comparisonList[0].breakdown.netRealization;

    comparisonList.forEach((item, index) => {
      item.rank = index + 1;
      item.isHighestNetRealization = index === 0;
      item.differenceFromBest = Math.round((highestNet - item.breakdown.netRealization) * 100) / 100;
    });

    const best = comparisonList[0];
    const summary = `Selling at ${best.mandi.market} (${best.mandi.district}) yields the highest Net Realization of ₹${best.breakdown.netRealization.toLocaleString('en-IN')} (Effective ₹${best.breakdown.effectiveRatePerQuintal}/Qtl) after ₹${best.breakdown.transportCost.toLocaleString('en-IN')} transport expenses over ${best.distanceKm} km.`;

    return {
      bestMandi: best,
      allMandis: comparisonList,
      totalAnalyzed: comparisonList.length,
      recommendationSummary: summary,
    };
  }
}
