# KrishiLink Backend (Node.js + Express + MongoDB)

## Run
1. `npm install`
2. `.env.example` ko copy karke `.env` banao, values bharo (pehle `USE_MOCK=true` rakh sakte ho)
3. MongoDB chalu rakho (local ya Atlas)
4. `npm run dev`  ->  http://localhost:5000

## 2 External APIs
| API | File | Kaam |
|---|---|---|
| data.gov.in (AGMARKNET) | `src/services/mandiService.js` | Live mandi prices |
| Google Distance Matrix | `src/services/distanceService.js` | Mandi/buyer tak distance |

Real data ke liye `.env` me `USE_MOCK=false` + dono API keys.

## Endpoints
Auth: `POST /api/auth/register`, `POST /api/auth/login`, `GET /api/auth/me`
Market (public): `GET /api/market/prices`, `/distance`, `/compare`
Produce (farmer): `POST/GET /api/produce`, `GET /api/produce/mine`
Requirements (buyer): `POST/GET /api/requirements`
Match: `GET /api/match/produce/:id` (farmer), `GET /api/match/requirement/:id` (buyer)
Offers: `POST /api/offers` (buyer), `GET /api/offers/mine`, `PATCH /api/offers/:id` (farmer)

Protected routes: header `Authorization: Bearer <token>`

## Example
GET /api/market/compare?crop=Tomato&state=Uttar Pradesh&origin=Moradabad, Uttar Pradesh&qty=50
