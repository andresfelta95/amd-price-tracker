import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";
import pool from "@/lib/db";
import { fetchAllCAPrices } from "@/lib/ca-scrapers";

/**
 * GET /api/scrape?productId=rx-9070-xt
 *
 * Fetches live CA prices for a product, saves them as price_snapshots,
 * and returns the results with per-retailer status.
 */
export async function GET(request: NextRequest) {
  const productId = request.nextUrl.searchParams.get("productId");

  if (!productId) {
    return NextResponse.json({ error: "Missing productId" }, { status: 400 });
  }

  const client = await pool.connect();
  try {
    // Look up product name + retailer IDs
    const pRes = await client.query(
      `SELECT id, name FROM products WHERE id = $1`,
      [productId]
    );
    if (!pRes.rows.length) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }
    const productName = pRes.rows[0].name;

    // Get retailer ID map
    const rRes = await client.query(`SELECT id, name FROM retailers`);
    const retailerMap: Record<string, number> = {};
    for (const r of rRes.rows) retailerMap[r.name] = r.id;

    // Fetch live prices from all CA retailers
    const prices = await fetchAllCAPrices(productName);

    // Save snapshots for successful results
    const saved: string[] = [];
    const failed: string[] = [];

    for (const p of prices) {
      const rid = retailerMap[p.retailer];
      if (!rid) continue;

      if (p.price !== null) {
        await client.query(
          `INSERT INTO price_snapshots (product_id, retailer_id, price, in_stock)
           VALUES ($1, $2, $3, $4)`,
          [productId, rid, p.price, p.inStock]
        );
        saved.push(p.retailer);
      } else {
        failed.push(p.retailer);
      }
    }

    return NextResponse.json({
      productId,
      productName,
      scrapedAt: new Date().toISOString(),
      results: prices,
      saved,
      failed,
    });
  } finally {
    client.release();
  }
}
