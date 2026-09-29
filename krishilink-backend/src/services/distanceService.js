// API 2: Distance - Google Maps Distance Matrix API
const cache = new Map();

function mockKm(a, b) { // deterministic fake distance
  let h = 0; for (const c of a + b) h = (h * 31 + c.charCodeAt(0)) % 280;
  return 15 + h;
}

// origin: "Moradabad, Uttar Pradesh"  destinations: ["Bareilly Mandi, Bareilly, Uttar Pradesh", ...]
// return: [{ km, durationMin } | null, ...] (destinations ke order me)
async function getDistances(origin, destinations) {
  if (process.env.USE_MOCK === 'true') {
    return destinations.map(d => ({ km: mockKm(origin, d), durationMin: Math.round(mockKm(origin, d) * 1.4) }));
  }
  const out = new Array(destinations.length).fill(null);
  const todo = [];
  destinations.forEach((d, i) => {
    const hit = cache.get(`${origin}|${d}`);
    if (hit) out[i] = hit; else todo.push(i);
  });

  for (let s = 0; s < todo.length; s += 25) { // Google limit: 25 destinations / request
    const idx = todo.slice(s, s + 25);
    const p = new URLSearchParams({
      origins: origin, destinations: idx.map(i => destinations[i]).join('|'),
      units: 'metric', key: process.env.GOOGLE_MAPS_API_KEY
    });
    const res = await fetch(`https://maps.googleapis.com/maps/api/distancematrix/json?${p}`);
    const json = await res.json();
    if (json.status !== 'OK') throw Object.assign(new Error(`Google Maps error: ${json.status}`), { status: 502 });
    json.rows[0].elements.forEach((el, k) => {
      if (el.status === 'OK') {
        const v = { km: +(el.distance.value / 1000).toFixed(1), durationMin: Math.round(el.duration.value / 60) };
        out[idx[k]] = v; cache.set(`${origin}|${destinations[idx[k]]}`, v);
      }
    });
  }
  return out;
}

module.exports = { getDistances };
