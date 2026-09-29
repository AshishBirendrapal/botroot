import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { isDbConnected } from '../config/db.ts';
import { CropListingModel, ICropListing } from '../models/CropListing.ts';
import { memoryStore, MemoryCropListing } from '../data/memoryStore.ts';
import { MandiService } from '../services/mandiService.ts';

export const createCropSchema = z.object({
  body: z.object({
    cropName: z.string().min(2, 'Crop name is required'),
    variety: z.string().default('General'),
    quantityQuintals: z.number().positive('Quantity must be greater than zero'),
    expectedPricePerQuintal: z.number().positive('Price must be greater than zero'),
    qualityGrade: z.enum(['A', 'B', 'C', 'Organic']).default('A'),
    district: z.string().min(2, 'District is required'),
    village: z.string().optional().default(''),
    coordinates: z
      .object({
        lat: z.number(),
        lng: z.number(),
      })
      .optional(),
    harvestDate: z.string().optional(),
    description: z.string().optional(),
  }),
});

export const updateCropSchema = z.object({
  body: z.object({
    cropName: z.string().optional(),
    variety: z.string().optional(),
    quantityQuintals: z.number().positive().optional(),
    expectedPricePerQuintal: z.number().positive().optional(),
    qualityGrade: z.enum(['A', 'B', 'C', 'Organic']).optional(),
    status: z.enum(['active', 'in_negotiation', 'sold', 'expired']).optional(),
    description: z.string().optional(),
  }),
});

export class CropController {
  /**
   * Farmer posts a crop listing
   */
  public static async createCrop(req: Request, res: Response, next: NextFunction) {
    try {
      const authUser = req.user!;
      const {
        cropName,
        variety,
        quantityQuintals,
        expectedPricePerQuintal,
        qualityGrade,
        district,
        village,
        coordinates,
        harvestDate,
        description,
      } = req.body;

      const coord = coordinates || MandiService.getCoordinatesForDistrict(district);

      if (isDbConnected()) {
        const crop: ICropListing = await CropListingModel.create({
          farmerId: authUser.userId,
          farmerName: authUser.name,
          farmerMobile: authUser.mobile,
          cropName,
          variety: variety || 'Standard',
          quantityQuintals,
          expectedPricePerQuintal,
          qualityGrade: qualityGrade || 'A',
          district,
          village: village || '',
          coordinates: coord,
          harvestDate: harvestDate ? new Date(harvestDate) : undefined,
          description,
          status: 'active',
        });

        return res.status(201).json({
          success: true,
          message: 'Crop listed successfully',
          data: crop,
        });
      }

      // Memory Store
      const id = 'crop_' + Date.now();
      const memCrop: MemoryCropListing = {
        _id: id,
        farmerId: authUser.userId,
        farmerName: authUser.name,
        farmerMobile: authUser.mobile,
        cropName,
        variety: variety || 'Standard',
        quantityQuintals,
        expectedPricePerQuintal,
        qualityGrade: qualityGrade || 'A',
        district,
        village: village || '',
        coordinates: coord,
        description,
        status: 'active',
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      memoryStore.cropListings.set(id, memCrop);

      return res.status(201).json({
        success: true,
        message: 'Crop listed successfully',
        data: memCrop,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Browse all active crop listings (for buyers and marketplace visitors)
   */
  public static async getAllCrops(req: Request, res: Response, next: NextFunction) {
    try {
      const { crop, district, grade } = req.query as Record<string, string>;

      if (isDbConnected()) {
        const filter: any = { status: 'active' };
        if (crop) filter.cropName = new RegExp(crop, 'i');
        if (district) filter.district = new RegExp(district, 'i');
        if (grade) filter.qualityGrade = grade;

        const crops = await CropListingModel.find(filter).sort({ createdAt: -1 }).lean();
        return res.json({ success: true, count: crops.length, data: crops });
      }

      let crops = Array.from(memoryStore.cropListings.values()).filter((c) => c.status === 'active');
      if (crop) crops = crops.filter((c) => c.cropName.toLowerCase().includes(crop.toLowerCase()));
      if (district) crops = crops.filter((c) => c.district.toLowerCase().includes(district.toLowerCase()));
      if (grade) crops = crops.filter((c) => c.qualityGrade === grade);

      return res.json({
        success: true,
        count: crops.length,
        data: crops,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get logged-in farmer's crop listings
   */
  public static async getMyCrops(req: Request, res: Response, next: NextFunction) {
    try {
      const authUser = req.user!;

      if (isDbConnected()) {
        const crops = await CropListingModel.find({ farmerId: authUser.userId }).sort({ createdAt: -1 }).lean();
        return res.json({ success: true, count: crops.length, data: crops });
      }

      const crops = Array.from(memoryStore.cropListings.values()).filter(
        (c) => c.farmerId === authUser.userId
      );

      return res.json({
        success: true,
        count: crops.length,
        data: crops,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get crop by ID
   */
  public static async getCropById(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;

      if (isDbConnected()) {
        const crop = await CropListingModel.findById(id).lean();
        if (crop) return res.json({ success: true, data: crop });
      }

      const crop = memoryStore.cropListings.get(id);
      if (!crop) {
        return res.status(404).json({ success: false, message: 'Crop listing not found' });
      }

      return res.json({ success: true, data: crop });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Update crop listing
   */
  public static async updateCrop(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const authUser = req.user!;

      if (isDbConnected()) {
        const crop = await CropListingModel.findById(id);
        if (!crop) return res.status(404).json({ success: false, message: 'Listing not found' });
        if (crop.farmerId !== authUser.userId && authUser.role !== 'admin') {
          return res.status(403).json({ success: false, message: 'Unauthorized to modify this listing' });
        }

        Object.assign(crop, req.body);
        await crop.save();
        return res.json({ success: true, message: 'Listing updated', data: crop });
      }

      const crop = memoryStore.cropListings.get(id);
      if (!crop) return res.status(404).json({ success: false, message: 'Listing not found' });
      if (crop.farmerId !== authUser.userId && authUser.role !== 'admin') {
        return res.status(403).json({ success: false, message: 'Unauthorized to modify this listing' });
      }

      const updated = { ...crop, ...req.body, updatedAt: new Date() };
      memoryStore.cropListings.set(id, updated);

      return res.json({ success: true, message: 'Listing updated', data: updated });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Delete crop listing
   */
  public static async deleteCrop(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const authUser = req.user!;

      if (isDbConnected()) {
        const crop = await CropListingModel.findById(id);
        if (!crop) return res.status(404).json({ success: false, message: 'Listing not found' });
        if (crop.farmerId !== authUser.userId && authUser.role !== 'admin') {
          return res.status(403).json({ success: false, message: 'Unauthorized' });
        }

        await CropListingModel.findByIdAndDelete(id);
        return res.json({ success: true, message: 'Listing deleted successfully' });
      }

      const crop = memoryStore.cropListings.get(id);
      if (!crop) return res.status(404).json({ success: false, message: 'Listing not found' });
      if (crop.farmerId !== authUser.userId && authUser.role !== 'admin') {
        return res.status(403).json({ success: false, message: 'Unauthorized' });
      }

      memoryStore.cropListings.delete(id);
      return res.json({ success: true, message: 'Listing deleted successfully' });
    } catch (error) {
      next(error);
    }
  }
}
