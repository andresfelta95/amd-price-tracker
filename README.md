# AMD Price Tracker

A full-featured Next.js web app for tracking AMD Ryzen CPU and Radeon GPU prices across multiple retailers. Features live web scraping, 6-month price history charts, and a price alert system.

---

## Features

- **Price Comparison** — See prices from Amazon, Newegg, Best Buy, and Micro Center side by side
- **Price History Charts** — 6-month price trend line with MSRP reference (powered by Recharts)
- **Live Web Scraping** — Scrape real-time prices from retailer pages on demand (Axios + Cheerio)
- **Price Alerts** — Set a target price and email to be notified when a product drops
- **10 Products Tracked** — 5 AMD Ryzen CPUs + 5 AMD Radeon GPUs
- **REST API** — Three API routes for prices, scraping, and alerts
- **"Silicon telemetry console" UI** — datasheet-inspired dark design (Chakra Petch + IBM Plex, live price ticker, signal-red accent); see [docs/DESIGN.md](docs/DESIGN.md)

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | [Next.js 14](https://nextjs.org) (App Router) |
| Language | TypeScript |
| Styling | [Tailwind CSS](https://tailwindcss.com) |
| Charts | [Recharts](https://recharts.org) |
| Scraping | [Axios](https://axios-http.com) + [Cheerio](https://cheerio.js.org) |
| State | [Zustand](https://zustand-demo.pmnd.rs) |

---

## Getting Started

### Prerequisites

- [Node.js 18+](https://nodejs.org) (includes npm)

### Installation

```bash
# 1. Clone the repo
git clone https://github.com/YOUR_USERNAME/amd-price-tracker.git
cd amd-price-tracker

# 2. Install dependencies
npm install

# 3. Start the development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Build for Production

```bash
npm run build
npm start
```

---

## Project Structure

```
amd-price-tracker/
├── public/
│   ├── cpu-placeholder.svg       # Placeholder icon for CPU products
│   └── gpu-placeholder.svg       # Placeholder icon for GPU products
│
├── src/
│   ├── app/                      # Next.js App Router pages & API routes
│   │   ├── layout.tsx            # Root layout (Navbar + footer)
│   │   ├── globals.css           # Global styles + Tailwind imports
│   │   ├── page.tsx              # Home page
│   │   ├── cpus/page.tsx         # CPUs listing page
│   │   ├── gpus/page.tsx         # GPUs listing page
│   │   ├── alerts/page.tsx       # Price alerts dashboard
│   │   ├── product/[id]/
│   │   │   └── page.tsx          # Dynamic product detail page
│   │   └── api/
│   │       ├── prices/route.ts   # GET /api/prices — fetch product data
│   │       ├── scrape/route.ts   # GET /api/scrape — live price scraping
│   │       └── alerts/route.ts   # GET/POST/DELETE /api/alerts
│   │
│   ├── components/               # Reusable UI components
│   │   ├── Navbar.tsx            # Navigation bar with alert badge
│   │   ├── ProductCard.tsx       # Product summary card
│   │   ├── PriceChart.tsx        # Line chart with price history
│   │   ├── RetailerTable.tsx     # Retailer price comparison table
│   │   ├── AlertForm.tsx         # Price alert creation form
│   │   └── ScrapeButton.tsx      # Live price refresh button
│   │
│   ├── data/
│   │   └── products.ts           # All product data + helper functions
│   │
│   └── lib/
│       ├── types.ts              # TypeScript interfaces
│       ├── store.ts              # Zustand global state (alerts)
│       └── scraper.ts            # Web scraping logic per retailer
│
├── next.config.mjs
├── tailwind.config.ts
├── tsconfig.json
└── package.json
```

---

## API Reference

### `GET /api/prices`

Returns product data. Accepts optional query params:

| Param | Description | Example |
|-------|-------------|---------|
| `id` | Fetch a single product by ID | `/api/prices?id=ryzen-9-9950x` |
| `category` | Filter by `cpu` or `gpu` | `/api/prices?category=gpu` |

Returns all products if no params provided.

---

### `GET /api/scrape`

Scrapes live prices from Amazon, Newegg, and Best Buy.

| Param | Description | Example |
|-------|-------------|---------|
| `product` | Product name to search for | `/api/scrape?product=AMD+Ryzen+9+9950X` |

> **Note:** Retailers may block scraping requests. For production use, consider a scraping service like [ScraperAPI](https://scraperapi.com) or [Oxylabs](https://oxylabs.io), or use official APIs like the Amazon Product Advertising API.

---

### `GET /api/alerts`

Returns all saved price alerts.

### `POST /api/alerts`

Creates a new price alert.

```json
{
  "productId": "ryzen-9-9950x",
  "productName": "AMD Ryzen 9 9950X",
  "targetPrice": 499,
  "currentPrice": 549,
  "email": "you@example.com"
}
```

### `DELETE /api/alerts?id=alert-123`

Deletes an alert by ID.

> **Note:** Alerts are stored in memory by default. To persist them across restarts, replace the in-memory array in `src/app/api/alerts/route.ts` with a database (e.g. [Prisma](https://prisma.io) + SQLite/PostgreSQL).

---

## Tracked Products

### CPUs
- AMD Ryzen 9 9950X
- AMD Ryzen 9 9900X
- AMD Ryzen 7 9700X
- AMD Ryzen 5 9600X
- AMD Ryzen 7 7800X3D

### GPUs
- AMD Radeon RX 9070 XT
- AMD Radeon RX 9070
- AMD Radeon RX 7900 XTX
- AMD Radeon RX 7900 XT
- AMD Radeon RX 7800 XT

---

## Roadmap

- [ ] Persistent storage with a database (Prisma + SQLite)
- [ ] Real email notifications via SendGrid or Resend
- [ ] Automatic price refresh on a schedule (cron job)
- [ ] Add more retailers (B&H Photo, Walmart, Micro Center)
- [ ] User accounts and saved alert history
- [ ] Price drop percentage filters and sorting

---

## Disclaimer

This project is not affiliated with AMD. Product names and trademarks belong to their respective owners. Prices shown are for informational purposes and may not reflect real-time availability.
