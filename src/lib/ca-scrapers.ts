/**
 * Canadian retailer price fetching — every retailer goes through the Playwright
 * microservice (~/apps/playwright-scraper), which owns product matching:
 *
 * - Canada Computers: plain HTTP search page, cheapest exact match across tiles
 * - Newegg.ca, Best Buy Canada, Memory Express, Amazon.ca: real browser. When a
 *   page loads but no price can be parsed from the markup, the service can fall
 *   back to reading a screenshot with Claude (`source: "vision"`). Bot-challenge
 *   and throttled pages come back as `error: "blocked"` and the retailer cools down.
 */

import axios from "axios";
import type { MatchTokens } from "@/lib/types";

const PLAYWRIGHT_URL = process.env.PLAYWRIGHT_SCRAPER_URL ?? "http://playwright-scraper:4000";

export interface CaPrice {
  retailer: string; // must match retailers.name in DB
  price: number | null;
  inStock: boolean;
  url: string;
  source: "api" | "scrape" | "vision";
  error?: string;
}

export interface FetchOptions {
  /** Used to reject implausible prices (0.4–2.5× MSRP) */
  msrp?: number;
  /** Allow the screenshot/vision fallback (scheduled runs only — it costs API credits) */
  vision?: boolean;
  /** Exact-token rule; without it the service uses its CPU/GPU name matching */
  match?: MatchTokens | null;
}

async function viaScraper(retailer: string, query: string, fallbackUrl: string, opts: FetchOptions): Promise<CaPrice> {
  try {
    const { data } = await axios.post(
      `${PLAYWRIGHT_URL}/scrape`,
      { retailer, query, msrp: opts.msrp, vision: !!opts.vision, match: opts.match ?? undefined },
      { timeout: 150000 }, // includes waiting in the per-retailer pacing queue
    );
    return {
      retailer,
      price: typeof data?.price === "number" ? data.price : null,
      inStock: !!data?.inStock,
      url: data?.url || fallbackUrl,
      source: data?.source === "vision" ? "vision" : "scrape",
      error: data?.error,
    };
  } catch (err) {
    return {
      retailer,
      price: null,
      inStock: false,
      url: fallbackUrl,
      source: "scrape",
      error: err instanceof Error ? err.message : String(err),
    };
  }
}

const q = encodeURIComponent;
const RETAILERS: Array<{ name: string; url: (query: string) => string }> = [
  { name: "Best Buy Canada", url: (s) => `https://www.bestbuy.ca/en-ca/search?search=${q(s)}` },
  { name: "Newegg.ca", url: (s) => `https://www.newegg.ca/p/pl?d=${q(s)}&N=4131` },
  { name: "Memory Express", url: (s) => `https://www.memoryexpress.com/Search/Products?Search=${q(s)}` },
  { name: "Canada Computers", url: (s) => `https://www.canadacomputers.com/en/search?s=${q(s)}` },
  { name: "Amazon.ca", url: (s) => `https://www.amazon.ca/s?k=${q(s)}` },
];

// ── Aggregate ─────────────────────────────────────────────────────────────────
export async function fetchAllCAPrices(productName: string, opts: FetchOptions = {}): Promise<CaPrice[]> {
  // viaScraper never throws, so every retailer yields a row
  return Promise.all(RETAILERS.map((r) => viaScraper(r.name, productName, r.url(productName), opts)));
}
