const router = require('express').Router();
const Offer = require('../models/Offer');
const Produce = require('../models/Produce');
const { protect, allow } = require('../middleware/auth');
const { wrap } = require('../middleware/error');

// Buyer offer bhejta hai
router.post('/', protect, allow('buyer'), wrap(async (req, res) => {
  const { produceId, pricePerQtl, quantityQtl, message } = req.body;
  const p = await Produce.findById(produceId);
  if (!p || p.status !== 'open') return res.status(404).json({ message: 'Listing not available' });
  res.status(201).json(await Offer.create({ produce: p._id, buyer: req.user._id, farmer: p.farmer,
    pricePerQtl, quantityQtl: quantityQtl || p.quantityQtl, message }));
}));

// Mere offers (farmer: received, buyer: sent)
router.get('/mine', protect, wrap(async (req, res) => {
  const f = req.user.role === 'farmer' ? { farmer: req.user._id } : { buyer: req.user._id };
  res.json(await Offer.find(f).populate('produce', 'crop quantityQtl').populate('buyer', 'name organization').sort('-createdAt'));
}));

// Farmer: accept / reject / counter   body: { action: 'accept'|'reject'|'counter', counterPrice }
router.patch('/:id', protect, allow('farmer'), wrap(async (req, res) => {
  const o = await Offer.findOne({ _id: req.params.id, farmer: req.user._id });
  if (!o) return res.status(404).json({ message: 'Not found' });
  const { action, counterPrice } = req.body;
  if (action === 'accept') { o.status = 'accepted'; await Produce.findByIdAndUpdate(o.produce, { status: 'matched' }); }
  else if (action === 'reject') o.status = 'rejected';
  else if (action === 'counter' && counterPrice) { o.status = 'countered'; o.counterPrice = counterPrice; }
  else return res.status(400).json({ message: "action must be accept / reject / counter (with counterPrice)" });
  await o.save();
  res.json(o);
}));

module.exports = router;
