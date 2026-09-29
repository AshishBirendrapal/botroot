import mongoose, { Document, Schema } from 'mongoose';

export interface ICropListing extends Document {
  farmerId: string;
  farmerName: string;
  farmerMobile: string;
  cropName: string;
  variety: string;
  quantityQuintals: number;
  expectedPricePerQuintal: number;
  harvestDate?: Date;
  qualityGrade: 'A' | 'B' | 'C' | 'Organic';
  district: string;
  village: string;
  coordinates: {
    lat: number;
    lng: number;
  };
  description?: string;
  status: 'active' | 'in_negotiation' | 'sold' | 'expired';
  createdAt: Date;
  updatedAt: Date;
}

const CropListingSchema = new Schema<ICropListing>(
  {
    farmerId: { type: String, required: true },
    farmerName: { type: String, required: true },
    farmerMobile: { type: String, required: true },
    cropName: { type: String, required: true, trim: true },
    variety: { type: String, required: true, trim: true },
    quantityQuintals: { type: Number, required: true, min: 0.1 },
    expectedPricePerQuintal: { type: Number, required: true, min: 1 },
    harvestDate: { type: Date },
    qualityGrade: { type: String, enum: ['A', 'B', 'C', 'Organic'], default: 'A' },
    district: { type: String, required: true },
    village: { type: String, default: '' },
    coordinates: {
      lat: { type: Number, required: true },
      lng: { type: Number, required: true },
    },
    description: { type: String },
    status: { type: String, enum: ['active', 'in_negotiation', 'sold', 'expired'], default: 'active' },
  },
  { timestamps: true }
);

export const CropListingModel =
  mongoose.models.CropListing || mongoose.model<ICropListing>('CropListing', CropListingSchema);
