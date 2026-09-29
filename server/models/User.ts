import mongoose, { Document, Schema } from 'mongoose';

export type UserRole = 'farmer' | 'buyer' | 'admin';

export interface IUser extends Document {
  id?: string;
  name: string;
  mobile: string;
  email?: string;
  passwordHash: string;
  role: UserRole;
  state: string;
  district: string;
  villageOrTehsil?: string;
  coordinates: {
    lat: number;
    lng: number;
  };
  // Farmer Specific
  farmSizeAcres?: number;
  primaryCrops?: string[];
  kisanCreditCardNumber?: string;
  
  // Buyer Specific
  companyName?: string;
  gstin?: string;
  buyerType?: 'trader' | 'wholesaler' | 'processor' | 'exporter' | 'retailer';
  isVerifiedBuyer: boolean;
  verifiedAt?: Date;

  createdAt: Date;
  updatedAt: Date;
}

const UserSchema = new Schema<IUser>(
  {
    name: { type: String, required: true, trim: true },
    mobile: { type: String, required: true, unique: true, trim: true },
    email: { type: String, lowercase: true, trim: true },
    passwordHash: { type: String, required: true },
    role: { type: String, enum: ['farmer', 'buyer', 'admin'], default: 'farmer' },
    state: { type: String, default: 'Uttar Pradesh' },
    district: { type: String, required: true, trim: true },
    villageOrTehsil: { type: String, trim: true },
    coordinates: {
      lat: { type: Number, required: true, default: 26.8467 },
      lng: { type: Number, required: true, default: 80.9462 },
    },
    // Farmer fields
    farmSizeAcres: { type: Number, default: 0 },
    primaryCrops: [{ type: String }],
    kisanCreditCardNumber: { type: String },

    // Buyer fields
    companyName: { type: String },
    gstin: { type: String },
    buyerType: { type: String, enum: ['trader', 'wholesaler', 'processor', 'exporter', 'retailer'] },
    isVerifiedBuyer: { type: Boolean, default: false },
    verifiedAt: { type: Date },
  },
  { timestamps: true }
);

export const UserModel = mongoose.models.User || mongoose.model<IUser>('User', UserSchema);
