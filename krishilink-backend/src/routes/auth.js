const router = require('express').Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { protect } = require('../middleware/auth');
const { wrap } = require('../middleware/error');

const sign = u => jwt.sign({ id: u._id }, process.env.JWT_SECRET, { expiresIn: '7d' });

router.post('/register', wrap(async (req, res) => {
  const { name, email, password, role, phone, location, organization } = req.body;
  if (!name || !email || !password || !['farmer', 'buyer'].includes(role))
    return res.status(400).json({ message: 'name, email, password, role (farmer/buyer) required' });
  if (await User.findOne({ email })) return res.status(409).json({ message: 'Email already registered' });
  const user = await User.create({ name, email, phone, role, location, organization, password: await bcrypt.hash(password, 10) });
  res.status(201).json({ token: sign(user), user: { id: user._id, name, email, role } });
}));

router.post('/login', wrap(async (req, res) => {
  const user = await User.findOne({ email: req.body.email }).select('+password');
  if (!user || !(await bcrypt.compare(req.body.password || '', user.password)))
    return res.status(401).json({ message: 'Wrong email or password' });
  res.json({ token: sign(user), user: { id: user._id, name: user.name, email: user.email, role: user.role } });
}));

router.get('/me', protect, (req, res) => res.json(req.user));

module.exports = router;
