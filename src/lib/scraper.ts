import axios from "axios";
import * as cheerio from "cheerio";

export interface ScrapedPrice {
  retailer: string;
  region: "US" | "CA";
  currency: "USD" | "CAD";
  price: number | null;
  url: string;
  inStock: boolean;
  error?: string;
}

const BROWSER_HEADERS = {
  "User-Agent":
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
  Accept: "text/html,application/xhtml+xml",
  "Accept-Language": "en-US,en;q=0.9",
};

const CA_HEADERS = {
  ...BROWSER_HEADERS,
  "Accept-Language": "en-CA,en;q=0.9",
};

// ============================================================
// US Retailers
// ============================================================

/**
 * Scrapes a product price from Amazon.com.
 * NOTE: Real scraping is often blocked. For production use
 * the Keepa API or Rainforest API instead (see pricing-apis.ts).
 */
export async function scrapeAmazon(query: string): Promise<ScrapedPrice> {
  const searchUrl = `https://www.amazon.com/s?k=${encodeURIComponent(query)}`;
  try {
    const { data } = await axios.get(searchUrl, {
      headers: BROWSER_HEADERS,
      timeout: 10000,
    });

    const $ = cheerio.load(data);
    const priceWhole = $(".a-price-whole").first().text().replace(",", "");
    const priceFraction = $(".a-price-fraction").first().text();
    const price = parseFloat(`${priceWhole}${priceFraction}`);

    return {
      retailer: "Amazon",
      region: "US",
      currency: "USD",
      price: isNaN(price) ? null : price,
      url: searchUrl,
      inStock: price > 0,
    };
  } catch (error) {
    return {
      retailer: "Amazon",
      region: "US",
      currency: "USD",
      price: null,
      url: searchUrl,
      inStock: false,
      error: `Scraping failed: ${error instanceof Error ? error.message : "Unknown error"}`,
    };
  }
}

export async function scrapeNewegg(query: string): Promise<ScrapedPrice> {
  const searchUrl = `https://www.newegg.com/p/pl?d=${encodeURIComponent(query)}`;
  try {
    const { data } = await axios.get(searchUrl, {
      headers: BROWSER_HEADERS,
      timeout: 10000,
    });

    const $ = cheerio.load(data);
    const priceText = $(".price-current strong").first().text();
    const priceSup = $(".price-current sup").first().text();
    const price = parseFloat(`${priceText}${priceSup}`);

    return {
      retailer: "Newegg",
      region: "US",
      currency: "USD",
      price: isNaN(price) ? null : price,
      url: searchUrl,
      inStock: price > 0,
    };
  } catch (error) {
    return {
      retailer: "Newegg",
      region: "US",
      currency: "USD",
      price: null,
      url: searchUrl,
      inStock: false,
      error: `Scraping failed: ${error instanceof Error ? error.message : "Unknown error"}`,
    };
  }
}

export async function scrapeBestBuy(query: string): Promise<ScrapedPrice> {
  const searchUrl = `https://www.bestbuy.com/site/searchpage.jsp?st=${encodeURIComponent(query)}`;
  try {
    const { data } = await axios.get(searchUrl, {
      headers: BROWSER_HEADERS,
      timeout: 10000,
    });

    const $ = cheerio.load(data);
    const priceText = $("[data-testid='customer-price'] span").first().text();
    const price = parseFloat(priceText.replace(/[^0-9.]/g, ""));

    return {
      retailer: "Best Buy",
      region: "US",
      currency: "USD",
      price: isNaN(price) ? null : price,
      url: searchUrl,
      inStock: price > 0,
    };
  } catch (error) {
    return {
      retailer: "Best Buy",
      region: "US",
      currency: "USD",
      price: null,
      url: searchUrl,
      inStock: false,
      error: `Scraping failed: ${error instanceof Error ? error.message : "Unknown error"}`,
    };
  }
}

// ============================================================
// Canadian Retailers
// ============================================================

