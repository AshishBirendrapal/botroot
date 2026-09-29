const router = require('express').Router();
const Requirement = require('../models/Requirement');
const { protect, allow } = require('../middleware/auth');
const { wrap } = require('../middleware/error');

router.post('/', protect, allow('buyer'), wrap(async (req, res) => {
  const { crop, quantityQtl, offerPrice } = req.body;
  if (!crop || !quantityQtl || !offerPrice) return res.status(400).json({ message: 'crop, quantityQtl, offerPrice required' });
  res.status(201).json(await Requirement.create({ ...req.body, buyer: req.user._id }));
}));

router.get('/mine', protect, allow('buyer'), wrap(async (req, res) =>
  res.json(await Requirement.find({ buyer: req.user._id }).sort('-createdAt'))));

router.get('/', protect, wrap(async (req, res) => {
  const f = { status: 'open' };
  if (req.query.crop) f.crop = new RegExp(`^${req.query.crop}$`, 'i');
  res.json(await Requirement.find(f).populate('buyer', 'name organization verified').sort('-createdAt'));
}));

module.exports = router;
