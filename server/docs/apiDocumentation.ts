import { Router, Request, Response } from 'express';

const router = Router();

const API_DOCS = {
  title: 'Mitti2Market Backend REST API Documentation',
  version: '1.0.0',
  description:
    'Complete Backend API for Mitti2Market connecting Uttar Pradesh farmers with APMC Mandis and direct agribusiness buyers.',
  formulas: {
    distance: 'Haversine Great-Circle distance in km using lat/lng coordinates',
    grossSale: 'Gross Sale (₹) = Mandi Modal Rate (₹/Qtl) × Quantity (Qtl)',
    estimatedTransportCost:
      'Transport Cost (₹) = Distance (km) × Freight Rate (₹/km/Qtl) × Quantity (Qtl)',
    handlingCost: 'Handling Cost (₹) = Handling Rate (₹/Qtl) × Quantity (Qtl)',
    mandiCess: 'Mandi Cess (₹) = Gross Sale (₹) × (Mandi Cess % / 100)',
    netRealization:
      'Net Realization (₹) = Gross Sale - Transport Cost - Handling Cost - Mandi Cess - Other Charges',
    effectiveRate: 'Effective Realization per Quintal (₹/Qtl) = Net Realization / Quantity',
  },
  endpoints: [
    {
      group: 'Health & Documentation',
      routes: [
        { method: 'GET', path: '/api/health', auth: 'None', desc: 'System health, db status, uptime' },
        { method: 'GET', path: '/api/docs', auth: 'None', desc: 'API documentation JSON spec' },
      ],
    },
    {
      group: 'Authentication & Profile',
      routes: [
        {
          method: 'POST',
          path: '/api/auth/farmer/register',
          auth: 'None',
          desc: 'Register a farmer with UP district, mobile, password, farm size, coordinates',
        },
        {
          method: 'POST',
          path: '/api/auth/buyer/register',
          auth: 'None',
          desc: 'Register an agribusiness buyer/trader with GSTIN, company name, mobile, district',
        },
        {
          method: 'POST',
          path: '/api/auth/login',
          auth: 'None',
          desc: 'Unified login returning signed JWT with role (farmer, buyer, admin)',
        },
        {
          method: 'GET',
          path: '/api/auth/profile',
          auth: 'Bearer Token',
          desc: 'Fetch current authenticated user profile',
        },
        {
          method: 'PUT',
          path: '/api/auth/profile',
          auth: 'Bearer Token',
          desc: 'Update user profile (coordinates, crops, contact)',
        },
      ],
    },
    {
      group: 'Mandi Intelligence (Uttar Pradesh)',
      routes: [
        {
          method: 'GET',
          path: '/api/mandi/prices',
          auth: 'None',
          params: 'crop, district, market, search',
          desc: 'Fetch latest UP mandi prices with multi-criteria filters',
        },
        {
          method: 'GET',
          path: '/api/mandi/commodities',
          auth: 'None',
          desc: 'List distinct commodities tracked across UP mandis',
        },
        {
          method: 'GET',
          path: '/api/mandi/districts',
          auth: 'None',
          desc: 'List UP districts and registered APMC mandis',
        },
        {
          method: 'POST',
          path: '/api/mandi/distance',
          auth: 'None',
          desc: 'Calculate Haversine distance in km between two GPS coordinates',
        },
        {
          method: 'POST',
          path: '/api/mandi/calculate-net-realization',
          auth: 'None',
          desc: 'Calculate Gross Sale, Transport Cost, Mandi Cess, and Net Realization',
        },
        {
          method: 'POST',
          path: '/api/mandi/compare',
          auth: 'Optional Bearer Token',
          desc: 'Compare all UP mandis for a crop and return ranked list with highest net realization highlighted',
        },
      ],
    },
    {
      group: 'Crop Listings (Farmer)',
      routes: [
        { method: 'GET', path: '/api/crops', auth: 'None', desc: 'Browse all active crop listings' },
        { method: 'GET', path: '/api/crops/:id', auth: 'None', desc: 'Get specific crop details' },
        { method: 'POST', path: '/api/crops', auth: 'Farmer / Admin', desc: 'Farmer posts a new crop for sale' },
        { method: 'GET', path: '/api/crops/farmer/my', auth: 'Farmer / Admin', desc: 'Farmer views their listings' },
        { method: 'PUT', path: '/api/crops/:id', auth: 'Farmer / Admin', desc: 'Update crop listing' },
        { method: 'DELETE', path: '/api/crops/:id', auth: 'Farmer / Admin', desc: 'Delete crop listing' },
      ],
    },
    {
      group: 'Buyer Offers / Direct Procurement',
      routes: [
        { method: 'GET', path: '/api/buyers/offers', auth: 'None', desc: 'Farmers browse buyer procurement offers' },
        { method: 'POST', path: '/api/buyers/offers', auth: 'Verified Buyer / Admin', desc: 'Buyer creates procurement demand' },
        { method: 'GET', path: '/api/buyers/offers/my', auth: 'Buyer / Admin', desc: 'Buyer views their offers' },
        { method: 'PUT', path: '/api/buyers/offers/:id', auth: 'Buyer / Admin', desc: 'Update buyer offer' },
        { method: 'DELETE', path: '/api/buyers/offers/:id', auth: 'Buyer / Admin', desc: 'Delete buyer offer' },
      ],
    },
    {
      group: 'Admin Operations',
      routes: [
        { method: 'GET', path: '/api/admin/stats', auth: 'Admin', desc: 'Platform analytics and counts' },
        { method: 'GET', path: '/api/admin/buyers/pending', auth: 'Admin', desc: 'List unverified buyers awaiting KYC approval' },
        { method: 'PATCH', path: '/api/admin/buyers/:id/verify', auth: 'Admin', desc: 'Approve or revoke buyer verification' },
        { method: 'POST', path: '/api/admin/mandi/sync', auth: 'Admin', desc: 'Trigger mandi data synchronization' },
      ],
    },
  ],
  testCredentials: {
    farmer: { mobile: '9876543210', password: 'farmer123', name: 'Rameshwar Singh Yadav (Sitapur)' },
    buyer: { mobile: '9811223344', password: 'buyer123', name: 'Vikram Agrawal (Lucknow - Verified)' },
    pendingBuyer: { mobile: '9922334455', password: 'buyer123', name: 'Kisan Exporters (Pending KYC)' },
    admin: { mobile: '9000000000', password: 'admin123', name: 'UP Mandi Parishad Admin' },
  },
};

router.get('/', (req: Request, res: Response) => {
  res.json(API_DOCS);
});

export default router;
