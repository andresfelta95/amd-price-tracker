/**
 * Canadian retailer price fetching.
 *
 * Status (May 2026):
 * - Newegg.ca:        ✅ HTML scrape — reliable
 * - Best Buy Canada:  ✅ HTML scrape — __NEXT_DATA__ JSON extraction
 * - Memory Express:   ❌ Cloudflare protection
 * - Canada Computers: ❌ JS-rendered via Unbxd (prices not in HTML)
 */

import axios from "axios";
import * as cheerio from "cheerio";

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
// Extracts product data from __NEXT_DATA__ JSON embedded in the search page.
export async function fetchBestBuyCA(query: string): Promise<CaPrice> {
  const searchUrl = `https://www.bestbuy.ca/en-ca/search?query=${encodeURIComponent(query)}`;
  try {
    const { data } = await axios.get(searchUrl, {
      headers: {
        ...CA_HEADERS,
        Referer: "https://www.google.ca/",
        "Sec-Fetch-Dest": "document",
        "Sec-Fetch-Mode": "navigate",
        "Sec-Fetch-Site": "cross-site",
      },
      timeout: 15000,
    });

    const $ = cheerio.load(data);

    // Try __NEXT_DATA__ JSON first
    const nextDataScript = $("#__NEXT_DATA__").html();
    if (nextDataScript) {
      const nextData = JSON.parse(nextDataScript);
      const products =
        nextData?.props?.pageProps?.products ??
        nextData?.props?.pageProps?.searchResults?.products ??
        nextData?.props?.initialState?.search?.products ??
        [];

      if (products.length > 0) {
        const item = products[0];
        const price =
          typeof item.salePrice === "number" ? item.salePrice :
          typeof item.regularPrice === "number" ? item.regularPrice :
          null;
        const inStock = item.availability !== "SoldOut" && item.onlineAvailability !== false;
        const productUrl = item.productUrl
          ? `https://www.bestbuy.ca${item.productUrl}`
          : searchUrl;
        return { retailer: "Best Buy Canada", price, inStock, url: productUrl, source: "scrape" };
      }
    }

    // Fallback: look for price in rendered HTML
    const priceText =
      $("[data-automation='productListingPrice']").first().text() ||
      $("[class*='productItemPrice']").first().text() ||
      $("[class*='price_']").first().text();
    const price = parseFloat(priceText.replace(/[^0-9.]/g, "")) || null;

    return {
      retailer: "Best Buy Canada",
      price,
      inStock: price !== null,
      url: searchUrl,
      source: "scrape",
      ...(price === null ? { error: "No price found in page" } : {}),
    };
  } catch (err) {
    return {
      retailer: "Best Buy Canada",
      price: null,
      inStock: false,
      url: searchUrl,
      source: "scrape",
      error: err instanceof Error ? err.message : String(err),
    };
  }
}

// ── Memory Express ────────────────────────────────────────────────────────────
// Protected by Cloudflare — returns null gracefully.
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
// Prices loaded via JS (Unbxd engine) — returns null gracefully.
export async function scrapeCanadaComputers(query: string): Promise<CaPrice> {
  const url = `https://www.canadacomputers.com/en/search?q=${encodeURIComponent(query)}`;
  return {
    retailer: "Canada Computers",
    price: null,
    inStock: false,
    url,
    source: "scrape",
    error: "JS-rendered prices (Unbxd)",
  };
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
