export const dynamic = "force-dynamic";
// A full run goes through a real browser for 4 retailers × every product
export const maxDuration = 1800;

import { NextRequest, NextResponse } from "next/server";

import pool from "@/lib/db";
import { checkCronSecret } from "@/lib/cron";
import { getRetailerMap, scrapeAndSave, type ProductScrapeResult } from "@/lib/snapshots";
import { checkAlerts } from "@/lib/alerts";

/**
 * GET /api/scrape-all   (header: x-cron-secret: $CRON_SECRET)
 *
 * Scrapes live CA prices for every product, saves snapshots (with the
 * screenshot/vision fallback enabled), then sends any due price alerts.
 * Called twice a day by ~/scripts/scrape-prices.sh.
 */
export async function GET(request: NextRequest) {
  const denied = checkCronSecret(request);
  if (denied) return denied;

  const client = await pool.connect();
  const summary: ProductScrapeResult[] = [];
  try {
    const pRes = await client.query(`SELECT id, name, msrp::float FROM products ORDER BY id`);
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
    products: summary.length,
    alerts,
    summary,
  });
}
