// Market Intelligence Engine: mandi price + distance -> net realization + sell/wait
const { fetchMandiPrices } = require('./mandiService');
const { getDistances } = require('./distanceService');
const PriceSnapshot = require('../models/PriceSnapshot');

const RATE = () => +process.env.TRANSPORT_RATE_PER_QTL_KM || 0.4;

async function saveSnapshot(commodity, state, prices) {
  if (!prices.length || !state) return;
  const avg = prices.reduce((s, p) => s + p.modalPrice, 0) / prices.length;
  const date = new Date().toISOString().slice(0, 10);
  await PriceSnapshot.updateOne({ commodity, state, date },
    { $set: { avgModal: Math.round(avg), markets: prices.length } }, { upsert: true });
}

// Simple trend-based heuristic (roadmap: LSTM/GRU)
async function recommend(commodity, state, currentAvg) {
  const past = await PriceSnapshot.find({ commodity, state }).sort({ date: -1 }).skip(1).limit(7);
  if (past.length < 3) return { action: 'INSUFFICIENT_DATA', reason: 'Trend ke liye abhi kam din ka data hai.' };
  const avg = past.reduce((s, p) => s + p.avgModal, 0) / past.length;
  const change = ((currentAvg - avg) / avg) * 100;
  if (change >= 3) return { action: 'SELL_NOW', changePct: +change.toFixed(1), reason: 'Rate pichhle din ke average se upar hai.' };
  if (change <= -3) return { action: 'WAIT', changePct: +change.toFixed(1), reason: 'Rate average se neeche hai; storage ho to ruk sakte hain.' };
  return { action: 'HOLD_OR_SELL', changePct: +change.toFixed(1), reason: 'Rate stable hai.' };
}

async function compareMarkets({ crop, state, district, origin, quantityQtl = 1, storageCostPerQtl = 0 }) {
  const prices = await fetchMandiPrices({ commodity: crop, state, district });
  if (!prices.length) return { markets: [], recommendation: null };

  const dests = prices.map(p => `${p.market}, ${p.district}, ${p.state}, India`);
  const dist = await getDistances(origin, dests);

  const markets = prices.map((p, i) => {
    const km = dist[i]?.km ?? null;
    const transportPerQtl = km === null ? null : +(km * RATE()).toFixed(2);
    const netPerQtl = transportPerQtl === null ? null : +(p.modalPrice - transportPerQtl - storageCostPerQtl).toFixed(2);
    return { ...p, distanceKm: km, durationMin: dist[i]?.durationMin ?? null, transportPerQtl, netPerQtl,
      totalNet: netPerQtl === null ? null : +(netPerQtl * quantityQtl).toFixed(2) };
  }).sort((a, b) => (b.netPerQtl ?? -Infinity) - (a.netPerQtl ?? -Infinity));

  const avg = prices.reduce((s, p) => s + p.modalPrice, 0) / prices.length;
  await saveSnapshot(crop, state, prices);
  return { crop, quantityQtl, origin, best: markets[0], markets, recommendation: await recommend(crop, state, avg) };
}

module.exports = { compareMarkets };
