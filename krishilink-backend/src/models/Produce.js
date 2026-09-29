const mongoose = require('mongoose');
// Farmer listing: Crop - Qty - Quality - Location
const produceSchema = new mongoose.Schema({
  farmer: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  crop: { type: String, required: true, trim: true },
  variety: String,
  quantityQtl: { type: Number, required: true, min: 0.1 },
  expectedPrice: Number, // Rs / quintal
  location: { village: String, district: { type: String, required: true }, state: { type: String, required: true } },
  quality: {
    mode: { type: String, enum: ['self_declared', 'agmark_certified'], default: 'self_declared' },
    grade: { type: String, enum: ['A', 'B', 'C'], default: 'B' },
    photoUrl: String,
    answers: { type: Map, of: String },
    certId: String,
    reliabilityScore: { type: Number, default: 50 }
  },
  status: { type: String, enum: ['open', 'matched', 'sold', 'closed'], default: 'open' }
}, { timestamps: true });
module.exports = mongoose.model('Produce', produceSchema);
