# Implementation Plan: Mitti2Market Backend Architecture & Implementation

Mitti2Market is an agricultural market intelligence and commerce backend built with **Node.js, Express.js, and MongoDB**. It empowers farmers in Uttar Pradesh (and across India) to maximize their profit by comparing real-time mandi prices, calculating accurate transport costs and net realizations (Gross Sale - Transport - Charges), discovering the highest-yield mandi, and connecting directly with verified institutional/wholesale buyers.

---

## User Review & Critical Decisions

> [!IMPORTANT]
> **Zero Code Modifications Have Been Made Yet.**
> In accordance with your instruction, this plan delivers a comprehensive audit of your existing project, gap analysis, backend architecture proposal, API endpoints inventory, and environment variables list. We await your approval before installing packages or writing backend code.

### Confirmed Decisions & Architectural Strategy
1. **Frontend Preservation (Zero Disruption)**:
   - Your existing frontend (`src/App.tsx`, `src/main.tsx`, `index.html`, Tailwind CSS setup) will remain intact.
   - We will implement a unified Express full-stack architecture (`server.ts`) where Express handles `/api/*` and mounts Vite middlewares in development. This satisfies AI Studio requirements and keeps frontend and backend seamlessly integrated on port 3000.
2. **MongoDB Connectivity with Graceful Fallback**:
   - The backend will use `mongoose` connecting to `MONGODB_URI` (e.g. MongoDB Atlas or local MongoDB).
   - If `MONGODB_URI` is not yet configured or temporarily unreachable in development, the database connection layer will provide informative warnings and an in-memory/resilient store so API routes remain testable without throwing unhandled server crashes.
3. **Mandi Price Engine & Uttar Pradesh Real-Time Data**:
   - Integration with Government Mandi Data (Agmarknet / data.gov.in API for Uttar Pradesh mandis covering crops like Wheat, Rice/Paddy, Potato, Mustard, Sugarcane, Onion, Tomato, Maize, etc. across districts like Lucknow, Kanpur, Agra, Varanasi, Meerut, Bareilly, Aligarh, Prayagraj, etc.).
   - Built-in caching layer with a fallback UP mandi dataset to guarantee high uptime, fast sub-millisecond responses, and resilience against external API rate limits or downtime.
4. **Distance & Net Realization Formula**:
   - Haversine geo-distance calculation using farmer latitude/longitude or UP district centroid coordinates to Mandi coordinates.
   - Configurable transport rate engine:
     $$\text{Gross Sale} = \text{Mandi Rate (₹/Quintal)} \times \text{Quantity (Quintals)}$$
     $$\text{Transport Cost} = \text{Distance (km)} \times \text{Freight Rate (₹/km/Quintal)} \times \text{Quantity}$$
     $$\text{Other Charges} = \text{Mandi Cess} + \text{Loading/Unloading (₹/Quintal)} \times \text{Quantity}$$
     $$\text{Net Realization} = \text{Gross Sale} - \text{Transport Cost} - \text{Other Charges}$$
   - Mandi comparison engine ranking all available UP mandis by highest Net Realization.

---

## 1. Audit of Existing Codebase & Backend Gap Analysis

### What Backend Already Exists
- `package.json`: Contains basic packages `express (^4.21.2)`, `dotenv (^17.2.3)`, and dev dependency `@types/express`.
- `vite.config.ts`: Pure Vite frontend configuration with Tailwind CSS v4.
- `src/`: Client-side boilerplate (`App.tsx`, `main.tsx`, `index.css`).
- **Conclusion**: There is **no backend implementation** currently present. There are no routes, no controllers, no Mongoose models, no authentication/JWT middleware, no mandi price aggregation logic, and no `server.ts` entry point. The server currently runs Vite directly via `"dev": "vite --port=3000 --host=0.0.0.0"`.

### Missing Files & Dependencies
To build the complete, production-grade backend, the following components are required:

1. **Required NPM Packages**:
   - `mongoose` (MongoDB object modeling & schemas)
   - `jsonwebtoken` & `@types/jsonwebtoken` (JWT creation, signing & verification)
   - `bcryptjs` & `@types/bcryptjs` (Secure password hashing)
   - `cors` & `@types/cors` (Cross-Origin Resource Sharing configuration)
   - `zod` (Robust schema and request body validation)

