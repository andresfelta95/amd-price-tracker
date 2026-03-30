import { NextRequest, NextResponse } from "next/server";
import pool from "@/lib/db";

export async function GET() {
  try {
    const res = await pool.query(
      `SELECT a.id, a.product_id, a.variant_id, a.target_price::float,
              a.email, a.triggered, a.created_at,
              p.name AS product_name,
              gv.full_name AS variant_name,
              (SELECT price::float FROM price_snapshots WHERE product_id=a.product_id ORDER BY recorded_at DESC LIMIT 1) AS current_price
       FROM alerts a
       LEFT JOIN products p ON p.id = a.product_id
       LEFT JOIN gpu_variants gv ON gv.id = a.variant_id
       ORDER BY a.created_at DESC`
    );
    return NextResponse.json(
      res.rows.map((r) => ({
        id: r.id.toString(),
        productId: r.product_id,
        variantId: r.variant_id,
        productName: r.variant_name || r.product_name,
        targetPrice: r.target_price,
        currentPrice: r.current_price ?? 0,
        isTriggered: r.triggered,
        createdAt: r.created_at.toISOString(),
        email: r.email,
      }))
    );
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Database error" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { productId, variantId, targetPrice, currentPrice, email } = body;

    if (!productId || !targetPrice || !email) {
      return NextResponse.json(
        { error: "Missing required fields: productId, targetPrice, email" },
        { status: 400 }
      );
    }

    const triggered = currentPrice != null && currentPrice <= targetPrice;

    const res = await pool.query(
      `INSERT INTO alerts (product_id, variant_id, target_price, email, triggered)
       VALUES ($1, $2, $3, $4, $5) RETURNING id, created_at`,
      [productId, variantId || null, targetPrice, email, triggered]
    );

    const pRes = await pool.query(`SELECT name FROM products WHERE id=$1`, [productId]);

    return NextResponse.json(
      {
        id: res.rows[0].id.toString(),
        productId,
        variantId: variantId || null,
        productName: pRes.rows[0]?.name || productId,
        targetPrice,
        currentPrice: currentPrice ?? 0,
        isTriggered: triggered,
        createdAt: res.rows[0].created_at.toISOString(),
        email,
      },
      { status: 201 }
    );
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Database error" }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const id = searchParams.get("id");

  if (!id) {
    return NextResponse.json({ error: "Missing alert id" }, { status: 400 });
  }

  try {
    await pool.query(`DELETE FROM alerts WHERE id=$1`, [parseInt(id)]);
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Database error" }, { status: 500 });
  }
}
