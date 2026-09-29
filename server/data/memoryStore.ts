import bcrypt from 'bcryptjs';
import { INITIAL_UP_MANDI_DATA, MandiRecord } from '../data/upMandiData.ts';

export interface MemoryUser {
  _id: string;
  name: string;
  mobile: string;
  email?: string;
  passwordHash: string;
  role: 'farmer' | 'buyer' | 'admin';
  state: string;
  district: string;
  villageOrTehsil?: string;
  coordinates: { lat: number; lng: number };
  farmSizeAcres?: number;
  primaryCrops?: string[];
  companyName?: string;
  gstin?: string;
  buyerType?: 'trader' | 'wholesaler' | 'processor' | 'exporter' | 'retailer';
  isVerifiedBuyer: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface MemoryCropListing {
  _id: string;
  farmerId: string;
  farmerName: string;
  farmerMobile: string;
  cropName: string;
  variety: string;
  quantityQuintals: number;
  expectedPricePerQuintal: number;
  qualityGrade: 'A' | 'B' | 'C' | 'Organic';
  district: string;
  village: string;
  coordinates: { lat: number; lng: number };
  description?: string;
  status: 'active' | 'in_negotiation' | 'sold' | 'expired';
  createdAt: Date;
  updatedAt: Date;
}

export interface MemoryBuyerOffer {
  _id: string;
  buyerId: string;
  buyerName: string;
  companyName: string;
  buyerMobile: string;
  cropRequired: string;
  variety?: string;
  quantityRequiredQuintals: number;
  offeredPricePerQuintal: number;
  deliveryLocation: string;
  deliveryCoordinates: { lat: number; lng: number };
  pickupProvided: boolean;
  status: 'open' | 'fulfilled' | 'closed';
  validUntil: Date;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

class MemoryStore {
  public users: Map<string, MemoryUser> = new Map();
  public cropListings: Map<string, MemoryCropListing> = new Map();
  public buyerOffers: Map<string, MemoryBuyerOffer> = new Map();
  public mandiPrices: MandiRecord[] = [...INITIAL_UP_MANDI_DATA];

  constructor() {
    this.seedDefaults();
  }

  private seedDefaults() {
    const salt = bcrypt.genSaltSync(10);

    // Default Demo Farmer
    const farmerId = 'farmer_demo_101';
    this.users.set(farmerId, {
      _id: farmerId,
      name: 'Rameshwar Singh Yadav',
      mobile: '9876543210',
      email: 'rameshwar@farmer.up.in',
      passwordHash: bcrypt.hashSync('farmer123', salt),
      role: 'farmer',
      state: 'Uttar Pradesh',
      district: 'Sitapur',
      villageOrTehsil: 'Sidhauli Tehsil',
      coordinates: { lat: 27.2796, lng: 80.8413 }, // Sidhauli, Sitapur
      farmSizeAcres: 6.5,
      primaryCrops: ['Wheat', 'Paddy', 'Mustard'],
      isVerifiedBuyer: false,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    // Default Demo Buyer
    const buyerId = 'buyer_demo_201';
    this.users.set(buyerId, {
      _id: buyerId,
      name: 'Vikram Agrawal',
      mobile: '9811223344',
      email: 'vikram@avadhagro.com',
      passwordHash: bcrypt.hashSync('buyer123', salt),
      role: 'buyer',
      state: 'Uttar Pradesh',
      district: 'Lucknow',
      villageOrTehsil: 'Dubagga Industrial Area',
      coordinates: { lat: 26.8647, lng: 80.8920 },
      companyName: 'Avadh Agro Mills & Traders Pvt Ltd',
      gstin: '09AAACA1234A1Z5',
      buyerType: 'wholesaler',
      isVerifiedBuyer: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    // Default Unverified Buyer for Admin verification testing
    const pendingBuyerId = 'buyer_pending_202';
    this.users.set(pendingBuyerId, {
      _id: pendingBuyerId,
      name: 'Kisan Export Corporation',
      mobile: '9922334455',
      email: 'procure@kisanexport.in',
      passwordHash: bcrypt.hashSync('buyer123', salt),
      role: 'buyer',
      state: 'Uttar Pradesh',
      district: 'Kanpur',
      coordinates: { lat: 26.4499, lng: 80.3319 },
      companyName: 'Kisan Exporters Kanpur',
      gstin: '09AAZCK5678B1Z2',
      buyerType: 'exporter',
      isVerifiedBuyer: false,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    // Default Admin
    const adminId = 'admin_demo_999';
    this.users.set(adminId, {
      _id: adminId,
      name: 'UP Mandi Parishad Admin',
      mobile: '9000000000',
      email: 'admin@mitti2market.up.gov.in',
      passwordHash: bcrypt.hashSync('admin123', salt),
      role: 'admin',
      state: 'Uttar Pradesh',
      district: 'Lucknow',
      coordinates: { lat: 26.8467, lng: 80.9462 },
      isVerifiedBuyer: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    // Seed Initial Crop Listing
    const cropId = 'crop_listing_1';
    this.cropListings.set(cropId, {
      _id: cropId,
      farmerId: farmerId,
      farmerName: 'Rameshwar Singh Yadav',
      farmerMobile: '9876543210',
      cropName: 'Wheat',
      variety: 'Sharbati A-Grade',
      quantityQuintals: 120,
      expectedPricePerQuintal: 2550,
      qualityGrade: 'A',
      district: 'Sitapur',
      village: 'Sidhauli',
      coordinates: { lat: 27.2796, lng: 80.8413 },
      description: 'Golden Sharbati wheat, freshly harvested, clean, moisture < 12%',
      status: 'active',
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    // Seed Initial Buyer Offer
    const offerId = 'buyer_offer_1';
    this.buyerOffers.set(offerId, {
      _id: offerId,
      buyerId: buyerId,
      buyerName: 'Vikram Agrawal',
      companyName: 'Avadh Agro Mills & Traders Pvt Ltd',
      buyerMobile: '9811223344',
      cropRequired: 'Wheat',
      variety: 'Lokwan or Sharbati',
      quantityRequiredQuintals: 500,
      offeredPricePerQuintal: 2520,
      deliveryLocation: 'Avadh Warehouse, Transport Nagar, Lucknow',
      deliveryCoordinates: { lat: 26.7901, lng: 80.8900 },
      pickupProvided: true,
      status: 'open',
      validUntil: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
      notes: 'Payment within 24 hours of weighing. Direct digital transfer to farmer bank account.',
      createdAt: new Date(),
      updatedAt: new Date(),
    });
  }
}

export const memoryStore = new MemoryStore();
