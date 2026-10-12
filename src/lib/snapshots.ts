import type { PoolClient } from "pg";
import { fetchAllCAPrices, type CaPrice, type FetchOptions } from "@/lib/ca-scrapers";

export interface ProductScrapeResult {
  productId: string;
  saved: string[];
  /** Retailers whose price was read from a screenshot (subset of saved) */
  vision: string[];
  /** "Retailer (reason)" for every retailer without a price */
  failed: string[];
}

export async function getRetailerMap(db: PoolClient): Promise<Record<string, number>> {
  const res = await db.query(`SELECT id, name FROM retailers`);
  return Object.fromEntries(res.rows.map((r) => [r.name, r.id]));
}

/** Scrapes every retailer for one product and writes a snapshot for each price found. */
export async function scrapeAndSave(
  db: PoolClient,
  product: { id: string; name: string; msrp: number },
  retailerMap: Record<string, number>,
  opts: FetchOptions
): Promise<{ summary: ProductScrapeResult; prices: CaPrice[] }> {
  const prices = await fetchAllCAPrices(product.name, { ...opts, msrp: product.msrp });
  const result: ProductScrapeResult = { productId: product.id, saved: [], vision: [], failed: [] };

  for (const p of prices) {
    const rid = retailerMap[p.retailer];
    if (!rid) continue;
    if (p.price === null) {
      result.failed.push(p.error ? `${p.retailer} (${p.error.slice(0, 60)})` : p.retailer);
      continue;
    }
    await db.query(
      `INSERT INTO price_snapshots (product_id, retailer_id, price, in_stock, source, url)
       VALUES ($1, $2, $3, $4, $5, $6)`,
      [product.id, rid, p.price, p.inStock, p.source === "vision" ? "vision" : "dom", p.url || null]
    );
    result.saved.push(p.retailer);
    if (p.source === "vision") result.vision.push(p.retailer);
  }
  return { summary: result, prices };
}
