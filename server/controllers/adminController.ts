import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { isDbConnected } from '../config/db.ts';
import { UserModel } from '../models/User.ts';
import { CropListingModel } from '../models/CropListing.ts';
import { BuyerOfferModel } from '../models/BuyerOffer.ts';
import { memoryStore } from '../data/memoryStore.ts';
import { INITIAL_UP_MANDI_DATA } from '../data/upMandiData.ts';
import { MandiPriceModel } from '../models/MandiPrice.ts';

export const verifyBuyerSchema = z.object({
  params: z.object({
    id: z.string().min(1),
  }),
  body: z.object({
    verify: z.boolean(),
  }),
});

export class AdminController {
  /**
   * Platform-wide aggregated statistics
   */
  public static async getStats(req: Request, res: Response, next: NextFunction) {
    try {
      if (isDbConnected()) {
        const [totalFarmers, totalBuyers, pendingBuyers, totalCrops, totalOffers] =
          await Promise.all([
            UserModel.countDocuments({ role: 'farmer' }),
            UserModel.countDocuments({ role: 'buyer' }),
            UserModel.countDocuments({ role: 'buyer', isVerifiedBuyer: false }),
            CropListingModel.countDocuments(),
            BuyerOfferModel.countDocuments(),
          ]);

        return res.json({
          success: true,
          data: {
            users: {
              farmers: totalFarmers,
              buyers: totalBuyers,
              pendingVerificationBuyers: pendingBuyers,
            },
            market: {
              activeCropListings: totalCrops,
              activeBuyerOffers: totalOffers,
              mandiCentresTracked: 37,
            },
          },
        });
      }

      const users = Array.from(memoryStore.users.values());
      const farmers = users.filter((u) => u.role === 'farmer').length;
      const buyers = users.filter((u) => u.role === 'buyer').length;
      const pendingBuyers = users.filter((u) => u.role === 'buyer' && !u.isVerifiedBuyer).length;
      const activeCrops = Array.from(memoryStore.cropListings.values()).length;
      const activeOffers = Array.from(memoryStore.buyerOffers.values()).length;

      return res.json({
        success: true,
        data: {
          users: {
            farmers,
            buyers,
            pendingVerificationBuyers: pendingBuyers,
          },
          market: {
            activeCropListings: activeCrops,
            activeBuyerOffers: activeOffers,
            mandiCentresTracked: memoryStore.mandiPrices.length,
          },
        },
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * List buyers awaiting verification
   */
  public static async getPendingBuyers(req: Request, res: Response, next: NextFunction) {
    try {
      if (isDbConnected()) {
        const pending = await UserModel.find({ role: 'buyer', isVerifiedBuyer: false })
          .select('-passwordHash')
          .lean();
        return res.json({ success: true, count: pending.length, data: pending });
      }

      const pending = Array.from(memoryStore.users.values())
        .filter((u) => u.role === 'buyer' && !u.isVerifiedBuyer)
        .map(({ passwordHash, ...rest }) => rest);

      return res.json({
        success: true,
        count: pending.length,
        data: pending,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Verify or reject a buyer KYC/GSTIN
   */
  public static async verifyBuyer(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const { verify } = req.body;

      if (isDbConnected()) {
        const buyer = await UserModel.findById(id);
        if (!buyer) return res.status(404).json({ success: false, message: 'Buyer not found' });

        buyer.isVerifiedBuyer = verify;
        buyer.verifiedAt = verify ? new Date() : undefined;
        await buyer.save();

        return res.json({
          success: true,
          message: `Buyer ${verify ? 'verified and authorized' : 'unverified'} successfully`,
          data: {
            id: buyer._id,
            name: buyer.name,
            companyName: buyer.companyName,
            isVerifiedBuyer: buyer.isVerifiedBuyer,
          },
        });
      }

      const buyer = memoryStore.users.get(id);
      if (!buyer) return res.status(404).json({ success: false, message: 'Buyer not found' });

      buyer.isVerifiedBuyer = verify;
      buyer.updatedAt = new Date();
      memoryStore.users.set(id, buyer);

      return res.json({
        success: true,
        message: `Buyer ${verify ? 'verified and authorized' : 'unverified'} successfully`,
        data: {
          id: buyer._id,
          name: buyer.name,
          companyName: buyer.companyName,
          isVerifiedBuyer: buyer.isVerifiedBuyer,
        },
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Synchronize or seed Mandi Prices
   */
  public static async syncMandiData(req: Request, res: Response, next: NextFunction) {
    try {
      if (isDbConnected()) {
        // Bulk upsert initial data
        const ops = INITIAL_UP_MANDI_DATA.map((record) => ({
          updateOne: {
            filter: {
              district: record.district,
              market: record.market,
              commodity: record.commodity,
              arrivalDate: record.arrivalDate,
            },
            update: {
              $set: {
                state: record.state,
                variety: record.variety,
                minPrice: record.minPrice,
                maxPrice: record.maxPrice,
                modalPrice: record.modalPrice,
                coordinates: { lat: record.lat, lng: record.lng },
              },
            },
            upsert: true,
          },
        }));

        await MandiPriceModel.bulkWrite(ops);
      }

      memoryStore.mandiPrices = [...INITIAL_UP_MANDI_DATA];

      return res.json({
        success: true,
        message: 'Mandi price sync completed successfully',
        syncedCount: INITIAL_UP_MANDI_DATA.length,
      });
    } catch (error) {
      next(error);
    }
  }
}
