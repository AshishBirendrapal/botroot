import mongoose, { Document, Schema } from 'mongoose';

export interface IBuyerOffer extends Document {
  buyerId: string;
  buyerName: string;
  companyName: string;
  buyerMobile: string;
  cropRequired: string;
  variety?: string;
  quantityRequiredQuintals: number;
  offeredPricePerQuintal: number;
  deliveryLocation: string;
  deliveryCoordinates: {
    lat: number;
    lng: number;
  };
  pickupProvided: boolean;
  status: 'open' | 'fulfilled' | 'closed';
  validUntil: Date;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

const BuyerOfferSchema = new Schema<IBuyerOffer>(
  {
    buyerId: { type: String, required: true },
    buyerName: { type: String, required: true },
    companyName: { type: String, required: true },
    buyerMobile: { type: String, required: true },
    cropRequired: { type: String, required: true, trim: true },
    variety: { type: String, trim: true },
    quantityRequiredQuintals: { type: Number, required: true, min: 0.1 },
    offeredPricePerQuintal: { type: Number, required: true, min: 1 },
    deliveryLocation: { type: String, required: true },
    deliveryCoordinates: {
      lat: { type: Number, required: true },
      lng: { type: Number, required: true },
    },
    pickupProvided: { type: Boolean, default: false },
    status: { type: String, enum: ['open', 'fulfilled', 'closed'], default: 'open' },
    validUntil: { type: Date, required: true },
    notes: { type: String },
  },
  { timestamps: true }
);

export const BuyerOfferModel =
  mongoose.models.BuyerOffer || mongoose.model<IBuyerOffer>('BuyerOffer', BuyerOfferSchema);
