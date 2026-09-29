import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { isDbConnected } from '../config/db.ts';
import { BuyerOfferModel, IBuyerOffer } from '../models/BuyerOffer.ts';
import { UserModel } from '../models/User.ts';
import { memoryStore, MemoryBuyerOffer } from '../data/memoryStore.ts';
import { MandiService } from '../services/mandiService.ts';

export const createOfferSchema = z.object({
  body: z.object({
    cropRequired: z.string().min(2, 'Crop required is mandatory'),
    variety: z.string().optional().default('Any'),
    quantityRequiredQuintals: z.number().positive('Quantity must be greater than zero'),
    offeredPricePerQuintal: z.number().positive('Offered price must be greater than zero'),
    deliveryLocation: z.string().min(2, 'Delivery location is required'),
    deliveryCoordinates: z
      .object({
        lat: z.number(),
        lng: z.number(),
      })
      .optional(),
    pickupProvided: z.boolean().default(false),
    validUntilDays: z.number().positive().default(14),
    notes: z.string().optional(),
  }),
});

export const updateOfferSchema = z.object({
  body: z.object({
    quantityRequiredQuintals: z.number().positive().optional(),
    offeredPricePerQuintal: z.number().positive().optional(),
    pickupProvided: z.boolean().optional(),
    status: z.enum(['open', 'fulfilled', 'closed']).optional(),
    notes: z.string().optional(),
  }),
});

