---
title: CoconutHub API
emoji: 🥥
colorFrom: green
colorTo: yellow
sdk: docker
app_port: 7860
pinned: false
---

# CoconutHub (පොල්හබ්) — Sri Lanka's Coconut Trade Platform

An industry-grade B2B marketplace and market intelligence platform for Sri Lanka's coconut and agro-industrial sector.

---

## 🌟 Key Capabilities

1. **Daily Benchmark Commodity Prices (`/`)**:
   * Live rates for Fresh Coconuts, Coconut Oil, Coconut Husks, Coir Fiber, and Coconut Shells.
   * 8-week historical trend chart powered by Recharts.
   * Continuous animated price marquee ticker.
2. **Mills Directory (`/mills`)**:
   * Searchable directory of processing mills across 12 coconut-growing districts.
   * Filterable by category (Coconut Mills, Oil Mills, Coir Mills) and district.
   * Click-to-call direct phone dialer.
3. **B2B Trade Exchange (`/market`)**:
   * Real-time Buy and Sell trade postings with quantities and terms.
   * "Post Trade Ad" modal allowing farmers & millers to post directly.
   * **Secure Contact Paywall**: Trader phone numbers are masked on the server until a Rs. 150 payment is verified.
4. **PayHere LK Payment Gateway Integration**:
   * Generates secure MD5 checkout hashes.
   * Automated IPN webhook handler verifying digital signatures.
5. **Mobile Phone OTP Authentication**:
   * SMS OTP login designed for Sri Lankan mobile networks (Dialog, Mobitel, Airtel, Hutch).
6. **Bilingual Experience**:
   * Instantaneous toggle between **Sinhala (සිංහල)** and **English**.

---

## 🏗️ System Architecture

```
CoconutHub/
├── backend/
│   ├── src/
│   │   ├── CoconutHub.Core/          # Domain Entities, DTOs, Enums
│   │   ├── CoconutHub.Infrastructure/ # EF Core DbContext, PayHere, SMS Service
│   │   └── CoconutHub.Api/           # REST Controllers, JWT Auth, Program.cs
│   ├── tests/
│   │   └── CoconutHub.UnitTests/     # Automated Tests (PayHere Hash, SMS OTP)
│   └── CoconutHub.sln
├── frontend/
│   ├── src/
│   │   ├── api/                      # Axios API Client & Endpoints
│   │   ├── components/               # Header, BottomNav, Modals, Ticker
│   │   ├── context/                  # Language Context (EN / SI)
│   │   ├── pages/                    # PricesPage, MillsPage, MarketPage
│   │   └── lib/                      # Translations dictionary
│   ├── package.json
│   └── vite.config.js
└── docker-compose.yml
```

---

## 🚀 Quick Start (Local Development)

### 1. Run the Backend API (.NET 10 / C#)
```bash
cd backend
dotnet run --project src/CoconutHub.Api/CoconutHub.Api.csproj
```
* The API will start at: `http://localhost:5000` (or `https://localhost:7000`)
* The SQLite database (`coconuthub.db`) will be automatically created and seeded with baseline market prices, mills, and listings!

### 2. Run the Frontend (React + Vite)
```bash
cd frontend
npm install
npm run dev
```
* Open your browser at: `http://localhost:3000`
* Vite automatically proxies `/api` requests to the backend.

### 3. Run Automated Tests
```bash
cd backend
dotnet test
```

---

## 🐳 Docker Deployment

To launch the complete production stack (PostgreSQL 16 + ASP.NET Core API + React Nginx):
```bash
docker-compose up --build -d
```

---

## 💳 PayHere LK Setup

1. Register on [PayHere.lk](https://www.payhere.lk/) as an Individual or Business Merchant.
2. In `backend/src/CoconutHub.Api/appsettings.json`:
   ```json
   "PayHere": {
     "MerchantId": "YOUR_MERCHANT_ID",
     "MerchantSecret": "YOUR_MERCHANT_SECRET",
     "Sandbox": false,
     "DemoMode": false
   }
   ```
3. Set your PayHere IPN notify URL to: `https://your-domain.lk/api/payments/notify`