/**
 * Scrapes Amazon.ca for Canadian pricing.
 * NOTE: Consider using the Keepa API (marketplace 7) for more
 * reliable Amazon.ca data. See pricing-apis.ts.
 */
export async function scrapeAmazonCA(query: string): Promise<ScrapedPrice> {
  const searchUrl = `https://www.amazon.ca/s?k=${encodeURIComponent(query)}`;
  try {
    const { data } = await axios.get(searchUrl, {
      headers: CA_HEADERS,
      timeout: 10000,
    });

    const $ = cheerio.load(data);
    const priceWhole = $(".a-price-whole").first().text().replace(",", "");
    const priceFraction = $(".a-price-fraction").first().text();
    const price = parseFloat(`${priceWhole}${priceFraction}`);

    return {
      retailer: "Amazon Canada",
      region: "CA",
      currency: "CAD",
      price: isNaN(price) ? null : price,
      url: searchUrl,
      inStock: price > 0,
    };
  } catch (error) {
    return {
      retailer: "Amazon Canada",
      region: "CA",
      currency: "CAD",
      price: null,
      url: searchUrl,
      inStock: false,
      error: `Scraping failed: ${error instanceof Error ? error.message : "Unknown error"}`,
    };
  }
}

/**
 * Scrapes Best Buy Canada.
 * For more reliable data consider using the Best Buy Canada API endpoint
 * (fetchBestBuyCA in pricing-apis.ts) which requires no API key.
 */
export async function scrapeBestBuyCA(query: string): Promise<ScrapedPrice> {
  const searchUrl = `https://www.bestbuy.ca/en-ca/search?query=${encodeURIComponent(query)}`;
  try {
    const { data } = await axios.get(searchUrl, {
      headers: CA_HEADERS,
      timeout: 10000,
    });

    const $ = cheerio.load(data);
    // Best Buy CA uses a React-rendered page; price is in a data attribute or script tag
    const priceText = $("[data-automation='product-price']").first().text()
      || $(".productPricingWrapper__1Lufq").first().text();
    const price = parseFloat(priceText.replace(/[^0-9.]/g, ""));

    return {
      retailer: "Best Buy Canada",
      region: "CA",
      currency: "CAD",
      price: isNaN(price) ? null : price,
      url: searchUrl,
      inStock: price > 0,
    };
  } catch (error) {
    return {
      retailer: "Best Buy Canada",
      region: "CA",
      currency: "CAD",
      price: null,
      url: searchUrl,
      inStock: false,
      error: `Scraping failed: ${error instanceof Error ? error.message : "Unknown error"}`,
    };
  }
}

/**
 * Scrapes Memory Express — a major Canadian PC components retailer.
 * No official API; scraping required.
 */
export async function scrapeMemoryExpress(query: string): Promise<ScrapedPrice> {
  const searchUrl = `https://www.memoryexpress.com/Search/Products?Search=${encodeURIComponent(query)}`;
  try {
    const { data } = await axios.get(searchUrl, {
      headers: CA_HEADERS,
      timeout: 10000,
    });

    const $ = cheerio.load(data);
    // Memory Express shows price in .price span inside .PIPrice
    const priceText = $(".PIPrice .Price").first().text()
      || $(".price").first().text();
    const price = parseFloat(priceText.replace(/[^0-9.]/g, ""));
    const outOfStock = $(".PINotInStock").length > 0
      || $(".out-of-stock").length > 0;

    return {
      retailer: "Memory Express",
      region: "CA",
      currency: "CAD",
      price: isNaN(price) ? null : price,
      url: searchUrl,
      inStock: !outOfStock && price > 0,
    };
  } catch (error) {
    return {
      retailer: "Memory Express",
      region: "CA",
      currency: "CAD",
      price: null,
      url: searchUrl,
      inStock: false,
      error: `Scraping failed: ${error instanceof Error ? error.message : "Unknown error"}`,
    };
  }
}

/**
 * Scrapes Canada Computers — large Canadian PC parts retailer.
 * An unofficial community API also exists (see pricing-apis.ts notes).
 */
