import pool from "@/lib/db";
import { lowestRecentPrice } from "@/lib/prices";
import type { Product, ProductCategory, Retailer, Socket } from "@/lib/types";

/**
 * Listing data for product cards: latest price per retailer and the current
 * lowest fresh price, in one query (no per-product round trips).
 * Discontinued products are left out.
 */
export async function listProducts(opts: {
  category: ProductCategory;
  socket?: Socket | null;
  excludeId?: string;
}): Promise<Product[]> {
  const res = await pool.query(
    `SELECT p.id, p.name, p.category, p.image, p.specs, p.msrp::float AS msrp, p.socket, p.chipset,
            COALESCE(json_agg(json_build_object(
              'name', l.name, 'url', l.url, 'price', l.price, 'inStock', l.in_stock,
              'lastChecked', l.recorded_at, 'source', l.source
            ) ORDER BY l.price) FILTER (WHERE l.name IS NOT NULL), '[]') AS retailers
     FROM products p
     LEFT JOIN LATERAL (
       SELECT DISTINCT ON (r.id) r.name, COALESCE(ps.url, r.url) AS url, ps.price::float AS price,
              ps.in_stock, ps.recorded_at, ps.source
       FROM price_snapshots ps JOIN retailers r ON r.id = ps.retailer_id
       WHERE ps.product_id = p.id
       ORDER BY r.id, ps.recorded_at DESC
     ) l ON TRUE
     WHERE p.category = $1 AND ($2::text IS NULL OR p.socket = $2) AND NOT p.discontinued
       AND ($3::text IS NULL OR p.id <> $3)
     GROUP BY p.id
     ORDER BY p.msrp DESC`,
    [opts.category, opts.socket ?? null, opts.excludeId ?? null]
  );

  return res.rows.map((p) => {
    const retailers: Retailer[] = p.retailers;
    return {
      id: p.id,
      name: p.name,
      category: p.category,
      image: p.image,
      specs: p.specs,
      msrp: p.msrp,
      socket: p.socket,
      chipset: p.chipset,
      retailers,
      currentLowest: lowestRecentPrice(retailers.map((r) => ({ price: r.price, recorded_at: r.lastChecked }))),
      priceHistory: [],
    };
  });
}

/** Listed products per socket, for the AM5 | AM4 tabs. */
export async function socketCounts(category: ProductCategory): Promise<Partial<Record<Socket, number>>> {
  const res = await pool.query(
    `SELECT socket, count(*)::int AS n FROM products
     WHERE category = $1 AND socket IS NOT NULL AND NOT discontinued GROUP BY socket`,
    [category]
  );
  return Object.fromEntries(res.rows.map((r) => [r.socket, r.n]));
}

/** Stat-row numbers shared by the listing pages. */
export function listingStats(products: Product[]) {
  const priced = products.filter((p) => p.currentLowest !== null);
  return {
    lowest: priced.length ? Math.min(...priced.map((p) => p.currentLowest as number)) : null,
    bestSavings: priced.length
      ? Math.max(0, ...priced.map((p) => Math.round(((p.msrp - (p.currentLowest as number)) / p.msrp) * 100)))
      : 0,
  };
}

export const CATEGORY_META: Record<ProductCategory, { path: string; label: string; placeholder: string }> = {
  cpu: { path: "/cpus", label: "CPUs", placeholder: "[ CPU ]" },
  gpu: { path: "/gpus", label: "GPUs", placeholder: "[ GPU ]" },
  motherboard: { path: "/motherboards", label: "Motherboards", placeholder: "[ BOARD ]" },
};

export function isPlaceholderImage(src: string | null | undefined): boolean {
  return !src || src.endsWith("-placeholder.svg");
}
