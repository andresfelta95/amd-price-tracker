# AMD Price Tracker CA

Tracks AMD Ryzen CPU and Radeon GPU prices across **Canadian** retailers. Next.js 14
front end, PostgreSQL price history, and a scheduled scraper that snapshots prices
twice a day.

Live at **https://amd.paisbru.com**.

---

## Status (2026-08-24)

| Piece | State |
|---|---|
| App + UI | ✅ live, 18 products tracked |
| Price history | ✅ 13,002 snapshots in Postgres |
| Scheduled scraping | ⚠️ runs 02:00 + 14:00; the 02:00 run fails silently (see [Known issues](#known-issues)) |
| Retailers | ⚠️ **3 of 5 live** — Best Buy CA and Memory Express are stubbed out |
| Price alerts | ⚠️ stored in the DB and displayed, but **no notification is ever sent** |
| GPU brand variants | ✅ 45 variants tracked with their own price history |

---

## Features

- **Price comparison** — latest price per retailer for each product, side by side
- **Price history charts** — full snapshot history per product (Recharts; monthly
  ticks once the range passes 60 days). Seeded history goes back to 2022-12
- **GPU brand variants** — individual AIB cards (ASUS TUF, Gigabyte Gaming OC, …)
  tracked separately from the reference SKU, each with its own price series
- **Scheduled scraping** — host cron hits `/api/scrape-all` at 02:00 and 14:00 and
  writes a snapshot per product/retailer
- **On-demand scraping** — refresh button per product
- **Price alerts** — set a target price; alerts persist in Postgres (delivery not
  implemented, see below)
- **"Silicon telemetry console" UI** — datasheet-inspired dark design (Chakra Petch
  + IBM Plex, live price ticker, signal-red accent); see [docs/DESIGN.md](docs/DESIGN.md)

---

## Tech stack

| Layer | Technology |
|-------|-----------|
| Framework | [Next.js 14](https://nextjs.org) (App Router) |
| Language | TypeScript |
| Styling | [Tailwind CSS](https://tailwindcss.com) |
| Charts | [Recharts](https://recharts.org) |
| Database | PostgreSQL (shared `postgres` container, DB `amd_tracker`) via `pg` |
| Scraping | [Axios](https://axios-http.com) + [Cheerio](https://cheerio.js.org), plus a separate **Playwright microservice** for JS-rendered / bot-protected sites |
| State | [Zustand](https://zustand-demo.pmnd.rs) |

---

## Retailers

Five retailers exist in the `retailers` table; only three produce data.

| Retailer | Method | State |
|---|---|---|
| **Newegg.ca** | HTML scrape (Cheerio) | ✅ working — most reliable source |
| **Amazon.ca** | Playwright microservice (stealth browser) | ✅ working |
| **Canada Computers** | 2-step: JSON-LD on search → product page price | ⚠️ partial — resolves most GPUs, fails for nearly all CPUs |
| **Best Buy Canada** | — | ❌ **stubbed**: returns `null` with `"Blocked by Akamai Bot Manager"`. Last real snapshot **2026-05-30** |
| **Memory Express** | — | ❌ **stubbed**: returns `null` with `"Blocked by Cloudflare"`. Last real snapshot **2026-05-30** |

The two stubbed retailers are deliberately short-circuited in
`src/lib/ca-scrapers.ts` — they are not broken selectors, the functions return a
null price without making a request. Re-enabling them needs a residential proxy or
a different approach, not a selector fix.

> ⚠️ The doc comment at the top of `src/lib/ca-scrapers.ts` still marks all four
> scrapers "✅" — that comment is stale, this table is correct.

---

## Data model

PostgreSQL schema in [`db/schema.sql`](db/schema.sql):

| Table | Purpose | Rows (2026-08-24) |
|---|---|---|
| `products` | tracked SKUs (slug PK, category, MSRP, specs JSONB) | 18 |
| `retailers` | retailer name + base URL | 5 |
| `price_snapshots` | every price check: product × retailer × time | 13,002 |
| `gpu_variants` | AIB brand variants of a GPU | 45 |
| `gpu_variant_snapshots` | price history per variant | — |
| `alerts` | target price + email per product/variant | 0 |

Seeding helpers live in `db/seed.mjs` and `db/add-2026-products.mjs`.

---

## Tracked products (18)

### CPUs (9)
Ryzen 9 9950X3D · Ryzen 9 9950X · Ryzen 9 9900X3D · Ryzen 9 9900X ·
Ryzen 7 9850X3D · Ryzen 7 9800X3D · Ryzen 7 9700X · Ryzen 7 7800X3D · Ryzen 5 9600X

### GPUs (9)
RX 9070 XT · RX 9070 · RX 9060 XT 16GB · RX 9060 XT 8GB · RX 7900 XTX ·
RX 7900 XT · RX 7800 XT · RX 7600 XT 16GB · RX 7600 8GB

---

## Getting started

### Prerequisites

- [Node.js 18+](https://nodejs.org)
- A PostgreSQL database (`DATABASE_URL`)
- Optional: the Playwright scraper service for Amazon.ca (`PLAYWRIGHT_SCRAPER_URL`)

```bash
npm install
psql "$DATABASE_URL" -f db/schema.sql
node db/seed.mjs
npm run dev            # http://localhost:3000
```

### Environment

| Variable | Purpose |
|---|---|
| `DATABASE_URL` | `postgresql://user:pass@host:5432/amd_tracker` |
| `PLAYWRIGHT_SCRAPER_URL` | defaults to `http://playwright-scraper:4000` |

---

## API reference

### `GET /api/prices`

Returns product data from the DB, with the latest price per retailer and the full
snapshot history.

| Param | Description | Example |
|-------|-------------|---------|
| `id` | Single product by slug | `/api/prices?id=ryzen-9-9950x` |
| `category` | Filter by `cpu` or `gpu` | `/api/prices?category=gpu` |

### `GET /api/scrape`

Scrapes live prices for one product on demand.

| Param | Description |
|-------|-------------|
| `product` | Product name to search for |

### `GET /api/scrape-all`

Scrapes **every** product at **every** retailer and writes snapshots. This is what
cron calls. Returns a per-product `{ saved: [], failed: [] }` summary.

> Unauthenticated. If this app is ever exposed directly, gate it behind
> `CRON_SECRET` as noted in the route's comment.

### `POST /api/cron/scrape`

Writes a single snapshot: `{ productId, retailerId, price, inStock }`.
`POST /api/cron/scrape/variant` does the same for a GPU variant.

### `GET | POST | DELETE /api/alerts`

CRUD for price alerts, backed by the `alerts` table.

> **Alerts do not notify.** There is no mailer in the codebase — no SendGrid,
> Resend, nodemailer or SMTP. An alert is stored, joined against the latest price
> and rendered on `/alerts`, but nothing sends email when the target is hit.

---

## Scheduled scraping

Host crontab:

```cron
0 2,14 * * * /home/server_pc/scripts/scrape-prices.sh
```

The script runs a throwaway `curlimages/curl` container on `server-net` and calls
`http://amd-price-tracker:3000/api/scrape-all` with `--max-time 300`, logging to
`/home/server_pc/backups/scrape.log`.

---

## Known issues

**1. The 02:00 scrape fails silently.** It failed on 5 of the last 7 nights
(Aug 18, 19, 20, 21, 24) while the 14:00 run succeeded every time. Two causes
compound:

- `0 2 * * *` also runs `backup.sh`, so the scrape competes with `pg_dumpall` and
  exceeds the 300s curl timeout.
- `scrape-prices.sh` sets `set -euo pipefail`. When `docker run` exits non-zero on
  timeout, the script dies *before* reaching its logging branch — so the log shows
  `Iniciando scraping…` with no `OK` and no `ERROR` line. Failures are invisible.

Fix: stagger the schedules, and capture the curl exit code instead of letting
`set -e` abort (`result=$(... ) || rc=$?`).

**2. Two of five retailers return nothing** — see [Retailers](#retailers).

**3. Canada Computers misses all CPUs.** The JSON-LD search-result URL pattern
matches GPU product pages but not CPU ones.

---

## Deploy

```bash
docker compose -f /home/server_pc/docker/compose/amd-price-tracker.yml up -d --build
```

Container has no host port; cloudflared routes `amd.paisbru.com → amd-price-tracker:3000`.
Limits: 512 MB / 1.0 CPU. `DATABASE_URL` and `PLAYWRIGHT_SCRAPER_URL` are injected
by the compose file.

---

## Roadmap

- [ ] Fix the silent 02:00 scrape failure (stagger cron, handle curl exit code)
- [ ] Actually deliver alert notifications (email or Telegram)
- [ ] Restore Best Buy CA + Memory Express, or drop them from the retailers table
- [ ] Fix Canada Computers CPU product-URL matching
- [ ] Protect `/api/scrape-all` with `CRON_SECRET`
- [ ] Price-drop percentage filters and sorting
- [ ] User accounts and saved alert history

---

## Disclaimer

This project is not affiliated with AMD. Product names and trademarks belong to
their respective owners. Prices shown are for informational purposes and may not
reflect real-time availability.