export async function scrapeCanadaComputers(query: string): Promise<ScrapedPrice> {
  const searchUrl = `https://www.canadacomputers.com/search_results.php?keywords=${encodeURIComponent(query)}`;
  try {
    const { data } = await axios.get(searchUrl, {
      headers: CA_HEADERS,
      timeout: 10000,
    });

    const $ = cheerio.load(data);
    const priceText = $(".price-section .h2-big").first().text()
      || $(".product-price").first().text();
    const price = parseFloat(priceText.replace(/[^0-9.]/g, ""));
    const outOfStock = $(".out-of-stock").length > 0
      || $(".product-outofstock").length > 0;

    return {
      retailer: "Canada Computers",
      region: "CA",
      currency: "CAD",
      price: isNaN(price) ? null : price,
      url: searchUrl,
      inStock: !outOfStock && price > 0,
    };
  } catch (error) {
    return {
      retailer: "Canada Computers",
      region: "CA",
      currency: "CAD",
      price: null,
      url: searchUrl,
      inStock: false,
      error: `Scraping failed: ${error instanceof Error ? error.message : "Unknown error"}`,
    };
  }
}

/**
 * Scrapes Newegg Canada.
 */
export async function scrapeNeweggCA(query: string): Promise<ScrapedPrice> {
  const searchUrl = `https://www.newegg.ca/p/pl?d=${encodeURIComponent(query)}`;
  try {
    const { data } = await axios.get(searchUrl, {
      headers: CA_HEADERS,
      timeout: 10000,
    });

    const $ = cheerio.load(data);
    const priceText = $(".price-current strong").first().text();
    const priceSup = $(".price-current sup").first().text();
    const price = parseFloat(`${priceText}${priceSup}`);

    return {
      retailer: "Newegg Canada",
      region: "CA",
      currency: "CAD",
      price: isNaN(price) ? null : price,
      url: searchUrl,
      inStock: price > 0,
    };
  } catch (error) {
    return {
      retailer: "Newegg Canada",
      region: "CA",
      currency: "CAD",
      price: null,
      url: searchUrl,
      inStock: false,
      error: `Scraping failed: ${error instanceof Error ? error.message : "Unknown error"}`,
    };
  }
}

// ============================================================
// Aggregate scrapers
// ============================================================

/**
 * Scrapes all US retailers for a given product query.
 */
export async function scrapeUSPrices(productName: string): Promise<ScrapedPrice[]> {
  const results = await Promise.allSettled([
    scrapeAmazon(productName),
    scrapeNewegg(productName),
    scrapeBestBuy(productName),
    scrapeCanadaComputers(productName),
  ]);

  return results.map((result) =>
    result.status === "fulfilled"
      ? result.value
      : { retailer: "Unknown", region: "US" as const, currency: "USD" as const, price: null, url: "", inStock: false, error: "Request failed" }
  );
}

/**
 * Scrapes all Canadian retailers for a given product query.
 */
export async function scrapeCANADAPrices(productName: string): Promise<ScrapedPrice[]> {
  const results = await Promise.allSettled([
    scrapeAmazonCA(productName),
    scrapeBestBuyCA(productName),
    scrapeMemoryExpress(productName),
    scrapeCanadaComputers(productName),
    scrapeNeweggCA(productName),
  ]);

  return results.map((result) =>
    result.status === "fulfilled"
      ? result.value
      : { retailer: "Unknown", region: "CA" as const, currency: "CAD" as const, price: null, url: "", inStock: false, error: "Request failed" }
  );
}

/**
 * Scrapes all supported retailers (US + Canada) for a given product.
 */
export async function scrapeAllPrices(productName: string): Promise<ScrapedPrice[]> {
  const [usPrices, caPrices] = await Promise.all([
    scrapeUSPrices(productName),
    scrapeCANADAPrices(productName),
  ]);
  return [...usPrices, ...caPrices];
}
