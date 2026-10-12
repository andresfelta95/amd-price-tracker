export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import pool from "@/lib/db";
import { requireUser } from "@/lib/auth";
import { getBestOffer } from "@/lib/prices";
import type { PriceAlert } from "@/lib/types";

async function loadAlerts(userId: number, alertId?: number): Promise<PriceAlert[]> {
  const res = await pool.query(
    `SELECT a.id, a.product_id, a.target_price::float, a.active, a.last_notified_at,
            a.last_notified_price::float, a.created_at, p.name AS product_name
     FROM alerts a JOIN products p ON p.id = a.product_id
     WHERE a.user_id = $1 AND ($2::int IS NULL OR a.id = $2)
     ORDER BY a.created_at DESC`,
    [userId, alertId ?? null]
  );
  return Promise.all(
    res.rows.map(async (r) => {
      const offer = await getBestOffer(pool, r.product_id);
      return {
        id: r.id,
        productId: r.product_id,
        productName: r.product_name,
        targetPrice: r.target_price,
        currentPrice: offer?.price ?? null,
        currentRetailer: offer?.retailer ?? null,
        belowTarget: offer !== null && offer.price <= r.target_price,
        active: r.active,
        lastNotifiedAt: r.last_notified_at?.toISOString() ?? null,
        lastNotifiedPrice: r.last_notified_price,
        createdAt: r.created_at.toISOString(),
      };
    })
  );
}

function parsePrice(value: unknown): number | null {
  const n = typeof value === "number" ? value : parseFloat(String(value));
  return Number.isFinite(n) && n > 0 && n < 100000 ? Math.round(n * 100) / 100 : null;
}

export async function GET() {
  const user = await requireUser();
  if (user instanceof NextResponse) return user;
  return NextResponse.json(await loadAlerts(user.id));
}

// POST { productId, targetPrice } — one alert per product per user; posting again updates and re-arms it
export async function POST(request: NextRequest) {
  const user = await requireUser();
  if (user instanceof NextResponse) return user;

  const body = await request.json().catch(() => ({}));
  const targetPrice = parsePrice(body.targetPrice);
  if (typeof body.productId !== "string" || targetPrice === null) {
    return NextResponse.json({ error: "productId and a positive targetPrice are required" }, { status: 400 });
  }
  const product = await pool.query(`SELECT 1 FROM products WHERE id = $1`, [body.productId]);
  if (!product.rowCount) return NextResponse.json({ error: "Unknown product" }, { status: 404 });

  const updated = await pool.query(
    `UPDATE alerts SET target_price = $3, active = TRUE, last_notified_at = NULL, last_notified_price = NULL
     WHERE user_id = $1 AND product_id = $2 RETURNING id`,
    [user.id, body.productId, targetPrice]
  );
  const id: number = updated.rows[0]?.id ??
    (
      await pool.query(
        `INSERT INTO alerts (user_id, product_id, target_price) VALUES ($1, $2, $3) RETURNING id`,
        [user.id, body.productId, targetPrice]
      )
    ).rows[0].id;

  const [alert] = await loadAlerts(user.id, id);
  return NextResponse.json(alert, { status: updated.rowCount ? 200 : 201 });
}

// PATCH { id, active?, targetPrice? } — pause/re-arm or change the target
export async function PATCH(request: NextRequest) {
  const user = await requireUser();
  if (user instanceof NextResponse) return user;

  const body = await request.json().catch(() => ({}));
  const id = parseInt(String(body.id));
  const targetPrice = body.targetPrice === undefined ? undefined : parsePrice(body.targetPrice);
  if (!Number.isInteger(id) || targetPrice === null) {
    return NextResponse.json({ error: "Invalid id or targetPrice" }, { status: 400 });
  }

  const res = await pool.query(
    `UPDATE alerts SET
       active = COALESCE($3::boolean, active),
       target_price = COALESCE($4::numeric, target_price),
       -- Re-arming or changing the target starts the daily reminder cycle over
       last_notified_at = CASE WHEN $3::boolean IS TRUE OR $4::numeric IS NOT NULL THEN NULL ELSE last_notified_at END
     WHERE id = $1 AND user_id = $2`,
    [id, user.id, typeof body.active === "boolean" ? body.active : null, targetPrice ?? null]
  );
  if (!res.rowCount) return NextResponse.json({ error: "Alert not found" }, { status: 404 });

  const [alert] = await loadAlerts(user.id, id);
  return NextResponse.json(alert);
}

export async function DELETE(request: NextRequest) {
  const user = await requireUser();
  if (user instanceof NextResponse) return user;

  const id = parseInt(request.nextUrl.searchParams.get("id") ?? "");
  if (!Number.isInteger(id)) return NextResponse.json({ error: "Missing alert id" }, { status: 400 });

  const res = await pool.query(`DELETE FROM alerts WHERE id = $1 AND user_id = $2`, [id, user.id]);
  if (!res.rowCount) return NextResponse.json({ error: "Alert not found" }, { status: 404 });
  return NextResponse.json({ success: true });
}
