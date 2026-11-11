export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";

import pool from "@/lib/db";
import { getRetailerMap, scrapeAndSave } from "@/lib/snapshots";

// Public endpoint (product page refresh button): rate-limited per product,
// and never uses the paid screenshot/vision fallback.
const COOLDOWN_MINUTES = 10;

/**
 * GET /api/scrape?productId=rx-9070-xt
 *
 * Fetches live CA prices for a product, saves them as price_snapshots,
 * and returns per-retailer status.
 */
export async function GET(request: NextRequest) {
  const productId = request.nextUrl.searchParams.get("productId");

  if (!productId) {
    return NextResponse.json({ error: "Missing productId" }, { status: 400 });
  }

  const client = await pool.connect();
  try {
    const pRes = await client.query(
      `SELECT id, name, msrp::float,
              (SELECT MAX(recorded_at) FROM price_snapshots WHERE product_id = products.id) AS last_scraped
       FROM products WHERE id = $1`,
      [productId]
    );
    if (!pRes.rows.length) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }
    const product = pRes.rows[0];

    const last: Date | null = product.last_scraped;
    if (last && Date.now() - last.getTime() < COOLDOWN_MINUTES * 60 * 1000) {
      return NextResponse.json(
        { error: `Prices were refreshed less than ${COOLDOWN_MINUTES} minutes ago`, lastScraped: last.toISOString() },
        { status: 429 }
      );
    }

    const { summary, prices } = await scrapeAndSave(client, product, await getRetailerMap(client), { vision: false });

    return NextResponse.json({
      productId,
      productName: product.name,
      scrapedAt: new Date().toISOString(),
      results: prices,
      saved: summary.saved,
      failed: summary.failed,
    });
  } finally {
    client.release();
  }
}
