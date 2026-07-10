export const dynamic = 'force-dynamic';

import ProductCard from "@/components/ProductCard";
import pool from "@/lib/db";
import { Product } from "@/lib/types";

export const metadata = {
  title: "AMD GPUs — Canadian Price Tracker",
  description: "Track Canadian prices on AMD Radeon graphics cards.",
};

async function getGpus(): Promise<Product[]> {
  const client = await pool.connect();
  try {
    const pRes = await client.query(
      `SELECT id, name, category, image, specs, msrp::float FROM products WHERE category='gpu' ORDER BY msrp DESC`
    );
    return Promise.all(
      pRes.rows.map(async (p) => {
        const rRes = await client.query(
          `SELECT DISTINCT ON (r.id) r.name, r.url, ps.price::float AS price, ps.in_stock, ps.recorded_at
           FROM price_snapshots ps JOIN retailers r ON r.id=ps.retailer_id
           WHERE ps.product_id=$1 ORDER BY r.id, ps.recorded_at DESC`,
          [p.id]
        );
        const retailers = rRes.rows.map((r) => ({
          name: r.name, url: r.url, price: r.price,
          inStock: r.in_stock, lastChecked: String(r.recorded_at),
        }));
        const prices = retailers.map((r) => r.price);
        const currentLowest = prices.length ? Math.min(...prices) : null;

        // Count variants
        const vRes = await client.query(
          `SELECT COUNT(*) AS cnt FROM gpu_variants WHERE product_id=$1`,
          [p.id]
        );
        const variantCount = parseInt(vRes.rows[0].cnt);

        return {
          ...p,
          specs: p.specs,
          currentLowest,
          retailers,
          priceHistory: [],
          _variantCount: variantCount,
        } as Product & { _variantCount: number };
      })
    );
  } finally {
    client.release();
  }
}

export default async function GPUsPage() {
  const gpus = (await getGpus()) as (Product & { _variantCount?: number })[];
  const priced = gpus.filter((g) => g.currentLowest !== null);
  const lowest = priced.length ? Math.min(...priced.map((g) => g.currentLowest as number)) : null;
  const bestSavings = priced.length
    ? Math.max(...priced.map((g) => Math.round(((g.msrp - (g.currentLowest as number)) / g.msrp) * 100)))
    : 0;
  const totalVariants = gpus.reduce((acc, g) => acc + (g._variantCount ?? 0), 0);

  const stats = [
    { label: "GPUs tracked", value: String(gpus.length).padStart(2, "0"), tone: "text-ink" },
    { label: "Variants tracked", value: String(totalVariants).padStart(2, "0"), tone: "text-ink" },
    { label: "Lowest price", value: lowest !== null ? `C$${lowest.toFixed(2)}` : "—", tone: "text-gain" },
    { label: "Best savings", value: `${bestSavings}% off`, tone: "text-signal-text" },
  ];

  return (
    <div className="mx-auto max-w-7xl px-4 py-12">
      <div className="mb-8">
        <p className="mb-1 font-mono text-xs tracking-[0.2em] text-signal-text">
          <span className="text-ink-faint">//</span> RADEON · DISCRETE
        </p>
        <h1 className="mb-2 font-display text-3xl font-bold uppercase tracking-wide text-ink sm:text-4xl">
          Graphics cards
        </h1>
        <p className="max-w-2xl text-ink-dim">
          Canadian prices (CAD) across retailers for AMD Radeon GPUs. Each card shows brand variants (ASUS, Gigabyte, MSI, Sapphire, and more).
        </p>
      </div>

      <dl className="mb-10 grid grid-cols-2 gap-px overflow-hidden rounded border border-line bg-line sm:grid-cols-4">
        {stats.map((s) => (
          <div key={s.label} className="bg-panel px-5 py-4">
            <dt className="font-mono text-[11px] uppercase tracking-wider text-ink-faint">{s.label}</dt>
            <dd className={`mt-1 font-mono text-2xl font-semibold ${s.tone}`}>{s.value}</dd>
          </div>
        ))}
      </dl>

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {gpus.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </div>
  );
}
