import { NextRequest, NextResponse } from "next/server";
import pool from "@/lib/db";
import { Product, Retailer, PricePoint, GpuVariant } from "@/lib/types";

async function fetchProduct(id: string): Promise<Product | null> {
  const client = await pool.connect();
  try {
    const pRes = await client.query(
      `SELECT id, name, category, image, specs, msrp::float, release_date FROM products WHERE id=$1`,
      [id]
    );
    if (!pRes.rows.length) return null;
    const p = pRes.rows[0];

    // Latest price per retailer (Canada only)
    const rRes = await client.query(
      `SELECT DISTINCT ON (r.id)
         r.id, r.name, r.url,
         ps.price::float, ps.in_stock, ps.recorded_at
       FROM price_snapshots ps
       JOIN retailers r ON r.id = ps.retailer_id
       WHERE ps.product_id = $1
       ORDER BY r.id, ps.recorded_at DESC`,
      [id]
    );

    const retailers: Retailer[] = rRes.rows.map((r) => ({
      id: r.id,
      name: r.name,
      url: r.url,
      price: r.price,
      currency: "CAD",
      inStock: r.in_stock,
      lastChecked: r.recorded_at.toISOString(),
    }));

    // Full price history (daily lowest across all CA retailers)
    const histRes = await client.query(
      `SELECT DATE(recorded_at) AS date, MIN(price)::float AS price
       FROM price_snapshots
       WHERE product_id = $1
       GROUP BY DATE(recorded_at)
       ORDER BY date ASC`,
      [id]
    );
    const priceHistory: PricePoint[] = histRes.rows.map((r) => ({
      date: r.date.toISOString().split("T")[0],
      price: r.price,
    }));

    const currentLowest =
      retailers.length > 0 ? Math.min(...retailers.map((r) => r.price)) : p.msrp;

    // GPU variants
    let variants: GpuVariant[] | undefined;
    if (p.category === "gpu") {
      const vRes = await client.query(
        `SELECT gv.id, gv.product_id, gv.brand, gv.variant, gv.full_name,
                gv.url, r.name AS retailer_name,
                (SELECT price::float FROM gpu_variant_snapshots WHERE variant_id=gv.id ORDER BY recorded_at DESC LIMIT 1) AS current_price,
                (SELECT in_stock FROM gpu_variant_snapshots WHERE variant_id=gv.id ORDER BY recorded_at DESC LIMIT 1) AS in_stock
         FROM gpu_variants gv
         LEFT JOIN retailers r ON r.id = gv.retailer_id
         WHERE gv.product_id = $1
         ORDER BY gv.brand, gv.variant`,
        [id]
      );

      variants = await Promise.all(
        vRes.rows.map(async (v) => {
          const vhRes = await pool.query(
            `SELECT DATE(recorded_at) AS date, MIN(price)::float AS price
             FROM gpu_variant_snapshots
             WHERE variant_id = $1
             GROUP BY DATE(recorded_at)
             ORDER BY date ASC`,
            [v.id]
          );
          return {
            id: v.id,
            productId: v.product_id,
            brand: v.brand,
            variant: v.variant,
            fullName: v.full_name,
            retailerName: v.retailer_name,
            url: v.url,
            currentPrice: v.current_price,
            inStock: v.in_stock,
            priceHistory: vhRes.rows.map((r) => ({
              date: r.date.toISOString().split("T")[0],
              price: r.price,
            })),
          };
        })
      );
    }

    return {
      id: p.id,
      name: p.name,
      category: p.category,
      image: p.image,
      specs: p.specs,
      msrp: p.msrp,
      releaseDate: p.release_date?.toISOString().split("T")[0],
      currentLowest,
      retailers,
      priceHistory,
      variants,
    };
  } finally {
    client.release();
  }
}

async function fetchByCategory(category: "cpu" | "gpu"): Promise<Product[]> {
  const client = await pool.connect();
  try {
    const pRes = await client.query(
      `SELECT id FROM products WHERE category=$1 ORDER BY msrp DESC`,
      [category]
    );
    const products = await Promise.all(
      pRes.rows.map((r) => fetchProduct(r.id))
    );
    return products.filter(Boolean) as Product[];
  } finally {
    client.release();
  }
}

async function fetchAll(): Promise<Product[]> {
  const client = await pool.connect();
  try {
    const pRes = await client.query(
      `SELECT id FROM products ORDER BY category, msrp DESC`
    );
    const products = await Promise.all(
      pRes.rows.map((r) => fetchProduct(r.id))
    );
    return products.filter(Boolean) as Product[];
  } finally {
    client.release();
  }
}

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const id = searchParams.get("id");
    const category = searchParams.get("category");

    if (id) {
      const product = await fetchProduct(id);
      if (!product) {
        return NextResponse.json({ error: "Product not found" }, { status: 404 });
      }
      return NextResponse.json(product);
    }

    if (category === "cpu" || category === "gpu") {
      return NextResponse.json(await fetchByCategory(category));
    }

    return NextResponse.json(await fetchAll());
  } catch (err) {
    console.error("DB error:", err);
    return NextResponse.json({ error: "Database error" }, { status: 500 });
  }
}
