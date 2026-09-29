const mongoose = require('mongoose');
const userSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  email: { type: String, required: true, unique: true, lowercase: true },
  phone: String,
  password: { type: String, required: true, select: false },
  role: { type: String, enum: ['farmer', 'buyer'], required: true },
  location: { village: String, district: String, state: String },
  organization: String,
  verified: { type: Boolean, default: false }
}, { timestamps: true });
module.exports = mongoose.model('User', userSchema);
