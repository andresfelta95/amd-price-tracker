import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";
import pool from "@/lib/db";
import { fetchAllCAPrices } from "@/lib/ca-scrapers";

/**
 * GET /api/scrape-all
 *
 * Scrapes live CA prices for every product in the DB and saves snapshots.
 * Run this on a schedule (e.g. Windows Task Scheduler, cron, or Vercel cron)
 * to keep prices up-to-date.
 *
 * To protect this endpoint in production add a secret check:
 *   if (request.headers.get("x-cron-secret") !== process.env.CRON_SECRET) return 401
 */
export async function GET() {
  const client = await pool.connect();
  try {
    const pRes = await client.query(`SELECT id, name FROM products ORDER BY id`);
    const rRes = await client.query(`SELECT id, name FROM retailers`);

    const retailerMap: Record<string, number> = {};
    for (const r of rRes.rows) retailerMap[r.name] = r.id;

    const summary: Array<{ productId: string; saved: string[]; failed: string[] }> = [];

    for (const product of pRes.rows) {
      const prices = await fetchAllCAPrices(product.name);
      const saved: string[] = [];
      const failed: string[] = [];

      for (const p of prices) {
        const rid = retailerMap[p.retailer];
        if (!rid) continue;
        if (p.price !== null) {
          await client.query(
            `INSERT INTO price_snapshots (product_id, retailer_id, price, in_stock)
             VALUES ($1, $2, $3, $4)`,
            [product.id, rid, p.price, p.inStock]
          );
          saved.push(p.retailer);
        } else {
          failed.push(p.retailer);
        }
      }

      summary.push({ productId: product.id, saved, failed });

      // Small delay between products to avoid rate-limiting
      await new Promise((r) => setTimeout(r, 1500));
    }

    return NextResponse.json({
      updatedAt: new Date().toISOString(),
      products: pRes.rows.length,
      summary,
    });
  } finally {
    client.release();
  }
}
