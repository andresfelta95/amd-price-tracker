/**
 * Pricing API integrations for accurate real-time GPU price data.
 *
 * This file documents available APIs and provides ready-to-use fetch helpers.
 * Replace placeholder API keys with your own credentials before use.
 *
 * API options ranked by usefulness for this tracker:
 *
 * 1. Best Buy Canada API    — free, official, real-time (best for CA)
 * 2. Best Buy US API        — free, official, real-time (best for US)
 * 3. Keepa API              — paid ~€19/mo, supports Amazon.ca & .com
 * 4. Rainforest API         — paid, supports Amazon marketplaces incl. CA
 * 5. PriceAPI.com           — paid, multi-retailer aggregator, 30+ countries
 * 6. Web scraping           — free but fragile; see scraper.ts for helpers
 */

export interface LivePrice {
  retailer: string;
  region: "US" | "CA";
  currency: "USD" | "CAD";
  price: number | null;
  inStock: boolean;
  url: string;
  source: "api" | "scrape";
  fetchedAt: string;
}

// ---------------------------------------------------------------------------
// Best Buy Canada — https://developer.bestbuy.com (register for free API key)
// Endpoint: https://api.bestbuy.ca/v2/products?apiKey=<KEY>&query=<QUERY>
// Note: The CA developer portal is separate from bestbuy.com; the endpoint
//       below uses the unofficial search endpoint that requires no key for
//       read-only searches (subject to rate limits).
// ---------------------------------------------------------------------------

const BESTBUY_CA_SEARCH =
  "https://www.bestbuy.ca/api/2.0/page/search?lang=en-CA&query=";

export async function fetchBestBuyCA(query: string): Promise<LivePrice[]> {
  const url = `${BESTBUY_CA_SEARCH}${encodeURIComponent(query)}`;
  const res = await fetch(url, {
    headers: { "Accept-Language": "en-CA", "User-Agent": "Mozilla/5.0" },
    next: { revalidate: 3600 }, // cache for 1 hour in Next.js
  });

  if (!res.ok) return [];

  const data = await res.json();
  // Best Buy CA returns products under data.products or data.catalogSummaries
  const items: Array<{ name: string; salePrice?: number; regularPrice: number; availability: string; productUrl: string }> =
    data?.products ?? data?.catalogSummaries ?? [];

  return items.slice(0, 5).map((item) => ({
    retailer: "Best Buy Canada",
    region: "CA",
    currency: "CAD",
    price: item.salePrice ?? item.regularPrice ?? null,
    inStock: item.availability?.toLowerCase() !== "soldout",
    url: item.productUrl
      ? `https://www.bestbuy.ca${item.productUrl}`
      : `https://www.bestbuy.ca/en-ca/search?query=${encodeURIComponent(query)}`,
    source: "api",
    fetchedAt: new Date().toISOString(),
  }));
}

// ---------------------------------------------------------------------------
// Best Buy US — https://developer.bestbuy.com (free API key required)
// Register at: https://developer.bestbuy.com/
// ---------------------------------------------------------------------------

const BESTBUY_US_API = "https://api.bestbuy.com/v1/products";

export async function fetchBestBuyUS(
  query: string,
  apiKey: string
): Promise<LivePrice[]> {
  if (!apiKey) {
    console.warn("Best Buy US API key missing. Get one at developer.bestbuy.com");
    return [];
  }

  const filter = `(search=${encodeURIComponent(query)})`;
  const fields = "name,salePrice,regularPrice,inStoreAvailability,url";
  const url = `${BESTBUY_US_API}${filter}?format=json&show=${fields}&pageSize=5&apiKey=${apiKey}`;

  const res = await fetch(url, { next: { revalidate: 3600 } });
  if (!res.ok) return [];

  const data = await res.json();
  const items: Array<{ name: string; salePrice?: number; regularPrice: number; inStoreAvailability: boolean; url: string }> =
    data?.products ?? [];

  return items.map((item) => ({
    retailer: "Best Buy",
    region: "US",
    currency: "USD",
    price: item.salePrice ?? item.regularPrice ?? null,
    inStock: item.inStoreAvailability ?? false,
    url: item.url,
    source: "api",
    fetchedAt: new Date().toISOString(),
  }));
}

// ---------------------------------------------------------------------------
// Keepa API — https://keepa.com/#!api (paid, ~€19/mo)
// Supports Amazon.com (marketplace 1) and Amazon.ca (marketplace 7).
// Docs: https://keepa.com/#!discuss/t/api-documentation/9
// ---------------------------------------------------------------------------

const KEEPA_API = "https://api.keepa.com/product";
const KEEPA_MARKETPLACE_CA = 7; // Amazon.ca
const KEEPA_MARKETPLACE_US = 1; // Amazon.com

