import { Request, Response, NextFunction } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { z } from 'zod';
import { config } from '../config/env.ts';
import { memoryStore, MemoryUser } from '../data/memoryStore.ts';
import { isDbConnected } from '../config/db.ts';
import { UserModel, IUser } from '../models/User.ts';
import { MandiService } from '../services/mandiService.ts';

// Validation Schemas
export const farmerRegisterSchema = z.object({
  body: z.object({
    name: z.string().min(2, 'Name must be at least 2 characters'),
    mobile: z.string().regex(/^[6-9]\d{9}$/, 'Invalid 10-digit Indian mobile number'),
    password: z.string().min(6, 'Password must be at least 6 characters'),
    email: z.string().email().optional(),
    district: z.string().min(2, 'District is required'),
    villageOrTehsil: z.string().optional(),
    farmSizeAcres: z.number().nonnegative().optional(),
    primaryCrops: z.array(z.string()).optional(),
    coordinates: z
      .object({
        lat: z.number(),
        lng: z.number(),
      })
      .optional(),
  }),
});

export const buyerRegisterSchema = z.object({
  body: z.object({
    name: z.string().min(2, 'Name must be at least 2 characters'),
    mobile: z.string().regex(/^[6-9]\d{9}$/, 'Invalid 10-digit Indian mobile number'),
    password: z.string().min(6, 'Password must be at least 6 characters'),
    email: z.string().email().optional(),
    companyName: z.string().min(2, 'Company / Trader name is required'),
    gstin: z.string().regex(/^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/, 'Invalid Indian GSTIN format').optional().or(z.literal('')),
    buyerType: z.enum(['trader', 'wholesaler', 'processor', 'exporter', 'retailer']).default('wholesaler'),
    district: z.string().min(2, 'District is required'),
    villageOrTehsil: z.string().optional(),
    coordinates: z
      .object({
        lat: z.number(),
        lng: z.number(),
      })
      .optional(),
  }),
});

export const loginSchema = z.object({
  body: z.object({
    mobile: z.string().regex(/^[6-9]\d{9}$/, 'Invalid 10-digit Indian mobile number'),
    password: z.string().min(1, 'Password is required'),
  }),
});

export const updateProfileSchema = z.object({
  body: z.object({
    name: z.string().min(2).optional(),
    email: z.string().email().optional(),
    district: z.string().optional(),
    villageOrTehsil: z.string().optional(),
    farmSizeAcres: z.number().optional(),
    primaryCrops: z.array(z.string()).optional(),
    companyName: z.string().optional(),
    coordinates: z
      .object({
        lat: z.number(),
        lng: z.number(),
      })
      .optional(),
  }),
});

export class AuthController {
  /**
   * Helper to issue signed JWT token
   */
  private static generateToken(user: { id: string; role: any; mobile: string; name: string; district: string }): string {
    return jwt.sign(
      {
        userId: user.id,
        role: user.role,
        mobile: user.mobile,
        name: user.name,
        district: user.district,
      },
      config.jwtSecret,
      { expiresIn: config.jwtExpiresIn as any }
    );
  }

