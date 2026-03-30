import { NextRequest, NextResponse } from "next/server";
import pool from "@/lib/db";

// POST /api/cron/scrape
// Saves a price snapshot for a product+retailer into the DB.
// Body: { productId, retailerId, price, inStock }
export async function POST(request: NextRequest) {
  try {
    const { productId, retailerId, price, inStock } = await request.json();
    if (!productId || !retailerId || price == null) {
      return NextResponse.json({ error: "Missing fields" }, { status: 400 });
    }
    await pool.query(
      `INSERT INTO price_snapshots (product_id, retailer_id, price, in_stock) VALUES ($1,$2,$3,$4)`,
      [productId, retailerId, price, inStock ?? true]
    );
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Database error" }, { status: 500 });
  }
}

// POST /api/cron/scrape/variant
// Saves a price snapshot for a GPU variant.
// Body: { variantId, price, inStock }
