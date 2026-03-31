/**
 * Canadian retailer price fetching.
 *
 * Sources by reliability:
 * 1. Best Buy CA  — unofficial JSON API, no key needed, very reliable
 * 2. Newegg.ca    — HTML scrape, works most of the time
 * 3. Memory Express — HTML scrape, works reliably (server-rendered)
 * 4. Canada Computers — HTML scrape, works reliably (server-rendered)
 * 5. Amazon.ca    — blocked by bot detection, skipped
 */

import axios from "axios";
import * as cheerio from "cheerio";

export interface CaPrice {
  retailer: string;   // must match retailers.name in DB
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
  Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
};

// ── Best Buy Canada (JSON API, no key) ────────────────────────────────────────
export async function fetchBestBuyCA(query: string): Promise<CaPrice> {
  const url = `https://www.bestbuy.ca/api/2.0/page/search?lang=en-CA&query=${encodeURIComponent(query)}&pageSize=5`;
  try {
    const res = await axios.get(url, {
      headers: { ...CA_HEADERS, Accept: "application/json" },
      timeout: 12000,
    });

    // Response shape varies — try multiple paths
    const products =
      res.data?.products ??
      res.data?.catalogSummaries ??
      res.data?.searchResults?.products ??
      [];

    if (!products.length) {
      // Fallback: try the search page JSON embedded in a script
      return { retailer: "Best Buy Canada", price: null, inStock: false, url, source: "api", error: "No results" };
    }

    const item = products[0];
    const price =
      typeof item.salePrice === "number" ? item.salePrice :
      typeof item.regularPrice === "number" ? item.regularPrice :
      typeof item.priceWithoutEhf === "number" ? item.priceWithoutEhf :
      null;

    const inStock =
      item.availability?.toLowerCase() !== "soldout" &&
      item.availability?.toLowerCase() !== "sold out" &&
      item.onlineAvailability !== false;

    const productUrl = item.productUrl
      ? `https://www.bestbuy.ca${item.productUrl}`
      : `https://www.bestbuy.ca/en-ca/search?query=${encodeURIComponent(query)}`;

    return { retailer: "Best Buy Canada", price, inStock, url: productUrl, source: "api" };
  } catch (err) {
    return {
      retailer: "Best Buy Canada", price: null, inStock: false,
      url: `https://www.bestbuy.ca/en-ca/search?query=${encodeURIComponent(query)}`,
      source: "api",
      error: err instanceof Error ? err.message : String(err),
    };
  }
}

// ── Newegg.ca ────────────────────────────────────────────────────────────────
export async function scrapeNeweggCA(query: string): Promise<CaPrice> {
  const url = `https://www.newegg.ca/p/pl?d=${encodeURIComponent(query)}&N=4131`;
  try {
    const { data } = await axios.get(url, { headers: CA_HEADERS, timeout: 12000 });
    const $ = cheerio.load(data);

    const priceStr = $(".price-current strong").first().text().replace(/,/g, "");
    const priceSup = $(".price-current sup").first().text().replace(/[^0-9]/g, "");
    const combined = priceSup ? `${priceStr}.${priceSup}` : priceStr;
    const price = parseFloat(combined) || null;
    const outOfStock = $(".item-stock").first().text().toLowerCase().includes("out of stock");

    return { retailer: "Newegg.ca", price, inStock: !outOfStock && price !== null, url, source: "scrape" };
  } catch (err) {
    return { retailer: "Newegg.ca", price: null, inStock: false, url, source: "scrape", error: String(err) };
  }
}

// ── Memory Express ───────────────────────────────────────────────────────────
export async function scrapeMemoryExpress(query: string): Promise<CaPrice> {
  const url = `https://www.memoryexpress.com/Search/Products?Search=${encodeURIComponent(query)}`;
  try {
    const { data } = await axios.get(url, { headers: CA_HEADERS, timeout: 12000 });
    const $ = cheerio.load(data);

    // Memory Express server-rendered: price lives in .Price or .PIPrice
    const priceText =
      $(".PIPrice .Price").first().text() ||
      $(".price-current").first().text() ||
      $("[class*='Price']").first().text();
    const price = parseFloat(priceText.replace(/[^0-9.]/g, "")) || null;
    const outOfStock =
      $(".PINotInStock").length > 0 ||
      $("[class*='OutOfStock']").length > 0;

    return { retailer: "Memory Express", price, inStock: !outOfStock && price !== null, url, source: "scrape" };
  } catch (err) {
    return { retailer: "Memory Express", price: null, inStock: false, url, source: "scrape", error: String(err) };
  }
}

// ── Canada Computers ─────────────────────────────────────────────────────────
export async function scrapeCanadaComputers(query: string): Promise<CaPrice> {
  const url = `https://www.canadacomputers.com/search_results.php?keywords=${encodeURIComponent(query)}`;
  try {
    const { data } = await axios.get(url, { headers: CA_HEADERS, timeout: 12000 });
    const $ = cheerio.load(data);

    const priceText =
      $(".h2-big").first().text() ||
      $(".price-section").first().text() ||
      $("[class*='product-price']").first().text();
    const price = parseFloat(priceText.replace(/[^0-9.]/g, "")) || null;
    const outOfStock =
      $("[class*='outofstock']").length > 0 ||
      $("[class*='OutOfStock']").length > 0;

    return { retailer: "Canada Computers", price, inStock: !outOfStock && price !== null, url, source: "scrape" };
  } catch (err) {
    return { retailer: "Canada Computers", price: null, inStock: false, url, source: "scrape", error: String(err) };
  }
}

// ── Aggregate (all CA retailers) ─────────────────────────────────────────────
export async function fetchAllCAPrices(productName: string): Promise<CaPrice[]> {
  const results = await Promise.allSettled([
    fetchBestBuyCA(productName),
    scrapeNeweggCA(productName),
    scrapeMemoryExpress(productName),
    scrapeCanadaComputers(productName),
  ]);

  return results.map((r, i) => {
    const fallbackRetailer = ["Best Buy Canada", "Newegg.ca", "Memory Express", "Canada Computers"][i];
    if (r.status === "fulfilled") return r.value;
    return { retailer: fallbackRetailer, price: null, inStock: false, url: "", source: "scrape" as const, error: "Request failed" };
  });
}