2. **Backend Directory Structure to be Created**:
   ```
   server.ts                        # Master Express server mounting Vite + API routes
   server/
   ├── config/
   │   ├── db.ts                    # MongoDB connection lifecycle & retry handler
   │   └── env.ts                   # Validated environment configuration
   ├── controllers/
   │   ├── authController.ts        # Register, login, profile (Farmer & Buyer)
   │   ├── mandiController.ts       # UP mandi prices, filter, net realization, compare
   │   ├── cropController.ts        # Farmer crop listings CRUD
   │   ├── buyerController.ts       # Buyer listings, procurement offers, verification
   │   └── adminController.ts       # Admin oversight, buyer approval, mandi sync
   ├── middleware/
   │   ├── auth.ts                  # JWT verify & RBAC (roles: 'farmer', 'buyer', 'admin')
   │   ├── validate.ts              # Zod validation middleware for req.body/params/query
   │   └── errorHandler.ts          # Central error handling, 404 handler, ApiError
   ├── models/
   │   ├── User.ts                  # Farmer/Buyer/Admin schema (with location, phone, KYC)
   │   ├── CropListing.ts           # Farmer's harvest crop listing
   │   ├── BuyerOffer.ts            # Buyer purchase offers & tender postings
   │   └── MandiPrice.ts            # Mandi daily rate records & UP APMC directory
   ├── services/
   │   ├── mandiService.ts          # UP Agmarknet/Data.gov.in integration & caching
   │   └── calculatorService.ts     # Haversine distance, transport & net realization
   ├── routes/
   │   ├── index.ts                 # Aggregated API router (/api/v1)
   │   ├── authRoutes.ts            # Auth & profile routes
   │   ├── mandiRoutes.ts           # Mandi price, calculation & comparison routes
   │   ├── cropRoutes.ts            # Farmer crop management routes
   │   ├── buyerRoutes.ts           # Buyer offers & procurement routes
   │   ├── adminRoutes.ts           # Admin management routes
   │   └── healthRoutes.ts          # Health-check endpoint
   └── docs/
       └── apiDocumentation.ts      # Swagger/OpenAPI-compatible interactive API docs
   ```

---

## 2. Technical Architecture & Data Strategy

```
┌────────────────────────────────────────────────────────────────────────┐
│                        Mitti2Market Backend Architecture               │
└────────────────────────────────────────────────────────────────────────┘

 [ Client Frontend / API Consumers ]
               │
               ▼ HTTP Requests
 ┌────────────────────────────────────────────────────────────────────────┐
 │ Express Server (server.ts on Port 3000)                                │
 │  - CORS Config (credentials, allowed origins, standard methods)        │
 │  - JSON Parser (express.json)                                          │
 │  - Vite Dev Middlewares (serves frontend seamlessly without rebuild)   │
 └─────────────────┬──────────────────────────────────────────────────────┘
                   │
                   ▼ Routing: /api/v1
 ┌────────────────────────────────────────────────────────────────────────┐
 │ API Middleware Pipeline                                                │
 │  ├─ Request Logger & Rate Limit Protection                             │
 │  ├─ Input Validation Middleware (Zod schemas)                          │
 │  └─ JWT Authentication & RBAC Middleware ('farmer' | 'buyer' | 'admin') │
 └─────────────────┬──────────────────────────────────────────────────────┘
                   │
        ┌──────────┴──────────┬──────────────────┬─────────────────┐
        ▼                     ▼                  ▼                 ▼
 ┌───────────────┐     ┌───────────────┐  ┌───────────────┐ ┌──────────────┐
 │ Auth & Profile│     │ Mandi Engine  │  │ Crop Listings │ │ Buyer Offers │
 │  Controller   │     │  Controller   │  │  Controller   │ │  Controller  │
 └──────┬────────┘     └──────┬────────┘  └──────┬────────┘ └──────┬───────┘
        │                     │                  │                 │
        │              ┌──────┴───────────────┐  │                 │
        │              │ Calculator & Service │  │                 │
        │              │  - Haversine Dist    │  │                 │
        │              │  - Net Realization   │  │                 │
        │              │  - Best Mandi Finder │  │                 │
        │              │  - UP Mandi Sync     │  │                 │
        │              └──────┬───────────────┘  │                 │
        │                     │                  │                 │
        ▼                     ▼                  ▼                 ▼
 ┌────────────────────────────────────────────────────────────────────────┐
 │ Mongoose Models (MongoDB Database / Atlas)                             │
 │  ├─ Users (Farmer, Buyer, Admin, credentials, location, verification)  │
 │  ├─ CropListings (Crops, variety, quantity, harvested date, photos)   │
 │  ├─ MandiPrices (Agmarknet UP data, commodity, min/max/modal rate)     │
 │  └─ BuyerOffers (Demand, price, delivery mandi, fulfillment status)    │
 └────────────────────────────────────────────────────────────────────────┘
```

