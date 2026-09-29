import { config } from '../config/env.ts';

export interface LocationCoord {
  lat: number;
  lng: number;
}

export interface NetRealizationCalculationParams {
  mandiRate: number;              // Price per quintal (₹)
  quantityQuintals: number;       // Crop quantity in quintals
  distanceKm: number;             // Distance from farmer location to mandi
  freightRatePerKmQuintal?: number;// e.g., ₹2.5 / km / quintal
  handlingChargePerQuintal?: number;// Loading/unloading (e.g., ₹25/quintal)
  mandiCessPercent?: number;       // Market fee / cess (e.g., 1.5%)
  otherCharges?: number;          // Toll, packaging, weighbridge, etc.
}

export interface NetRealizationBreakdown {
  quantityQuintals: number;
  mandiRatePerQuintal: number;
  distanceKm: number;
  grossSale: number;
  transportCost: number;
  handlingCost: number;
  mandiCess: number;
  otherCharges: number;
  totalDeductions: number;
  netRealization: number;
  effectiveRatePerQuintal: number; // Net realization / quantity
  savingsPercentage: number;
}

export class CalculatorService {
  /**
   * Calculates the Great-Circle distance between two points on Earth using the Haversine formula.
   * Returns distance in kilometers (km), rounded to 2 decimal places.
   */
  public static calculateHaversineDistance(
    coord1: LocationCoord,
    coord2: LocationCoord
  ): number {
    const R = 6371; // Earth's mean radius in km
    const dLat = this.deg2rad(coord2.lat - coord1.lat);
    const dLng = this.deg2rad(coord2.lng - coord1.lng);

    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(this.deg2rad(coord1.lat)) *
        Math.cos(this.deg2rad(coord2.lat)) *
        Math.sin(dLng / 2) *
        Math.sin(dLng / 2);

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distanceKm = R * c;

    return Math.round(distanceKm * 100) / 100;
  }

  private static deg2rad(deg: number): number {
    return deg * (Math.PI / 180);
  }

  /**
   * Estimates transport cost based on distance and load size.
   * Basic formula: Distance (km) * Rate per km/quintal * Quantity (quintals)
   * With minimum base trip charge protection for small distances.
   */
  public static calculateEstimatedTransportCost(
    distanceKm: number,
    quantityQuintals: number,
    customRatePerKmQuintal?: number
  ): number {
    const rate = customRatePerKmQuintal ?? config.freightRatePerKmQuintal;
    // Standard transport calculation
    const calculatedCost = distanceKm * rate * quantityQuintals;
    
    // Minimum vehicle dispatch charge (base cost)
    const minTripCharge = 350; 
    const finalCost = Math.max(calculatedCost, minTripCharge * Math.min(1, quantityQuintals / 10));

    return Math.round(finalCost * 100) / 100;
  }

  /**
   * Full Realization Engine:
   * Gross Sale = Mandi Rate × Quantity
   * Transport Cost = Estimated Transport Cost
   * Net Realization = Gross Sale - Transport Cost - Other Charges (handling, cess, misc)
   */
  public static calculateNetRealization(
    params: NetRealizationCalculationParams
  ): NetRealizationBreakdown {
    const {
      mandiRate,
      quantityQuintals,
      distanceKm,
      freightRatePerKmQuintal,
      handlingChargePerQuintal = config.handlingChargePerQuintal,
      mandiCessPercent = config.mandiCessPercent,
      otherCharges = 0,
    } = params;

    // 1. Gross Sale = Mandi Rate × Quantity
    const grossSale = Math.round(mandiRate * quantityQuintals * 100) / 100;

    // 2. Transport Cost
    const transportCost = this.calculateEstimatedTransportCost(
      distanceKm,
      quantityQuintals,
      freightRatePerKmQuintal
    );

    // 3. Handling charge (loading / unloading / bagging)
    const handlingCost = Math.round(handlingChargePerQuintal * quantityQuintals * 100) / 100;

    // 4. Mandi Cess / APMC charges
    const mandiCess = Math.round((grossSale * (mandiCessPercent / 100)) * 100) / 100;

    // 5. Total Deductions
    const totalDeductions =
      Math.round((transportCost + handlingCost + mandiCess + otherCharges) * 100) / 100;

    // 6. Net Realization = Gross Sale - Deductions
    const netRealization = Math.round((grossSale - totalDeductions) * 100) / 100;

    // Effective net price received by farmer per quintal
    const effectiveRatePerQuintal =
      quantityQuintals > 0
        ? Math.round((netRealization / quantityQuintals) * 100) / 100
        : mandiRate;

    const savingsPercentage =
      grossSale > 0
        ? Math.round(((grossSale - totalDeductions) / grossSale) * 1000) / 10
        : 0;

    return {
      quantityQuintals,
      mandiRatePerQuintal: mandiRate,
      distanceKm,
      grossSale,
      transportCost,
      handlingCost,
      mandiCess,
      otherCharges,
      totalDeductions,
      netRealization,
      effectiveRatePerQuintal,
      savingsPercentage,
    };
  }
}
