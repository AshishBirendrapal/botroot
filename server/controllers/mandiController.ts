import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { MandiService } from '../services/mandiService.ts';
import { CalculatorService } from '../services/calculatorService.ts';

export const getPricesSchema = z.object({
  query: z.object({
    crop: z.string().optional(),
    commodity: z.string().optional(),
    district: z.string().optional(),
    market: z.string().optional(),
    search: z.string().optional(),
  }),
});

export const distanceCalcSchema = z.object({
  body: z.object({
    from: z.object({
      lat: z.number(),
      lng: z.number(),
    }),
    to: z.object({
      lat: z.number(),
      lng: z.number(),
    }),
  }),
});

export const netRealizationSchema = z.object({
  body: z.object({
    mandiRate: z.number().positive('Mandi rate must be greater than zero'),
    quantityQuintals: z.number().positive('Quantity must be greater than zero'),
    distanceKm: z.number().nonnegative('Distance cannot be negative'),
    freightRatePerKmQuintal: z.number().positive().optional(),
    handlingChargePerQuintal: z.number().nonnegative().optional(),
    mandiCessPercent: z.number().nonnegative().optional(),
    otherCharges: z.number().nonnegative().optional(),
  }),
});

export const compareMandisSchema = z.object({
  body: z.object({
    crop: z.string().min(1, 'Crop name is required'),
    quantityQuintals: z.number().positive('Quantity must be greater than zero'),
    farmerLocation: z
      .object({
        lat: z.number(),
        lng: z.number(),
      })
      .optional(),
    farmerDistrict: z.string().optional(),
    customFreightRate: z.number().positive().optional(),
    handlingChargePerQuintal: z.number().nonnegative().optional(),
    mandiCessPercent: z.number().nonnegative().optional(),
    maxDistanceKm: z.number().positive().optional(),
  }),
});

export class MandiController {
  /**
   * Fetch Mandi Prices for UP with filters
   */
  public static async getPrices(req: Request, res: Response, next: NextFunction) {
    try {
      const { crop, commodity, district, market, search } = req.query as Record<string, string>;

      const commodityName = crop || commodity;
      const prices = await MandiService.getPrices({
        commodity: commodityName,
        district,
        market,
        search,
      });

      return res.json({
        success: true,
        count: prices.length,
        filters: { commodity: commodityName, district, market, search },
        data: prices,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Fetch available commodities in UP
   */
  public static async getCommodities(req: Request, res: Response, next: NextFunction) {
    try {
      const commodities = await MandiService.getDistinctCommodities();
      return res.json({
        success: true,
        count: commodities.length,
        data: commodities,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Fetch UP districts and their markets
   */
  public static async getDistrictsAndMarkets(req: Request, res: Response, next: NextFunction) {
    try {
      const map = await MandiService.getDistrictsAndMarkets();
      return res.json({
        success: true,
        data: map,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Calculate distance between coordinates
   */
  public static calculateDistance(req: Request, res: Response, next: NextFunction) {
    try {
      const { from, to } = req.body;
      const distanceKm = CalculatorService.calculateHaversineDistance(from, to);

      return res.json({
        success: true,
        data: {
          from,
          to,
          distanceKm,
          unit: 'kilometers',
        },
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Calculate Net Realization for given parameters
   */
  public static calculateNetRealization(req: Request, res: Response, next: NextFunction) {
    try {
      const result = CalculatorService.calculateNetRealization(req.body);

      return res.json({
        success: true,
        message: 'Net realization calculated successfully',
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Compare multiple Mandis and identify the optimal highest-earning mandi
   */
  public static async compareMandis(req: Request, res: Response, next: NextFunction) {
    try {
      const {
        crop,
        quantityQuintals,
        farmerLocation,
        farmerDistrict,
        customFreightRate,
        handlingChargePerQuintal,
        mandiCessPercent,
        maxDistanceKm,
      } = req.body;

      // Determine farmer's starting coordinate
      let coord = farmerLocation;
      if (!coord && farmerDistrict) {
        coord = MandiService.getCoordinatesForDistrict(farmerDistrict);
      }
      if (!coord && req.user) {
        coord = MandiService.getCoordinatesForDistrict(req.user.district);
      }
      if (!coord) {
        // Fallback default: Lucknow center
        coord = { lat: 26.8467, lng: 80.9462 };
      }

      const comparison = await MandiService.compareMandis({
        crop,
        quantityQuintals,
        farmerCoord: coord,
        customFreightRate,
        handlingChargePerQuintal,
        mandiCessPercent,
        maxDistanceKm,
      });

      return res.json({
        success: true,
        farmerLocationUsed: coord,
        data: comparison,
      });
    } catch (error: any) {
      return res.status(400).json({
        success: false,
        message: error.message || 'Mandi comparison failed',
      });
    }
  }
}