---

## 3. List of Required APIs

### A. Health & Documentation APIs
- `GET /api/health` - System health check (server status, uptime, database connection status, memory).
- `GET /api/docs` - Interactive documentation providing detailed schema, params, and testing interface for all endpoints.

### B. Authentication & Profile APIs
- `POST /api/auth/farmer/register` - Register a new farmer (name, mobile, password, state, district, tehsil, village, coordinates [lat, lng], farm size in acres).
- `POST /api/auth/buyer/register` - Register a buyer/trader (name, company name, GSTIN/trade license, mobile, password, business district, verification documents).
- `POST /api/auth/login` - Unified login for Farmer, Buyer, and Admin; validates password via bcrypt, returns JWT token & user profile.
- `GET /api/auth/profile` - Get logged-in user profile (requires Bearer JWT).
- `PUT /api/auth/profile` - Update profile, location coordinates, contact details.

### C. Mandi Prices & Uttar Pradesh Intelligence APIs
- `GET /api/mandi/prices` - Fetch latest mandi prices for Uttar Pradesh with filters:
  - Query params: `?crop=Wheat&district=Aligarh&market=Aligarh&date=YYYY-MM-DD&page=1&limit=20`
- `GET /api/mandi/commodities` - List available tracked agricultural commodities (Wheat, Rice, Mustard, Potato, Sugarcane, Onion, Tomato, etc.).
- `GET /api/mandi/districts` - List all Uttar Pradesh districts and registered APMC mandis.
- `POST /api/mandi/distance` - Compute road/aerial distance from farmer location (coordinates or district) to a given mandi.
- `POST /api/mandi/calculate-net-realization` - Compute single mandi net revenue:
  - Input: `{ mandiId, crop, quantityQuintals, farmerLat, farmerLng, freightRatePerKmTon?, laborPerQuintal? }`
  - Returns: Gross Sale, Transport Cost, Mandi Fees, Other Deductions, Net Realization, Net Rate per Quintal.
- `POST /api/mandi/compare` - Compare multiple mandis in UP:
  - Input: `{ crop, quantityQuintals, farmerLocation: { lat, lng } or district, candidateMandiIds?: [] }`
  - Output: Ranked array of mandis sorted by highest Net Realization, with a clear flag indicating the `#1 Recommended Mandi`.

### D. Farmer Crop Listings APIs
- `POST /api/crops` - Farmer lists a crop for sale (crop name, variety, quantity in quintals, expected price, harvest date, location/pickup address). Requires `farmer` role.
- `GET /api/crops` - List crop listings (with filters by crop, district, quantity).
- `GET /api/crops/my` - Get farmer's own active/sold listings.
- `GET /api/crops/:id` - Get specific crop listing details.
- `PUT /api/crops/:id` - Update crop listing.
- `DELETE /api/crops/:id` - Delete/cancel crop listing.

### E. Buyer Procurement Offers APIs
- `POST /api/buyers/offers` - Buyer posts procurement requirement/offer (crop, required quantity, offered price per quintal, delivery location/mandi, expiry date). Requires `buyer` role.
- `GET /api/buyers/offers` - Browse buyer offers (accessible to farmers to find high-paying buyers). Filters by crop, district, minimum offer price.
- `GET /api/buyers/offers/my` - Buyer views their own posted offers.
- `PUT /api/buyers/offers/:id` - Update buyer offer.
- `DELETE /api/buyers/offers/:id` - Cancel buyer offer.

