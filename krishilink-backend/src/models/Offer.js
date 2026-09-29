const mongoose = require('mongoose');
const offerSchema = new mongoose.Schema({
  produce: { type: mongoose.Schema.Types.ObjectId, ref: 'Produce', required: true },
  buyer: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  farmer: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  pricePerQtl: { type: Number, required: true },
  quantityQtl: { type: Number, required: true },
  message: String,
  status: { type: String, enum: ['pending', 'accepted', 'rejected', 'countered'], default: 'pending' },
  counterPrice: Number
}, { timestamps: true });
module.exports = mongoose.model('Offer', offerSchema);