  /**
   * Register a Farmer
   */
  public static async registerFarmer(req: Request, res: Response, next: NextFunction) {
    try {
      const {
        name,
        mobile,
        password,
        email,
        district,
        villageOrTehsil,
        farmSizeAcres,
        primaryCrops,
        coordinates,
      } = req.body;

      // Coordinate fallback from district if not provided
      const resolvedCoord = coordinates || MandiService.getCoordinatesForDistrict(district);
      const salt = await bcrypt.genSalt(10);
      const passwordHash = await bcrypt.hash(password, salt);

      if (isDbConnected()) {
        const existing = await UserModel.findOne({ mobile });
        if (existing) {
          return res.status(409).json({ success: false, message: 'User with this mobile number already exists' });
        }

        const newUser: IUser = await UserModel.create({
          name,
          mobile,
          email,
          passwordHash,
          role: 'farmer',
          state: 'Uttar Pradesh',
          district,
          villageOrTehsil,
          coordinates: resolvedCoord,
          farmSizeAcres: farmSizeAcres || 0,
          primaryCrops: primaryCrops || [],
          isVerifiedBuyer: false,
        });

        const token = AuthController.generateToken({
          id: newUser._id.toString(),
          role: newUser.role,
          mobile: newUser.mobile,
          name: newUser.name,
          district: newUser.district,
        });

        return res.status(201).json({
          success: true,
          message: 'Farmer registered successfully',
          data: {
            token,
            user: {
              id: newUser._id,
              name: newUser.name,
              mobile: newUser.mobile,
              role: newUser.role,
              district: newUser.district,
              coordinates: newUser.coordinates,
            },
          },
        });
      }

      // Memory Store Fallback
      for (const u of memoryStore.users.values()) {
        if (u.mobile === mobile) {
          return res.status(409).json({ success: false, message: 'User with this mobile number already exists' });
        }
      }

      const id = 'farmer_' + Date.now();
      const memoryUser: MemoryUser = {
        _id: id,
        name,
        mobile,
        email,
        passwordHash,
        role: 'farmer',
        state: 'Uttar Pradesh',
        district,
        villageOrTehsil,
        coordinates: resolvedCoord,
        farmSizeAcres: farmSizeAcres || 0,
        primaryCrops: primaryCrops || [],
        isVerifiedBuyer: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      memoryStore.users.set(id, memoryUser);

      const token = AuthController.generateToken({
        id,
        role: 'farmer',
        mobile,
        name,
        district,
      });

      return res.status(201).json({
        success: true,
        message: 'Farmer registered successfully',
        data: {
          token,
          user: {
            id,
            name,
            mobile,
            role: 'farmer',
            district,
            coordinates: resolvedCoord,
          },
        },
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Register a Buyer / Agribusiness Trader
   */
  public static async registerBuyer(req: Request, res: Response, next: NextFunction) {
    try {
      const {
        name,
        mobile,
        password,
        email,
        companyName,
        gstin,
        buyerType,
        district,
        villageOrTehsil,
        coordinates,
      } = req.body;

      const resolvedCoord = coordinates || MandiService.getCoordinatesForDistrict(district);
      const salt = await bcrypt.genSalt(10);
      const passwordHash = await bcrypt.hash(password, salt);

      if (isDbConnected()) {
        const existing = await UserModel.findOne({ mobile });
        if (existing) {
          return res.status(409).json({ success: false, message: 'User with this mobile number already exists' });
        }

        const newUser: IUser = await UserModel.create({
          name,
          mobile,
          email,
          passwordHash,
          role: 'buyer',
          state: 'Uttar Pradesh',
          district,
          villageOrTehsil,
          coordinates: resolvedCoord,
          companyName,
          gstin,
          buyerType: buyerType || 'wholesaler',
          isVerifiedBuyer: false, // Must be verified by Admin or auto-checked
        });

        const token = AuthController.generateToken({
          id: newUser._id.toString(),
          role: newUser.role,
          mobile: newUser.mobile,
          name: newUser.name,
          district: newUser.district,
        });

        return res.status(201).json({
          success: true,
          message: 'Buyer registered successfully. Account is pending verification.',
          data: {
            token,
            user: {
              id: newUser._id,
              name: newUser.name,
              companyName: newUser.companyName,
              mobile: newUser.mobile,
              role: newUser.role,
              isVerifiedBuyer: newUser.isVerifiedBuyer,
            },
          },
        });
      }

      // Memory Store Fallback
      for (const u of memoryStore.users.values()) {
        if (u.mobile === mobile) {
          return res.status(409).json({ success: false, message: 'User with this mobile number already exists' });
        }
      }

      const id = 'buyer_' + Date.now();
      const memoryUser: MemoryUser = {
        _id: id,
        name,
        mobile,
        email,
        passwordHash,
        role: 'buyer',
        state: 'Uttar Pradesh',
        district,
        villageOrTehsil,
        coordinates: resolvedCoord,
        companyName,
        gstin,
        buyerType: buyerType || 'wholesaler',
        isVerifiedBuyer: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      memoryStore.users.set(id, memoryUser);

      const token = AuthController.generateToken({
        id,
        role: 'buyer',
        mobile,
        name,
        district,
      });

      return res.status(201).json({
        success: true,
        message: 'Buyer registered successfully. Verification pending.',
        data: {
          token,
          user: {
            id,
            name,
            companyName,
            mobile,
            role: 'buyer',
            isVerifiedBuyer: false,
          },
        },
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Unified Login for Farmers, Buyers, and Admins
   */
  public static async login(req: Request, res: Response, next: NextFunction) {
    try {
      const { mobile, password } = req.body;

      let userFound: any = null;

      if (isDbConnected()) {
        userFound = await UserModel.findOne({ mobile });
      }

      if (!userFound) {
        for (const u of memoryStore.users.values()) {
          if (u.mobile === mobile) {
            userFound = u;
            break;
          }
        }
      }

      if (!userFound) {
        return res.status(401).json({
          success: false,
          message: 'Invalid mobile number or credentials',
        });
      }

      const isMatch = await bcrypt.compare(password, userFound.passwordHash);
      if (!isMatch) {
        return res.status(401).json({
          success: false,
          message: 'Invalid mobile number or credentials',
        });
      }

      const userId = userFound._id ? userFound._id.toString() : userFound.id;
      const token = AuthController.generateToken({
        id: userId,
        role: userFound.role,
        mobile: userFound.mobile,
        name: userFound.name,
        district: userFound.district,
      });

      return res.json({
        success: true,
        message: 'Login successful',
        data: {
          token,
          user: {
            id: userId,
            name: userFound.name,
            mobile: userFound.mobile,
            role: userFound.role,
            district: userFound.district,
            coordinates: userFound.coordinates,
            isVerifiedBuyer: userFound.isVerifiedBuyer,
            companyName: userFound.companyName,
          },
        },
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get Current Authenticated Profile
   */
  public static async getProfile(req: Request, res: Response, next: NextFunction) {
    try {
      const authUser = req.user!;
      let profile: any = null;

      if (isDbConnected()) {
        profile = await UserModel.findById(authUser.userId).select('-passwordHash').lean();
      }

      if (!profile) {
        profile = memoryStore.users.get(authUser.userId);
      }

      if (!profile) {
        return res.status(404).json({ success: false, message: 'Profile not found' });
      }

      const { passwordHash, ...sanitized } = profile;
      return res.json({
        success: true,
        data: sanitized,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Update Profile Details
   */
  public static async updateProfile(req: Request, res: Response, next: NextFunction) {
    try {
      const authUser = req.user!;
      const updateData = req.body;

      if (isDbConnected()) {
        const updated = await UserModel.findByIdAndUpdate(authUser.userId, updateData, { new: true })
          .select('-passwordHash')
          .lean();
        if (updated) {
          return res.json({ success: true, message: 'Profile updated', data: updated });
        }
      }

      const memUser = memoryStore.users.get(authUser.userId);
      if (!memUser) {
        return res.status(404).json({ success: false, message: 'User not found' });
      }

      const merged = { ...memUser, ...updateData, updatedAt: new Date() };
      memoryStore.users.set(authUser.userId, merged);

      const { passwordHash, ...sanitized } = merged;
      return res.json({ success: true, message: 'Profile updated', data: sanitized });
    } catch (error) {
      next(error);
    }
  }
}
