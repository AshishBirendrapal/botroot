// API 1: Live mandi prices - data.gov.in (AGMARKNET daily prices)
const RESOURCE = '9ef84268-d588-465a-a308-a864a43d0070';
const BASE = `https://api.data.gov.in/resource/${RESOURCE}`;
const TTL = 30 * 60 * 1000; // 30 min cache (API limits + speed)
const cache = new Map();

const num = v => (v === undefined || v === null || v === '' || isNaN(+v) ? null : +v);

const normalize = r => ({
  state: r.state, district: r.district, market: r.market,
  commodity: r.commodity, variety: r.variety, grade: r.grade,
  date: r.arrival_date,
  minPrice: num(r.min_price), maxPrice: num(r.max_price), modalPrice: num(r.modal_price) // Rs/quintal
});

// Dummy data (USE_MOCK=true) - bina API key ke frontend test karne ke liye
function mock({ commodity = 'Tomato', state = 'Uttar Pradesh' }) {
  const markets = [
    ['Moradabad', 'Moradabad'], ['Bareilly', 'Bareilly'], ['Meerut', 'Meerut'],
    ['Lucknow', 'Lucknow'], ['Agra', 'Agra'], ['Kanpur', 'Kanpur']
  ];
  const today = new Date().toLocaleDateString('en-GB').replace(/\//g, '/');
  return markets.map(([district, market], i) => {
    const base = 1800 + ((commodity.length * 137 + i * 211) % 900);
    return { state, district, market: `${market} Mandi`, commodity, variety: 'Other', grade: 'FAQ',
      date: today, minPrice: base - 200, maxPrice: base + 250, modalPrice: base };
  });
}

async function fetchMandiPrices({ commodity, state, district, limit = 100 }) {
  if (process.env.USE_MOCK === 'true') return mock({ commodity, state });

  const key = JSON.stringify([commodity, state, district, limit]);
  const hit = cache.get(key);
  if (hit && Date.now() - hit.t < TTL) return hit.data;

  const p = new URLSearchParams({ 'api-key': process.env.DATA_GOV_API_KEY, format: 'json', limit: String(limit) });
  if (state) p.set('filters[state.keyword]', state);
  if (district) p.set('filters[district]', district);
  if (commodity) p.set('filters[commodity]', commodity);

  const res = await fetch(`${BASE}?${p}`);
  if (!res.ok) throw Object.assign(new Error(`data.gov.in error (${res.status})`), { status: 502 });
  const json = await res.json();
  const data = (json.records || []).map(normalize).filter(r => r.modalPrice);
  cache.set(key, { t: Date.now(), data });
  return data;
}

module.exports = { fetchMandiPrices };
