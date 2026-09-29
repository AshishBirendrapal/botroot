import mongoose, { Document, Schema } from 'mongoose';

export interface IMandiPrice extends Document {
  state: string;
  district: string;
  market: string;
  commodity: string;
  variety: string;
  arrivalDate: string;
  minPrice: number;
  maxPrice: number;
  modalPrice: number;
  coordinates: {
    lat: number;
    lng: number;
  };
  createdAt: Date;
  updatedAt: Date;
}

const MandiPriceSchema = new Schema<IMandiPrice>(
  {
    state: { type: String, default: 'Uttar Pradesh' },
    district: { type: String, required: true },
    market: { type: String, required: true },
    commodity: { type: String, required: true },
    variety: { type: String, default: 'General' },
    arrivalDate: { type: String, required: true },
    minPrice: { type: Number, required: true },
    maxPrice: { type: Number, required: true },
    modalPrice: { type: Number, required: true },
    coordinates: {
      lat: { type: Number, required: true },
      lng: { type: Number, required: true },
    },
  },
  { timestamps: true }
);

MandiPriceSchema.index({ district: 1, market: 1, commodity: 1 });

export const MandiPriceModel =
  mongoose.models.MandiPrice || mongoose.model<IMandiPrice>('MandiPrice', MandiPriceSchema);
