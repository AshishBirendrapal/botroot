const router = require('express').Router();
const Produce = require('../models/Produce');
const { protect, allow } = require('../middleware/auth');
const { wrap } = require('../middleware/error');

// Reliability score: certified > photo + answers > nothing
function score(q = {}) {
  if (q.mode === 'agmark_certified' && q.certId) return 95;
  let s = 40;
  if (q.photoUrl) s += 25;
  if (q.answers && Object.keys(q.answers).length >= 3) s += 15;
  return s;
}

router.post('/', protect, allow('farmer'), wrap(async (req, res) => {
  const { crop, variety, quantityQtl, expectedPrice, location, quality = {} } = req.body;
  if (!crop || !quantityQtl || !location?.district || !location?.state)
    return res.status(400).json({ message: 'crop, quantityQtl, location.district, location.state required' });
  if (quality.mode === 'agmark_certified' && !quality.certId)
    return res.status(400).json({ message: 'AGMARK CERT ID required for certified mode' });
  quality.reliabilityScore = score(quality);
  const p = await Produce.create({ farmer: req.user._id, crop, variety, quantityQtl, expectedPrice, location, quality });
  res.status(201).json(p);
}));

router.get('/mine', protect, allow('farmer'), wrap(async (req, res) =>
  res.json(await Produce.find({ farmer: req.user._id }).sort('-createdAt'))));

// Buyers browse open listings  ?crop=&state=&district=
router.get('/', protect, wrap(async (req, res) => {
  const f = { status: 'open' };
  if (req.query.crop) f.crop = new RegExp(`^${req.query.crop}$`, 'i');
  if (req.query.state) f['location.state'] = req.query.state;
  if (req.query.district) f['location.district'] = req.query.district;
  res.json(await Produce.find(f).populate('farmer', 'name location').sort('-createdAt'));
}));

router.get('/:id', protect, wrap(async (req, res) => {
  const p = await Produce.findById(req.params.id).populate('farmer', 'name location');
  p ? res.json(p) : res.status(404).json({ message: 'Not found' });
}));

router.delete('/:id', protect, allow('farmer'), wrap(async (req, res) => {
  const p = await Produce.findOneAndUpdate({ _id: req.params.id, farmer: req.user._id }, { status: 'closed' }, { new: true });
  p ? res.json(p) : res.status(404).json({ message: 'Not found' });
}));

module.exports = router;