export async function fetchKeepaPrice(
  asin: string,
  marketplace: 1 | 7,
  apiKey: string
): Promise<LivePrice | null> {
  if (!apiKey) {
    console.warn("Keepa API key missing. Subscribe at keepa.com");
    return null;
  }

  const url = `${KEEPA_API}?key=${apiKey}&domain=${marketplace}&asin=${asin}&stats=1`;
  const res = await fetch(url, { next: { revalidate: 3600 } });
  if (!res.ok) return null;

  const data = await res.json();
  const product = data?.products?.[0];
  if (!product) return null;

  // Keepa prices are in cents * 100 (divide by 100 for dollars)
  const rawPrice = product.stats?.current?.[0]; // Amazon current price
  const price = rawPrice != null && rawPrice > 0 ? rawPrice / 100 : null;

  return {
    retailer: marketplace === KEEPA_MARKETPLACE_CA ? "Amazon Canada" : "Amazon",
    region: marketplace === KEEPA_MARKETPLACE_CA ? "CA" : "US",
    currency: marketplace === KEEPA_MARKETPLACE_CA ? "CAD" : "USD",
    price,
    inStock: price !== null,
    url: `https://www.amazon.${marketplace === KEEPA_MARKETPLACE_CA ? "ca" : "com"}/dp/${asin}`,
    source: "api",
    fetchedAt: new Date().toISOString(),
  };
}

export { KEEPA_MARKETPLACE_CA, KEEPA_MARKETPLACE_US };

// ---------------------------------------------------------------------------
// PriceAPI.com — https://www.priceapi.com (paid, 1000 free credits trial)
// Aggregates Amazon, eBay, Google Shopping, and 100+ sources in 30+ countries.
// Docs: https://app.priceapi.com/documentation
// ---------------------------------------------------------------------------

const PRICEAPI_URL = "https://api.priceapi.com/jobs";

export async function fetchPriceAPI(
  query: string,
  country: "us" | "ca",
  apiKey: string
): Promise<LivePrice[]> {
  if (!apiKey) {
    console.warn("PriceAPI key missing. Register at priceapi.com");
    return [];
  }

  const body = {
    token: apiKey,
    source: "google_shopping",
    country,
    topic: "search_results",
    key: "term",
    values: query,
  };

  const createRes = await fetch(PRICEAPI_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!createRes.ok) return [];

  const job = await createRes.json();
  const jobId = job?.job?.id;
  if (!jobId) return [];

  // Poll for results (jobs typically complete in a few seconds)
  for (let attempt = 0; attempt < 10; attempt++) {
    await new Promise((r) => setTimeout(r, 2000));
    const resultRes = await fetch(`${PRICEAPI_URL}/${jobId}/download`, {
      headers: { Authorization: `Token ${apiKey}` },
    });
    if (!resultRes.ok) continue;

    const result = await resultRes.json();
    const items: Array<{ merchant_name: string; min_price?: string; price: string; availability: string; url: string }> =
      result?.results ?? [];

    return items.slice(0, 10).map((item) => ({
      retailer: item.merchant_name,
      region: country === "ca" ? "CA" : "US",
      currency: country === "ca" ? "CAD" : "USD",
      price: parseFloat(item.min_price ?? item.price) || null,
      inStock: item.availability?.toLowerCase() !== "out of stock",
      url: item.url,
      source: "api",
      fetchedAt: new Date().toISOString(),
    }));
  }

  return [];
}

// ---------------------------------------------------------------------------
// Street Merchant open-source reference
// https://github.com/jef/streetmerchant
//
// Supported Canadian retailers (useful for scraping reference):
//   - amazon-ca     → amazon.ca
//   - bestbuy-ca    → bestbuy.ca
//   - canadacomputers
//   - newegg-ca     → newegg.ca
//   - walmart-ca    → walmart.ca
//   - vuugo         → vuugo.ca
//
// This project provides retailer-specific selectors and request patterns.
// See scraper.ts for our own implementations inspired by this project.
// ---------------------------------------------------------------------------

/**
 * Environment variable names expected in .env.local:
 *
 *   BESTBUY_US_API_KEY=your_key_here     # https://developer.bestbuy.com
 *   KEEPA_API_KEY=your_key_here          # https://keepa.com/#!api
 *   PRICEAPI_KEY=your_key_here           # https://priceapi.com
 *
 * Usage example (Next.js API route):
 *
 *   import { fetchBestBuyCA, fetchKeepaPrice, KEEPA_MARKETPLACE_CA } from "@/lib/pricing-apis";
 *
 *   const [bbPrices, keepaPrice] = await Promise.all([
 *     fetchBestBuyCA("AMD Radeon RX 9070 XT"),
 *     fetchKeepaPrice("B0DRX9070XT", KEEPA_MARKETPLACE_CA, process.env.KEEPA_API_KEY!),
 *   ]);
 */
