import type { Pool, PoolClient } from "pg";

/**
 * A retailer's latest snapshot only counts as "current" if it's this recent.
 * Scrapes run twice a day, so 36h tolerates one failed run. Without this,
 * retailers that stopped scraping months ago still set the lowest price.
 */
export const FRESH_HOURS = 36;

export function isFresh(recordedAt: Date | string): boolean {
  return Date.now() - new Date(recordedAt).getTime() <= FRESH_HOURS * 3600 * 1000;
}

/** Lowest price among latest-per-retailer rows that are still fresh, or null. */
export function lowestRecentPrice(rows: Array<{ price: number; recorded_at: Date | string }>): number | null {
  const prices = rows.filter((r) => isFresh(r.recorded_at)).map((r) => r.price);
  return prices.length ? Math.min(...prices) : null;
}

export interface Offer {
  price: number;
  retailer: string;
  url: string;
}

/** Cheapest fresh, in-stock offer for a product — what alerts compare against. */
export async function getBestOffer(db: Pool | PoolClient, productId: string): Promise<Offer | null> {
  const res = await db.query(
    `SELECT price::float, retailer, url FROM (
       SELECT DISTINCT ON (r.id) ps.price, ps.in_stock, ps.recorded_at, r.name AS retailer,
              COALESCE(ps.url, r.url) AS url
       FROM price_snapshots ps JOIN retailers r ON r.id = ps.retailer_id
       WHERE ps.product_id = $1
       ORDER BY r.id, ps.recorded_at DESC
     ) latest
     WHERE in_stock AND recorded_at > NOW() - make_interval(hours => $2)
     ORDER BY price ASC LIMIT 1`,
    [productId, FRESH_HOURS]
  );
  return res.rows[0] ?? null;
}
