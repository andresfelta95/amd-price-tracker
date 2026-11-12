export const dynamic = "force-dynamic";
// A full run goes through a real browser for 4 retailers × every product
export const maxDuration = 3600;

import { NextRequest, NextResponse } from "next/server";

import pool from "@/lib/db";
import { checkCronSecret } from "@/lib/cron";
import { getRetailerMap, scrapeAndSave, SCRAPE_COLUMNS, type ProductScrapeResult } from "@/lib/snapshots";
import { checkAlerts } from "@/lib/alerts";

const CATEGORIES = ["cpu", "gpu", "motherboard"];

/**
 * GET /api/scrape-all[?category=cpu,gpu]   (header: x-cron-secret: $CRON_SECRET)
 *
 * Scrapes live CA prices for every listed product (optionally only some
 * categories), saves snapshots with the screenshot/vision fallback enabled,
 * then sends any due price alerts. Called by ~/scripts/scrape-prices.sh:
 * CPUs + GPUs twice a day, motherboards once a day.
 */
export async function GET(request: NextRequest) {
  const denied = checkCronSecret(request);
  if (denied) return denied;

  const param = request.nextUrl.searchParams.get("category");
  const categories = param ? param.split(",").map((c) => c.trim()).filter((c) => CATEGORIES.includes(c)) : CATEGORIES;
  if (!categories.length) {
    return NextResponse.json({ error: `category must be one or more of ${CATEGORIES.join(", ")}` }, { status: 400 });
  }

  const client = await pool.connect();
  const summary: ProductScrapeResult[] = [];
  try {
    const pRes = await client.query(
      `SELECT ${SCRAPE_COLUMNS} FROM products
       WHERE category = ANY($1) AND NOT discontinued ORDER BY category, id`,
      [categories]
    );
    const retailerMap = await getRetailerMap(client);

    for (const product of pRes.rows) {
      summary.push((await scrapeAndSave(client, product, retailerMap, { vision: true })).summary);
      // Small delay between products to avoid rate-limiting
      await new Promise((r) => setTimeout(r, 1500));
    }
  } finally {
    client.release();
  }

  const alerts = await checkAlerts();

  return NextResponse.json({
    updatedAt: new Date().toISOString(),
    categories,
    products: summary.length,
    alerts,
    summary,
  });
}
