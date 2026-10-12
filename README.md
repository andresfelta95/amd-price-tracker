# AMD Price Tracker CA

Tracks AMD Ryzen CPU and Radeon GPU prices across **Canadian** retailers. Next.js 14
front end, PostgreSQL price history, a scheduled scraper that snapshots prices twice
a day, and per-user price alerts delivered by email or Telegram.

Live at **https://amd.paisbru.com**.

---

## Status (2026-10-11)

| Piece | State |
|---|---|
| App + UI | ✅ live, 18 products tracked |
| Accounts | ✅ email + password, email verification, password reset |
| Price alerts | ✅ per user; email (Resend) and/or Telegram, at most once a day while below target |
| Scheduled scraping | ✅ 02:30 + 14:30 (moved off the 02:00 backup); failures are now logged |
| Retailers | see [Retailers](#retailers) |
| Screenshot/vision fallback | ✅ built; active once `ANTHROPIC_API_KEY` is set on the Playwright service |
| GPU brand variants | ✅ 45 variants tracked with their own price history |

---

## Features

- **Price comparison** — latest price per retailer for each product, side by side
- **Price history charts** — full snapshot history per product (Recharts; monthly
  ticks once the range passes 60 days). Seeded history goes back to 2022-12
- **GPU brand variants** — individual AIB cards (ASUS TUF, Gigabyte Gaming OC, …)
  tracked separately from the reference SKU, each with its own price series
- **Accounts** — sign up with email + password; product pages stay public, alerts
  need an account. `/account` holds notification settings and Telegram linking
- **Price alerts** — one per product per user. After every scheduled scrape the app
  compares the cheapest **fresh (≤36h) in-stock** price with each target and notifies
  through the user's enabled channels; while the price stays under target it reminds
  once a day. Alerts can be paused/resumed; changing the target re-arms it
- **Scheduled scraping** — host cron hits `/api/scrape-all` twice a day
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
| Scraping | Axios + Cheerio, plus the separate **Playwright microservice** (`~/apps/playwright-scraper`) for JS-rendered / bot-protected sites |
| Vision fallback | Claude (`claude-sonnet-5-5`) via `@anthropic-ai/sdk`, inside the Playwright service |

---

## Retailers

| Retailer | Method | State |
|---|---|---|
| **Amazon.ca** | Playwright (stealth browser) | ✅ working |
| **Canada Computers** | Plain HTTP: JSON-LD on search → product page price | ⚠️ partial — resolves most GPUs, fails for nearly all CPUs |
| **Newegg.ca** | Playwright; listings hydrate after the `load` event | ✅ via browser (plain HTTP gets a CAPTCHA since 2026-09-10); paced 20s apart, occasionally serves an empty page |
| **Best Buy Canada** | Playwright; reads the product JSON the page fetches (`?search=` URL) | ⚠️ working again (stubbed since May); Akamai IP-bans after a burst, so requests are paced 45s apart |
| **Memory Express** | Playwright | ❌ Cloudflare challenge from this IP — detected and reported as `blocked` |

The browser scrapers pick the **cheapest listing of exactly the queried model**
(`matchesProduct` rejects look-alikes such as 9900X vs 9900X3D, RX 7600 vs 7600 XT,
9060 XT 8GB vs 16GB), skipping refurbished/combo listings, priced within 0.4–2.5× MSRP,
in-stock first.

The service paces requests per retailer (Best Buy 45s, Newegg 20s apart) and, once a
retailer answers `blocked`, skips it for a cooldown (Best Buy 6h, Newegg/Amazon 30 min,
Memory Express 12h) instead of extending the ban. `GET playwright-scraper:4000/health`
lists retailers in cooldown. A full run takes roughly 15 minutes.

### Screenshot / vision fallback

When a browser page **loads** but no price can be parsed from its markup, the
Playwright service takes a JPEG screenshot **in memory** (`page.screenshot()` returns
a Buffer — nothing is written to disk), sends it once to Claude with a structured-output
schema, and drops it. Only the extracted price is saved, as a normal snapshot with
`price_snapshots.source = 'vision'`. A reading is accepted only if the title matches
the model and the price is within 0.4–2.5× MSRP.

- Bot-challenge pages (CAPTCHA / Cloudflare / Akamai) are detected first and skipped —
  a screenshot of a challenge page has no price, so it costs nothing.
- Only scheduled runs use it (`vision: true`); the public refresh button never does.
- Budget: `VISION_MAX_CALLS_PER_12H` (default 60) rolling cap; `GET
  playwright-scraper:4000/health` shows usage. ≈ US$0.005 per call.

---

## Data model

PostgreSQL schema in [`db/schema.sql`](db/schema.sql); migrations in `db/migrations/`.

| Table | Purpose |
|---|---|
| `products` | tracked SKUs (slug PK, category, MSRP, specs JSONB) |
| `retailers` | retailer name + base URL |
| `price_snapshots` | every price check: product × retailer × time, plus `source` (`dom`/`vision`) and the page `url` |
| `gpu_variants` / `gpu_variant_snapshots` | AIB brand variants of a GPU and their price history |
| `users` | email (lowercased), scrypt hash, verification time, Telegram chat id, channel toggles |
| `sessions` | SHA-256 of the session cookie → user, 30-day expiry |
| `auth_tokens` | hashed single-use tokens: `verify_email` (24h), `reset_password` (1h), `telegram_link` (15m) |
| `alerts` | user × product target price, `active`, `last_notified_at/price` |
| `alert_notifications` | delivery log: one row per email/Telegram attempt, with the error if it failed |

Seeding helpers live in `db/seed.mjs` and `db/add-2026-products.mjs`.

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
| `GET /api/prices?id=…` / `?category=cpu\|gpu` | public | products with latest price per retailer and history |
| `GET /api/scrape?productId=…` | public, 10-min cooldown per product | live scrape of one product (no vision) |
| `GET /api/scrape-all` | `x-cron-secret` | scrape everything (vision on), then send due alerts |
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
30 2,14 * * * /home/server_pc/scripts/scrape-prices.sh
```

The script reads `CRON_SECRET` from the env file, runs a throwaway `curlimages/curl`
container on `server-net` against `http://amd-price-tracker:3000/api/scrape-all`
(`--max-time 1800`), and logs `OK …` or `ERROR curl=<rc> HTTP <code> …` to
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

Container has no host port; cloudflared routes `amd.paisbru.com → amd-price-tracker:3000`.

---

## Known issues

1. **Rate limiting on Newegg and Best Buy** — a burst of requests from this IP gets an
   Akamai 403 (Best Buy) or empty result pages (Newegg). Pacing + cooldowns keep
   scheduled runs under the limit; whether 45s is slow enough for Best Buy is still
   being confirmed against real runs (check `failed` in `scrape.log`).
2. **Memory Express** — Cloudflare challenge; needs a residential proxy, not code.
3. **Canada Computers misses all CPUs** — the JSON-LD search-result URL pattern
   matches GPU product pages but not CPU ones.
4. **Amazon.ca and Canada Computers take the first search hit**, so some snapshots are
   for the wrong card (e.g. a C$2,191 RX 9070 listing). They should use the same
   `matchesProduct` / cheapest-listing logic as the browser scrapers.

---

## Roadmap

- [x] Fix the silent 02:00 scrape failure
- [x] Deliver alert notifications (email + Telegram)
- [x] User accounts and per-user alerts
- [x] Protect `/api/scrape-all` with `CRON_SECRET`
- [x] Restore Best Buy CA
- [ ] Exact-model matching for Amazon.ca and Canada Computers
- [ ] Fix Canada Computers CPU product-URL matching
- [ ] Memory Express (residential proxy) or drop it
- [ ] Price-drop percentage filters and sorting

---

## Disclaimer

This project is not affiliated with AMD. Product names and trademarks belong to
their respective owners. Prices shown are for informational purposes and may not
reflect real-time availability.