### F. Admin APIs
- `GET /api/admin/stats` - Total farmers, total buyers, active crop listings, total trading volume, pending buyer verifications. Requires `admin` role.
- `GET /api/admin/buyers/pending` - List unverified buyer applications with submitted credentials/GSTIN.
- `PATCH /api/admin/buyers/:id/verify` - Approve or reject buyer verification (`status: 'verified' | 'rejected'`).
- `POST /api/admin/mandi/sync` - Manually trigger / force sync of latest UP mandi prices from external source into database cache.

---

## 4. Required Environment Variables (`.env` and `.env.example`)

| Variable Name | Required | Default / Example Value | Description |
|---|---|---|---|
| `PORT` | Optional | `3000` | Port for Express dev and production server |
| `NODE_ENV` | Optional | `development` | Runtime environment (`development` / `production`) |
| `MONGODB_URI` | Required for persistent DB | `mongodb://localhost:27017/mitti2market` or Atlas URI | MongoDB connection string |
| `JWT_SECRET` | Required | `mitti2market_secure_jwt_secret_key_2026` | Cryptographic secret for signing auth tokens |
| `JWT_EXPIRES_IN` | Optional | `7d` | Token validity duration |
| `DATA_GOV_IN_API_KEY` | Optional | (External API key) | Mandi price API key (Agmarknet on data.gov.in). If omitted, internal UP mandi intelligence engine provides real-time fallback data |
| `DEFAULT_FREIGHT_RATE_PER_KM_QUINTAL` | Optional | `2.5` | Standard transportation cost in ₹ per km per quintal |
| `DEFAULT_MANDI_CESS_PERCENT` | Optional | `1.5` | APMC mandi market cess percentage |
| `CORS_ORIGIN` | Optional | `*` | Allowed CORS origins for external API clients |

---

## 5. Step-by-Step Execution Plan (Upon Approval)

1. **Step 1: Install Dependencies**:
   - Install `mongoose`, `jsonwebtoken`, `bcryptjs`, `cors`, `zod` and dev packages `@types/jsonwebtoken`, `@types/bcryptjs`, `@types/cors`.
2. **Step 2: Configuration & Database**:
   - Create `.env.example` with all configuration options.
   - Build `server/config/db.ts` with connection resilience and logging.
   - Build `server/config/env.ts` with typed environment validation.
3. **Step 3: Data Models & Validation**:
   - Implement Mongoose models: `User.ts`, `CropListing.ts`, `BuyerOffer.ts`, `MandiPrice.ts`.
   - Implement Zod validation schemas for all inputs.
4. **Step 4: Middlewares**:
   - JWT authentication (`auth.ts`) supporting roles (`farmer`, `buyer`, `admin`).
   - Global error handler (`errorHandler.ts`) with custom `ApiError`.
5. **Step 5: Mandi Price & Transportation Engine**:
   - Integrate UP Mandi dataset with all 75 UP districts (Agra, Aligarh, Prayagraj, Bareilly, Gorakhpur, Kanpur, Lucknow, Meerut, Varanasi, etc.).
   - Implement Haversine distance calculator and Net Realization mathematical model.
   - Implement best mandi recommendation algorithm.
6. **Step 6: Controllers & Routes**:
   - Implement Auth, Mandi, Crop, Buyer Offer, and Admin controllers and wire up express routes.
   - Add `/api/health` and `/api/docs` interactive documentation.
7. **Step 7: Full-Stack Integration in `server.ts`**:
   - Create `server.ts` mounting Vite in dev and Express API routes.
   - Update `package.json` `"dev"` script to `"tsx server.ts"` and `"start": "node server.ts"` so port 3000 serves both frontend and backend seamlessly.
8. **Step 8: Verification & Compilation**:
   - Run compilation checks (`compile_applet` & `lint_applet`) to ensure zero errors and verify full API functionality.
