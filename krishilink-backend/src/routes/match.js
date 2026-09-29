const router = require('express').Router();
const Produce = require('../models/Produce');
const Requirement = require('../models/Requirement');
const { getDistances } = require('../services/distanceService');
const { protect, allow } = require('../middleware/auth');
const { wrap } = require('../middleware/error');

const RANK = { A: 3, B: 2, C: 1 };
const RATE = () => +process.env.TRANSPORT_RATE_PER_QTL_KM || 0.4;

// Farmer ki listing ke liye best buyers (net price after transport ke hisaab se)
router.get('/produce/:id', protect, allow('farmer'), wrap(async (req, res) => {
  const p = await Produce.findOne({ _id: req.params.id, farmer: req.user._id });
  if (!p) return res.status(404).json({ message: 'Not found' });

  const reqs = await Requirement.find({ status: 'open', crop: new RegExp(`^${p.crop}$`, 'i') })
    .populate('buyer', 'name organization verified');
  const ok = reqs.filter(r => RANK[p.quality.grade] >= RANK[r.minGrade]);
  const origin = `${p.location.district}, ${p.location.state}, India`;
  const dist = await getDistances(origin, ok.map(r => `${r.location?.district || ''}, ${r.location?.state || ''}, India`));

  const matches = ok.map((r, i) => {
    const km = dist[i]?.km ?? null;
    const transport = km === null ? null : +(km * RATE()).toFixed(2);
    return { requirement: r, distanceKm: km, transportPerQtl: transport,
      netPerQtl: transport === null ? null : +(r.offerPrice - transport).toFixed(2),
      quantityFit: r.quantityQtl >= p.quantityQtl ? 'full' : 'partial' };
  }).sort((a, b) => (b.netPerQtl ?? -Infinity) - (a.netPerQtl ?? -Infinity));

  res.json({ produce: p, matches });
}));

// Buyer ki requirement ke liye matching produce
router.get('/requirement/:id', protect, allow('buyer'), wrap(async (req, res) => {
  const r = await Requirement.findOne({ _id: req.params.id, buyer: req.user._id });
  if (!r) return res.status(404).json({ message: 'Not found' });
  const list = await Produce.find({ status: 'open', crop: new RegExp(`^${r.crop}$`, 'i') }).populate('farmer', 'name location');
  const matches = list.filter(p => RANK[p.quality.grade] >= RANK[r.minGrade])
    .sort((a, b) => b.quality.reliabilityScore - a.quality.reliabilityScore);
  res.json({ requirement: r, matches });
}));

module.exports = router;
