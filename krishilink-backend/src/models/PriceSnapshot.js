const mongoose = require('mongoose');
// Daily average price -> trend / sell-or-wait recommendation
const snapSchema = new mongoose.Schema({
  commodity: String,
  state: String,
  date: String, // YYYY-MM-DD
  avgModal: Number,
  markets: Number
});
snapSchema.index({ commodity: 1, state: 1, date: 1 }, { unique: true });
module.exports = mongoose.model('PriceSnapshot', snapSchema);
