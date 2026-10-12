export const dynamic = 'force-dynamic';

import { notFound } from "next/navigation";
import Link from "next/link";
import pool from "@/lib/db";
import { lowestRecentPrice } from "@/lib/prices";
import { Product, Retailer, PricePoint, GpuVariant } from "@/lib/types";
import PriceChart from "@/components/PriceChart";
import RetailerTable from "@/components/RetailerTable";
import AlertForm from "@/components/AlertForm";
import ScrapeButton from "@/components/ScrapeButton";
import GpuVariantsPanel from "@/components/GpuVariantsPanel";

interface ProductPageProps {
  params: { id: string };
}

async function getProduct(id: string): Promise<Product | null> {
  const client = await pool.connect();
  try {
    const pRes = await client.query(
      `SELECT id, name, category, image, specs, msrp::float, release_date FROM products WHERE id=$1`,
      [id]
    );
    if (!pRes.rows.length) return null;
    const p = pRes.rows[0];

    const rRes = await client.query(
      `SELECT DISTINCT ON (r.id)
         r.id, r.name, r.url, ps.price::float, ps.in_stock, ps.recorded_at
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
      lowestRecentPrice(rRes.rows);

    let variants: GpuVariant[] | undefined;
    if (p.category === "gpu") {
      const vRes = await client.query(
        `SELECT gv.id, gv.product_id, gv.brand, gv.variant, gv.full_name, gv.url,
                r.name AS retailer_name,
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

export async function generateMetadata({ params }: ProductPageProps) {
  const client = await pool.connect();
  try {
    const res = await client.query(`SELECT name FROM products WHERE id=$1`, [params.id]);
    const name = res.rows[0]?.name;
    return { title: name ? `${name} — AMD Price Tracker CA` : "Product Not Found" };
  } finally {
    client.release();
  }
}

export default async function ProductPage({ params }: ProductPageProps) {
  const product = await getProduct(params.id);
  if (!product) notFound();

  const discount =
    product.currentLowest !== null
      ? Math.round(((product.msrp - product.currentLowest) / product.msrp) * 100)
      : 0;

  return (
    <div className="mx-auto max-w-7xl px-4 py-10">
      {/* Breadcrumb */}
      <nav className="mb-8 flex items-center gap-2 font-mono text-xs uppercase tracking-wider text-ink-faint">
        <Link href="/" className="transition-colors hover:text-ink">Home</Link>
        <span className="text-signal-text">/</span>
        <Link
          href={product.category === "cpu" ? "/cpus" : "/gpus"}
          className="transition-colors hover:text-ink"
        >
          {product.category === "cpu" ? "CPUs" : "GPUs"}
        </Link>
        <span className="text-signal-text">/</span>
        <span className="text-ink-dim">{product.name}</span>
      </nav>

      {/* Product header */}
      <div className="mb-8 grid grid-cols-1 gap-8 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <div className="flex flex-col gap-6 sm:flex-row">
            <div className="corner-frame flex h-48 w-full shrink-0 items-center justify-center overflow-hidden rounded border border-line bg-panel sm:w-48">
              {product.image && product.image !== '/cpu-placeholder.svg' && product.image !== '/gpu-placeholder.svg' ? (
                <img
                  src={product.image}
                  alt={product.name}
                  className="h-full w-full object-contain p-3"
                />
              ) : (
                <span className="font-mono text-sm uppercase tracking-widest text-ink-faint">
                  {product.category === "cpu" ? "[ CPU ]" : "[ GPU ]"}
                </span>
              )}
            </div>
            <div>
              <div className="mb-2 flex flex-wrap items-center gap-2 font-mono text-[11px] uppercase tracking-wider">
                <span
                  className={`rounded-sm px-1.5 py-0.5 ${
                    product.category === "cpu"
                      ? "bg-signal-soft text-signal-text"
                      : "bg-raised text-ink-dim ring-1 ring-inset ring-line-strong"
                  }`}
                >
                  {product.category}
                </span>
                {discount > 0 && (
                  <span className="rounded-sm bg-gain-soft px-1.5 py-0.5 text-gain">
                    ▼{discount}% below MSRP
                  </span>
                )}
                {product.releaseDate && (
                  <span className="text-ink-faint">
                    released {new Date(product.releaseDate).toLocaleDateString("en-CA", { year: "numeric", month: "short" })}
                  </span>
                )}
              </div>
              <h1 className="mb-3 font-display text-3xl font-bold uppercase tracking-wide text-ink">
                {product.name}
              </h1>
              <div className="mb-5 flex items-end gap-3">
                <span className={`font-mono text-4xl font-semibold ${product.currentLowest !== null ? "text-ink" : "text-ink-faint"}`}>
                  {product.currentLowest !== null ? (
                    <>
                      <span className="mr-1 text-xl text-ink-faint">C$</span>
                      {product.currentLowest.toFixed(2)}
                    </>
                  ) : (
                    "N/A"
                  )}
                </span>
                {discount > 0 && (
                  <span className="mb-1 font-mono text-xl text-ink-faint line-through">
                    C${product.msrp.toFixed(2)}
                  </span>
                )}
              </div>
              {/* Datasheet spec rows */}
              <dl className="grid grid-cols-1 gap-px overflow-hidden rounded border border-line bg-line sm:grid-cols-2">
                {Object.entries(product.specs).map(([key, value]) => (
                  <div key={key} className="flex items-baseline justify-between gap-3 bg-panel px-3 py-2">
                    <dt className="font-mono text-[11px] uppercase tracking-wider text-ink-faint">{key}</dt>
                    <dd className="font-mono text-sm font-medium text-ink">{value}</dd>
                  </div>
                ))}
              </dl>
            </div>
          </div>
        </div>
        <div>
          <AlertForm product={product} />
        </div>
      </div>

      {/* Price chart + retailers */}
      <div className="mb-8 grid grid-cols-1 gap-8 lg:grid-cols-2">
        <PriceChart
          data={product.priceHistory}
          msrp={product.msrp}
          releaseDate={product.releaseDate}
        />
        <RetailerTable retailers={product.retailers} />
      </div>

      {/* GPU variants */}
      {product.variants && product.variants.length > 0 && (
        <div className="mb-8">
          <GpuVariantsPanel variants={product.variants} />
        </div>
      )}

      <ScrapeButton productId={product.id} productName={product.name} />
    </div>
  );
}
