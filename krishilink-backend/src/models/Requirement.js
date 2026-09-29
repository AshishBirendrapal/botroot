const mongoose = require('mongoose');
// Buyer requirement: Crop - Qty - Quality - Price
const requirementSchema = new mongoose.Schema({
  buyer: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  crop: { type: String, required: true, trim: true },
  quantityQtl: { type: Number, required: true, min: 0.1 },
  minGrade: { type: String, enum: ['A', 'B', 'C'], default: 'C' },
  offerPrice: { type: Number, required: true },
  location: { district: String, state: String },
  status: { type: String, enum: ['open', 'fulfilled', 'closed'], default: 'open' }
}, { timestamps: true });
module.exports = mongoose.model('Requirement', requirementSchema);