export class BuyerController {
  /**
   * Buyer creates a procurement offer/demand
   */
  public static async createOffer(req: Request, res: Response, next: NextFunction) {
    try {
      const authUser = req.user!;
      const {
        cropRequired,
        variety,
        quantityRequiredQuintals,
        offeredPricePerQuintal,
        deliveryLocation,
        deliveryCoordinates,
        pickupProvided,
        validUntilDays,
        notes,
      } = req.body;

      // Check if buyer is verified
      let companyName = authUser.name;
      let isVerified = false;

      if (isDbConnected()) {
        const buyerDoc = await UserModel.findById(authUser.userId);
        if (buyerDoc) {
          companyName = buyerDoc.companyName || buyerDoc.name;
          isVerified = buyerDoc.isVerifiedBuyer;
        }
      } else {
        const memUser = memoryStore.users.get(authUser.userId);
        if (memUser) {
          companyName = memUser.companyName || memUser.name;
          isVerified = memUser.isVerifiedBuyer;
        }
      }

      if (!isVerified) {
        return res.status(403).json({
          success: false,
          message:
            'Buyer account verification pending. You can create offers once approved by Admin.',
        });
      }

      const coord =
        deliveryCoordinates || MandiService.getCoordinatesForDistrict(authUser.district);
      const validUntil = new Date(Date.now() + (validUntilDays || 14) * 24 * 60 * 60 * 1000);

      if (isDbConnected()) {
        const offer: IBuyerOffer = await BuyerOfferModel.create({
          buyerId: authUser.userId,
          buyerName: authUser.name,
          companyName,
          buyerMobile: authUser.mobile,
          cropRequired,
          variety: variety || 'Any',
          quantityRequiredQuintals,
          offeredPricePerQuintal,
          deliveryLocation,
          deliveryCoordinates: coord,
          pickupProvided: Boolean(pickupProvided),
          status: 'open',
          validUntil,
          notes,
        });

        return res.status(201).json({
          success: true,
          message: 'Buyer procurement offer created successfully',
          data: offer,
        });
      }

      const id = 'offer_' + Date.now();
      const memOffer: MemoryBuyerOffer = {
        _id: id,
        buyerId: authUser.userId,
        buyerName: authUser.name,
        companyName,
        buyerMobile: authUser.mobile,
        cropRequired,
        variety: variety || 'Any',
        quantityRequiredQuintals,
        offeredPricePerQuintal,
        deliveryLocation,
        deliveryCoordinates: coord,
        pickupProvided: Boolean(pickupProvided),
        status: 'open',
        validUntil,
        notes,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      memoryStore.buyerOffers.set(id, memOffer);

      return res.status(201).json({
        success: true,
        message: 'Buyer procurement offer created successfully',
        data: memOffer,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Browse all active buyer procurement offers (accessible by farmers to view buyer demand)
   */
  public static async getAllOffers(req: Request, res: Response, next: NextFunction) {
    try {
      const { crop, pickupProvided } = req.query as Record<string, string>;

      if (isDbConnected()) {
        const filter: any = { status: 'open' };
        if (crop) filter.cropRequired = new RegExp(crop, 'i');
        if (pickupProvided !== undefined) filter.pickupProvided = pickupProvided === 'true';

        const offers = await BuyerOfferModel.find(filter).sort({ createdAt: -1 }).lean();
        return res.json({ success: true, count: offers.length, data: offers });
      }

      let offers = Array.from(memoryStore.buyerOffers.values()).filter((o) => o.status === 'open');
      if (crop) {
        offers = offers.filter((o) =>
          o.cropRequired.toLowerCase().includes(crop.toLowerCase())
        );
      }
      if (pickupProvided !== undefined) {
        const flag = pickupProvided === 'true';
        offers = offers.filter((o) => o.pickupProvided === flag);
      }

      return res.json({
        success: true,
        count: offers.length,
        data: offers,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Buyer views their own offers
   */
  public static async getMyOffers(req: Request, res: Response, next: NextFunction) {
    try {
      const authUser = req.user!;

      if (isDbConnected()) {
        const offers = await BuyerOfferModel.find({ buyerId: authUser.userId })
          .sort({ createdAt: -1 })
          .lean();
        return res.json({ success: true, count: offers.length, data: offers });
      }

      const offers = Array.from(memoryStore.buyerOffers.values()).filter(
        (o) => o.buyerId === authUser.userId
      );

      return res.json({
        success: true,
        count: offers.length,
        data: offers,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Update or close buyer offer
   */
  public static async updateOffer(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const authUser = req.user!;

      if (isDbConnected()) {
        const offer = await BuyerOfferModel.findById(id);
        if (!offer) return res.status(404).json({ success: false, message: 'Offer not found' });
        if (offer.buyerId !== authUser.userId && authUser.role !== 'admin') {
          return res.status(403).json({ success: false, message: 'Unauthorized' });
        }

        Object.assign(offer, req.body);
        await offer.save();
        return res.json({ success: true, message: 'Offer updated', data: offer });
      }

      const offer = memoryStore.buyerOffers.get(id);
      if (!offer) return res.status(404).json({ success: false, message: 'Offer not found' });
      if (offer.buyerId !== authUser.userId && authUser.role !== 'admin') {
        return res.status(403).json({ success: false, message: 'Unauthorized' });
      }

      const updated = { ...offer, ...req.body, updatedAt: new Date() };
      memoryStore.buyerOffers.set(id, updated);

      return res.json({ success: true, message: 'Offer updated', data: updated });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Delete buyer offer
   */
  public static async deleteOffer(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const authUser = req.user!;

      if (isDbConnected()) {
        const offer = await BuyerOfferModel.findById(id);
        if (!offer) return res.status(404).json({ success: false, message: 'Offer not found' });
        if (offer.buyerId !== authUser.userId && authUser.role !== 'admin') {
          return res.status(403).json({ success: false, message: 'Unauthorized' });
        }

        await BuyerOfferModel.findByIdAndDelete(id);
        return res.json({ success: true, message: 'Offer deleted successfully' });
      }

      const offer = memoryStore.buyerOffers.get(id);
      if (!offer) return res.status(404).json({ success: false, message: 'Offer not found' });
      if (offer.buyerId !== authUser.userId && authUser.role !== 'admin') {
        return res.status(403).json({ success: false, message: 'Unauthorized' });
      }

      memoryStore.buyerOffers.delete(id);
      return res.json({ success: true, message: 'Offer deleted successfully' });
    } catch (error) {
      next(error);
    }
  }
}
