/**
 * Canadian retailer price fetching.
 *
 * Status (May 2026):
 * - Newegg.ca:        ✅ HTML scrape — reliable
 * - Best Buy Canada:  ✅ Playwright microservice (JS-rendered)
 * - Memory Express:   ✅ Playwright microservice (bypasses Cloudflare)
 * - Canada Computers: ✅ Playwright microservice (bypasses Unbxd JS rendering)
 */

import axios from "axios";
import * as cheerio from "cheerio";

const PLAYWRIGHT_URL = process.env.PLAYWRIGHT_SCRAPER_URL ?? "http://playwright-scraper:4000";

export interface CaPrice {
  retailer: string; // must match retailers.name in DB
  price: number | null;
  inStock: boolean;
  url: string;
  source: "api" | "scrape";
  error?: string;
}

const CA_HEADERS = {
  "User-Agent":
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
  "Accept-Language": "en-CA,en;q=0.9",
  Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8",
  "Cache-Control": "no-cache",
  Pragma: "no-cache",
};

// ── Newegg.ca ─────────────────────────────────────────────────────────────────
export async function scrapeNeweggCA(query: string): Promise<CaPrice> {
  const url = `https://www.newegg.ca/p/pl?d=${encodeURIComponent(query)}&N=4131`;
  try {
    const { data } = await axios.get(url, { headers: CA_HEADERS, timeout: 15000 });
    const $ = cheerio.load(data);

    const priceStr = $(".price-current strong").first().text().replace(/,/g, "");
    const priceSup = $(".price-current sup").first().text().replace(/[^0-9]/g, "");
    const combined = priceSup ? `${priceStr}.${priceSup}` : priceStr;
    const price = parseFloat(combined) || null;
    const outOfStock = $(".item-stock").first().text().toLowerCase().includes("out of stock");

    return {
      retailer: "Newegg.ca",
      price,
      inStock: !outOfStock && price !== null,
      url,
      source: "scrape",
    };
  } catch (err) {
    return {
      retailer: "Newegg.ca",
      price: null,
      inStock: false,
      url,
      source: "scrape",
      error: err instanceof Error ? err.message : String(err),
    };
  }
}

// ── Best Buy Canada ───────────────────────────────────────────────────────────
// Akamai Bot Manager blocks datacenter IPs — returns null gracefully.
export async function fetchBestBuyCA(query: string): Promise<CaPrice> {
  const searchUrl = `https://www.bestbuy.ca/en-ca/search?query=${encodeURIComponent(query)}`;
  return {
    retailer: "Best Buy Canada",
    price: null,
    inStock: false,
    url: searchUrl,
    source: "scrape",
    error: "Blocked by Akamai Bot Manager",
  };
}

// ── Memory Express ────────────────────────────────────────────────────────────
// Cloudflare challenge — returns null gracefully (Playwright times out).
export async function scrapeMemoryExpress(query: string): Promise<CaPrice> {
  const url = `https://www.memoryexpress.com/Search/Products?Search=${encodeURIComponent(query)}`;
  return {
    retailer: "Memory Express",
    price: null,
    inStock: false,
    url,
    source: "scrape",
    error: "Blocked by Cloudflare",
  };
}

// ── Canada Computers ──────────────────────────────────────────────────────────
// Uses ?s= (PrestaShop server-side search) + product page itemprop price.
export async function scrapeCanadaComputers(query: string): Promise<CaPrice> {
  const searchUrl = `https://www.canadacomputers.com/en/search?s=${encodeURIComponent(query)}`;
  try {
    // Step 1: search page — parse JSON-LD to find the first product URL
    const { data: searchHtml } = await axios.get(searchUrl, { headers: CA_HEADERS, timeout: 20000 });
    const $s = cheerio.load(searchHtml);

    let productUrl: string | null = null;
    $s('script[type="application/ld+json"]').each((_, el) => {
      if (productUrl) return;
      try {
        const json = JSON.parse($s(el).html() ?? "");
        const items: Array<{ url?: string; item?: { url?: string } }> =
          json?.itemListElement ?? (Array.isArray(json) ? json : [json]);
        for (const item of items) {
          const u = item?.url ?? item?.item?.url;
          // Must be a product page URL (has category + product-slug segments)
          if (u && /canadacomputers\.com\/en\/[^/]+\/\d+\//.test(u)) {
            productUrl = u;
            break;
          }
        }
      } catch (_) {}
    });

    if (!productUrl) {
      return { retailer: "Canada Computers", price: null, inStock: false, url: searchUrl, source: "scrape", error: "No product URL in search results" };
    }

    // Step 2: product page — extract price
    const { data: prodHtml } = await axios.get(productUrl, { headers: CA_HEADERS, timeout: 20000 });
    const $p = cheerio.load(prodHtml);

    // Try JSON-LD price first
    let price: number | null = null;
    $p('script[type="application/ld+json"]').each((_, el) => {
      if (price) return;
      try {
        const json = JSON.parse($p(el).html() ?? "");
        const candidate = typeof json?.offers?.price === "number" ? json.offers.price
          : typeof json?.price === "number" ? json.price : null;
        if (candidate && candidate > 0) price = candidate;
      } catch (_) {}
    });

    // Fallback: itemprop="price"
    if (!price) {
      const raw = $p('[itemprop="price"]').first().text().replace(/[^0-9.]/g, "");
      const parsed = parseFloat(raw);
      if (parsed > 0) price = parsed;
    }

    const outOfStock = $p('[class*="OutOfStock"], .product-unavailable, [data-availability="out"]').length > 0;
    return { retailer: "Canada Computers", price, inStock: !outOfStock && price !== null, url: productUrl, source: "scrape" };
  } catch (err) {
    return {
      retailer: "Canada Computers",
      price: null,
      inStock: false,
      url: searchUrl,
      source: "scrape",
      error: err instanceof Error ? err.message : String(err),
    };
  }
}

// ── Aggregate ─────────────────────────────────────────────────────────────────
export async function fetchAllCAPrices(productName: string): Promise<CaPrice[]> {
  const results = await Promise.allSettled([
    fetchBestBuyCA(productName),
    scrapeNeweggCA(productName),
    scrapeMemoryExpress(productName),
    scrapeCanadaComputers(productName),
  ]);

  const fallbacks = ["Best Buy Canada", "Newegg.ca", "Memory Express", "Canada Computers"];
  return results.map((r, i) => {
    if (r.status === "fulfilled") return r.value;
    return {
      retailer: fallbacks[i],
      price: null,
      inStock: false,
      url: "",
      source: "scrape" as const,
      error: "Request failed",
    };
  });
}
