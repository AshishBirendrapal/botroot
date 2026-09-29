const router = require('express').Router();
const { fetchMandiPrices } = require('../services/mandiService');
const { compareMarkets } = require('../services/marketIntelligence');
const { getDistances } = require('../services/distanceService');
const { wrap } = require('../middleware/error');

// Live mandi prices  GET /api/market/prices?crop=Tomato&state=Uttar Pradesh&district=Moradabad
router.get('/prices', wrap(async (req, res) => {
  const { crop, state, district } = req.query;
  if (!crop) return res.status(400).json({ message: 'crop required' });
  const data = await fetchMandiPrices({ commodity: crop, state, district });
  res.json({ count: data.length, prices: data });
}));

// Distance  GET /api/market/distance?origin=Moradabad, UP&destination=Bareilly, UP
router.get('/distance', wrap(async (req, res) => {
  const { origin, destination } = req.query;
  if (!origin || !destination) return res.status(400).json({ message: 'origin and destination required' });
  const [d] = await getDistances(origin, [destination]);
  res.json(d || { message: 'Route not found' });
}));

// Best mandi (net realization) + sell/wait
// GET /api/market/compare?crop=Tomato&state=Uttar Pradesh&origin=Moradabad, Uttar Pradesh&qty=50&storageCost=0
router.get('/compare', wrap(async (req, res) => {
  const { crop, state, district, origin, qty, storageCost } = req.query;
  if (!crop || !state || !origin) return res.status(400).json({ message: 'crop, state, origin required' });
  res.json(await compareMarkets({ crop, state, district, origin,
    quantityQtl: +qty || 1, storageCostPerQtl: +storageCost || 0 }));
}));

module.exports = router;
