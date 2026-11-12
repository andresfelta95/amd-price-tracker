# AMD Price Tracker CA

Tracks AMD Ryzen CPU (AM5 and AM4), Radeon GPU and AMD motherboard prices across
**Canadian** retailers. Next.js 14 front end, PostgreSQL price history, scheduled
scrapers, and per-user price alerts delivered by email or Telegram.

Live at **https://amd.paisbru.com**.

---

## Status (2026-11-12)

| Piece | State |
|---|---|
| App + UI | ✅ live, 60 products: 24 CPUs (17 AM5 / 7 AM4), 10 GPUs, 26 motherboards (20 AM5 / 6 AM4) |
| AM5 / AM4 split | ✅ socket tabs on `/cpus` and `/motherboards`; product pages list same-socket boards/CPUs |
| Accounts | ✅ email + password, email verification, password reset |
| Price alerts | ✅ per user; email (Resend) and/or Telegram, at most once a day while below target |
| Scheduled scraping | ✅ CPUs + GPUs 02:30 + 14:30, motherboards 08:30; failures are logged |
| Retailers | see [Retailers](#retailers) |
| Screenshot/vision fallback | ✅ active (key set 2026-11-12), 120 calls / 12 h cap |
| GPU brand variants | ✅ 45 variants tracked with their own price history |

---

## Features

- **Price comparison** — latest price per retailer for each product, side by side
- **Price history charts** — full snapshot history per product (Recharts; monthly
  ticks once the range passes 60 days). Seeded history goes back to 2022-12
- **AM5 / AM4 platforms** — CPUs and boards carry a `socket`; listing pages switch
  platform with `?socket=am5|am4`, and a CPU page shows the cheapest tracked board per
  chipset (a board page lists its compatible CPUs)
- **Motherboards** — a curated set of popular boards, 2–5 per chipset (AM5: A620, B650,
  B650E, B840, B850, X870, X870E; AM4: B550 — A520/X570 are no longer sold new in
  Canada), grouped by chipset
- **Exact-model matching** — each new product has a token rule (`products.match_tokens`)
  so look-alikes are never priced as the product: X870 vs X870E, B850 vs B850M,
  TOMAHAWK vs TOMAHAWK MAX, white "ICE" editions, CPU+board+RAM kits, open box
- **GPU brand variants** — individual AIB cards (ASUS TUF, Gigabyte Gaming OC, …)
  tracked separately from the reference SKU, each with its own price series
- **Accounts** — sign up with email + password; product pages stay public, alerts
  need an account. `/account` holds notification settings and Telegram linking
- **Price alerts** — one per product per user. After every scheduled scrape the app
  compares the cheapest **fresh (≤36h) in-stock** price with each target and notifies
  through the user's enabled channels; while the price stays under target it reminds
  once a day. Alerts can be paused/resumed; changing the target re-arms it
- **Scheduled scraping** — host cron hits `/api/scrape-all`: CPUs + GPUs twice a day,
  motherboards once a day
- **On-demand scraping** — refresh button per product (10-minute cooldown, no vision)
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
| Auth | Hand-rolled: Node `crypto.scrypt` passwords, DB-backed sessions, hashed single-use tokens |
| Email / chat | [Resend](https://resend.com) · Telegram Bot API |
| Scraping | The separate **Playwright microservice** ([`andresfelta95/playwright-scraper`](https://github.com/andresfelta95/playwright-scraper), `~/apps/playwright-scraper`) for every retailer; it owns product matching |
| Vision fallback | Claude (`claude-sonnet-5-5`) via `@anthropic-ai/sdk`, inside the Playwright service |

---

## Retailers

| Retailer | Method | State (2026-11-12) |
|---|---|---|
| **Canada Computers** | Plain HTTP search page: every tile's final price + online/in-store availability | ✅ cheapest exact match per search (used to take the first hit — often Open Box or a CPU+board+RAM kit) |
| **Amazon.ca** | Playwright; all priced results, exact model picked in Node | ✅ working; cooldown 30 min when it serves a CAPTCHA |
| **Newegg.ca** | Playwright; 2026 `.goods-container` markup (old `.item-cell` kept as fallback) | ✅ working again — its redesign had broken our selectors ("no listings parsed" for every product since Sept). An empty page means throttling → 30 min cooldown |
| **Best Buy Canada** | Playwright; reads the product JSON the page fetches (`?search=` URL) | ⚠️ Akamai IP-bans after a burst → 6 h cooldown; rarely returns prices |
| **Memory Express** | Playwright | ❌ Cloudflare challenge from this IP — reported as `blocked` and skipped for 12 h |

Every retailer picks the **cheapest new listing of exactly the tracked model**, in-stock
first, priced within 0.4–2.5× MSRP. Products added since 2026-11 carry a token rule
(`products.match_tokens`, e.g. `{"require":["MSI","B850","TOMAHAWK","MAX","WIFI"]}`)
— whole tokens, so X870 ≠ X870E and 5800X ≠ 5800X3D, and a bare chipset token also
rejects its `-M`/`-E` sibling. The original 18 products keep the service's CPU/GPU
name regex. Open box, refurbished, kits ("… + …"), prebuilts and laptops are never picked.

The service paces requests per retailer (Best Buy 45s, Newegg 30s, Canada Computers 2s
apart) and, once a retailer answers `blocked`, skips it for a cooldown (Best Buy 6h,
Newegg/Amazon 30 min, Canada Computers 1h, Memory Express 12h) instead of extending the
ban. `GET playwright-scraper:4000/health` lists retailers in cooldown.

### Screenshot / vision fallback

When a browser page **loads** but no price can be parsed from its markup, the
Playwright service takes a JPEG screenshot **in memory** (`page.screenshot()` returns
a Buffer — nothing is written to disk), sends it once to Claude with a structured-output
schema, and drops it. Only the extracted price is saved, as a normal snapshot with
`price_snapshots.source = 'vision'` (shown as a `vision` tag on the product page). A
reading is accepted only if the title passes the same match rule and the price is
within 0.4–2.5× MSRP.

- Bot-challenge pages (CAPTCHA / Cloudflare / Akamai) are detected first and skipped —
  a screenshot of a challenge page has no price, so it costs nothing.
- Only scheduled runs use it (`vision: true`); the public refresh button never does.
- Budget: `VISION_MAX_CALLS_PER_12H` (default 120) rolling cap; `GET
  playwright-scraper:4000/health` shows usage. ≈ US$0.005 per call.

---

## Data model

PostgreSQL schema in [`db/schema.sql`](db/schema.sql); migrations in `db/migrations/`.

| Table | Purpose |
|---|---|
| `products` | tracked SKUs: slug PK, `category` (`cpu`/`gpu`/`motherboard`), CAD `msrp` (list price when added), `specs` JSONB, `socket` (`AM4`/`AM5`), `chipset`, `match_tokens`, `discontinued` (hidden, history kept) |
| `retailers` | retailer name + base URL |
| `price_snapshots` | every price check: product × retailer × time, plus `source` (`dom`/`vision`) and the page `url` |
| `gpu_variants` / `gpu_variant_snapshots` | AIB brand variants of a GPU and their price history |
| `users` | email (lowercased), scrypt hash, verification time, Telegram chat id, channel toggles |
| `sessions` | SHA-256 of the session cookie → user, 30-day expiry |
| `auth_tokens` | hashed single-use tokens: `verify_email` (24h), `reset_password` (1h), `telegram_link` (15m) |
| `alerts` | user × product target price, `active`, `last_notified_at/price` |
| `alert_notifications` | delivery log: one row per email/Telegram attempt, with the error if it failed |

Seeding helpers live in `db/seed.mjs`, `db/add-2026-products.mjs` and
`db/add-2026-11-products.mjs` (AM4 CPUs, missing AM5 CPUs, RX 9070 GRE, motherboards —
idempotent, inserts no placeholder prices). To add a product (e.g. Zen 6 when it
launches), add it there with its `match` rule and re-run.

---

## Getting started

```bash
npm install
psql "$DATABASE_URL" -f db/schema.sql
node db/seed.mjs
npm run dev            # http://localhost:3000
```

Without `RESEND_API_KEY` the app logs verification/reset links to the console instead
of emailing them.

### Environment

App (`/home/server_pc/docker/amd-price-tracker.env`, plus `DATABASE_URL` and
`PLAYWRIGHT_SCRAPER_URL` from the compose file):

| Variable | Purpose |
|---|---|
| `APP_URL` | public base URL used in email/Telegram links (`https://amd.paisbru.com`) |
| `CRON_SECRET` | required in `x-cron-secret` by `/api/scrape-all` and `/api/cron/scrape` |
| `RESEND_API_KEY`, `EMAIL_FROM` | Resend; the sender domain must be verified in Resend |
| `TELEGRAM_BOT_TOKEN`, `TELEGRAM_BOT_USERNAME` | bot from @BotFather |
| `TELEGRAM_WEBHOOK_SECRET` | checked on every webhook call; register with `scripts/set-telegram-webhook.sh` |

Playwright service (`/home/server_pc/docker/playwright-scraper.env`):

| Variable | Purpose |
|---|---|
| `ANTHROPIC_API_KEY` | enables the vision fallback (off when empty) |
| `VISION_ENABLED` | `false` to turn it off without removing the key |
| `VISION_MODEL` | default `claude-sonnet-5-5` |
| `VISION_MAX_CALLS_PER_12H` | rolling cap on vision calls (default 60) |

---

## API reference

| Route | Auth | Purpose |
|---|---|---|
| `GET /api/prices?id=…` / `?category=cpu\|gpu\|motherboard[&socket=am5\|am4]` | public | products with latest price per retailer and history |
| `GET /api/scrape?productId=…` | public, 10-min cooldown per product | live scrape of one product (no vision) |
| `GET /api/scrape-all[?category=cpu,gpu]` | `x-cron-secret` | scrape every listed product, or only the given categories (vision on), then send due alerts |
| `POST /api/cron/scrape` | `x-cron-secret` | write one snapshot `{ productId, retailerId, price, inStock }` |
| `POST /api/auth/signup` · `login` · `logout` | — | `{ email, password }`; sets the `amd_session` cookie |
| `GET /api/auth/me` | session | current user + active alert count |
| `GET /api/auth/verify?token=` | link | email confirmation |
| `POST /api/auth/resend-verification` | session | re-send the confirmation email |
| `POST /api/auth/forgot` · `reset` | — | password reset (forgot always answers 200) |
| `GET · POST · PATCH · DELETE /api/alerts` | session | the user's alerts; POST `{ productId, targetPrice }` upserts |
| `PATCH /api/account` | session | `{ notifyEmail, notifyTelegram }` |
| `POST · DELETE /api/account/telegram` | session | get a one-time `t.me` link / unlink |
| `POST /api/telegram/webhook` | Telegram secret header | `/start <token>` links a chat, `/stop` unlinks |

---

## Scheduled scraping

```cron
30 2,14 * * * /home/server_pc/scripts/scrape-prices.sh cpu,gpu
30 8 * * *    /home/server_pc/scripts/scrape-prices.sh motherboard
```

The script takes an optional category list, reads `CRON_SECRET` from the env file, runs
a throwaway `curlimages/curl` container on `server-net` against
`http://amd-price-tracker:3000/api/scrape-all?category=…` (`--max-time 3000`), and logs `OK …` or `ERROR curl=<rc> HTTP <code> …` to
`/home/server_pc/backups/scrape.log`. Each run's JSON summary includes per-product
`saved` / `vision` / `failed` (with reasons such as `blocked`) and
`alerts: { checked, notified, failed }`.

---

## Setup checklist (one-time)

1. **Resend** — create an account, add the domain `paisbru.com`, add the DNS records
   it shows (SPF/DKIM) in Cloudflare, create an API key → `RESEND_API_KEY`.
2. **Telegram** — talk to @BotFather → `/newbot` → token → `TELEGRAM_BOT_TOKEN`, bot
   username (without @) → `TELEGRAM_BOT_USERNAME`. Then run
   `scripts/set-telegram-webhook.sh`.
3. **Anthropic** — API key → `ANTHROPIC_API_KEY` in `playwright-scraper.env`.
4. Redeploy both containers (below).

## Deploy

```bash
docker compose -f /home/server_pc/docker/compose/playwright-scraper.yml up -d --build
docker compose -f /home/server_pc/docker/compose/amd-price-tracker.yml up -d --build
```

Apply new migrations first:
`docker exec -i postgres psql -U admin -d amd_tracker < db/migrations/<file>.sql`.

Catalog scripts run inside the app container (it has `pg` and `DATABASE_URL`):
`docker exec -i -w /app amd-price-tracker node --input-type=module - < db/add-2026-11-products.mjs`.

After a Windows reboot, check that Docker Desktop's **WSL integration for Ubuntu** is on
before the stack starts: if containers start while Ubuntu isn't attached, bind mounts
such as `/home/server_pc/data/postgres` resolve inside Docker Desktop's own VM and the
databases come up **empty** (`role "admin" does not exist`). The real data is untouched;
`docker restart postgres mysql mongo redis` (then the apps) picks it up again.

Container has no host port; cloudflared routes `amd.paisbru.com → amd-price-tracker:3000`.

---

## Known issues

1. **Best Buy Canada** — Akamai bans this IP after a burst; it spends most runs in its
   6 h cooldown, so it rarely contributes prices.
2. **Memory Express** — Cloudflare challenge from this IP; skipped.
3. **New products have no images yet** (`[ CPU ]` / `[ BOARD ]` placeholders).
4. Some boards sell only as Open Box at a given retailer (e.g. the A620M-PLUS WIFI at
   Canada Computers); those retailers correctly show no price for them.

---

## Roadmap

- [x] Fix the silent 02:00 scrape failure
- [x] Deliver alert notifications (email + Telegram)
- [x] User accounts and per-user alerts
- [x] Protect `/api/scrape-all` with `CRON_SECRET`
- [x] Restore Best Buy CA
- [x] Exact-model matching for Amazon.ca and Canada Computers
- [x] Fix Canada Computers CPU matching (tile parser)
- [x] AM4 / AM5 split and motherboards
- [x] Newegg.ca selectors after its redesign
- [ ] Product images for the 2026-11 additions
- [ ] Zen 6 (AM5) CPUs when they launch — add to the catalog script
- [ ] Price-drop percentage filters and sorting

---

## Disclaimer

This project is not affiliated with AMD. Product names and trademarks belong to
their respective owners. Prices shown are for informational purposes and may not
reflect real-time availability.
