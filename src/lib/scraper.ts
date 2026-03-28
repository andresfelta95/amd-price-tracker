import axios from "axios";
import * as cheerio from "cheerio";

export interface ScrapedPrice {
  retailer: string;
  price: number | null;
  url: string;
  inStock: boolean;
  error?: string;
}

/**
 * Scrapes a product price from Amazon search page.
 * NOTE: Real scraping may be blocked by retailers.
 * This provides the structure — in production, consider using
 * official APIs (Amazon Product Advertising API, etc.) or
 * a scraping service like ScraperAPI, Oxylabs, or Bright Data.
 */
export async function scrapeAmazon(query: string): Promise<ScrapedPrice> {
  try {
    const searchUrl = `https://www.amazon.com/s?k=${encodeURIComponent(query)}`;
    const { data } = await axios.get(searchUrl, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        Accept: "text/html,application/xhtml+xml",
        "Accept-Language": "en-US,en;q=0.9",
      },
      timeout: 10000,
    });

    const $ = cheerio.load(data);
    const priceWhole = $(".a-price-whole").first().text().replace(",", "");
    const priceFraction = $(".a-price-fraction").first().text();
    const price = parseFloat(`${priceWhole}${priceFraction}`);

    return {
      retailer: "Amazon",
      price: isNaN(price) ? null : price,
      url: searchUrl,
      inStock: price > 0,
    };
  } catch (error) {
    return {
      retailer: "Amazon",
      price: null,
      url: "",
      inStock: false,
      error: `Scraping failed: ${error instanceof Error ? error.message : "Unknown error"}`,
    };
  }
}

export async function scrapeNewegg(query: string): Promise<ScrapedPrice> {
  try {
    const searchUrl = `https://www.newegg.com/p/pl?d=${encodeURIComponent(query)}`;
    const { data } = await axios.get(searchUrl, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        Accept: "text/html,application/xhtml+xml",
        "Accept-Language": "en-US,en;q=0.9",
      },
      timeout: 10000,
    });

    const $ = cheerio.load(data);
    const priceText = $(".price-current strong").first().text();
    const priceSup = $(".price-current sup").first().text();
    const price = parseFloat(`${priceText}${priceSup}`);

    return {
      retailer: "Newegg",
      price: isNaN(price) ? null : price,
      url: searchUrl,
      inStock: price > 0,
    };
  } catch (error) {
    return {
      retailer: "Newegg",
      price: null,
      url: "",
      inStock: false,
      error: `Scraping failed: ${error instanceof Error ? error.message : "Unknown error"}`,
    };
  }
}

export async function scrapeBestBuy(query: string): Promise<ScrapedPrice> {
  try {
    const searchUrl = `https://www.bestbuy.com/site/searchpage.jsp?st=${encodeURIComponent(query)}`;
    const { data } = await axios.get(searchUrl, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        Accept: "text/html,application/xhtml+xml",
        "Accept-Language": "en-US,en;q=0.9",
      },
      timeout: 10000,
    });

    const $ = cheerio.load(data);
    const priceText = $("[data-testid='customer-price'] span").first().text();
    const price = parseFloat(priceText.replace(/[^0-9.]/g, ""));

    return {
      retailer: "Best Buy",
      price: isNaN(price) ? null : price,
      url: searchUrl,
      inStock: price > 0,
    };
  } catch (error) {
    return {
      retailer: "Best Buy",
      price: null,
      url: "",
      inStock: false,
      error: `Scraping failed: ${error instanceof Error ? error.message : "Unknown error"}`,
    };
  }
}

/**
 * Scrapes prices from all supported retailers for a given product.
 */
export async function scrapeAllPrices(
  productName: string
): Promise<ScrapedPrice[]> {
  const results = await Promise.allSettled([
    scrapeAmazon(productName),
    scrapeNewegg(productName),
    scrapeBestBuy(productName),
  ]);

  return results.map((result) =>
    result.status === "fulfilled"
      ? result.value
      : {
          retailer: "Unknown",
          price: null,
          url: "",
          inStock: false,
          error: "Request failed",
        }
  );
}
