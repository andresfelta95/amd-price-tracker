export const dynamic = 'force-dynamic';

import Link from "next/link";
import ProductCard from "@/components/ProductCard";
import pool from "@/lib/db";
import { lowestRecentPrice } from "@/lib/prices";
import { Product } from "@/lib/types";

async function getHomeData() {
  const client = await pool.connect();
  try {
    const pRes = await client.query(
      `SELECT id, name, category, image, specs, msrp::float FROM products ORDER BY category, msrp DESC`
    );
    const products: Product[] = await Promise.all(
      pRes.rows.map(async (p) => {
        const rRes = await client.query(
          `SELECT DISTINCT ON (r.id) ps.price::float, ps.recorded_at
           FROM price_snapshots ps JOIN retailers r ON r.id=ps.retailer_id
           WHERE ps.product_id=$1 ORDER BY r.id, ps.recorded_at DESC`,
          [p.id]
        );
        const currentLowest = lowestRecentPrice(rRes.rows);
        return { ...p, specs: p.specs, currentLowest, retailers: [], priceHistory: [] };
      })
    );

    const retailerCount = await client.query(`SELECT COUNT(*) AS cnt FROM retailers`);
    const variantCount = await client.query(`SELECT COUNT(*) AS cnt FROM gpu_variants`);

    return {
      products,
      retailerCount: parseInt(retailerCount.rows[0].cnt),
      variantCount: parseInt(variantCount.rows[0].cnt),
    };
  } finally {
    client.release();
  }
}

/* Scrolling telemetry strip: every tracked product with its lowest CAD price.
   Items are rendered twice so the CSS loop is seamless. */
function PriceTicker({ products }: { products: Product[] }) {
  const items = products.filter((p) => p.currentLowest !== null);
  if (!items.length) return null;

  const strip = (ariaHidden: boolean) => (
    <div aria-hidden={ariaHidden} className="flex shrink-0 items-center">
      {items.map((p) => {
        const below = p.currentLowest !== null && p.currentLowest < p.msrp;
        return (
          <Link
            key={`${ariaHidden}-${p.id}`}
            href={`/product/${p.id}`}
            tabIndex={ariaHidden ? -1 : 0}
            className="group flex items-center gap-2 whitespace-nowrap border-r border-line px-5 py-2.5 font-mono text-[13px] transition-colors hover:bg-raised"
          >
            <span className="text-ink-dim group-hover:text-ink">{p.name.replace("AMD ", "")}</span>
            <span className="font-semibold text-ink">C${p.currentLowest!.toFixed(0)}</span>
            <span className={below ? "text-gain" : "text-ink-faint"}>{below ? "▼" : "•"}</span>
          </Link>
        );
      })}
    </div>
  );

  return (
    <div className="ticker-viewport reveal-4 reveal overflow-hidden border-y border-line bg-panel/70">
      <div className="ticker-track">
        {strip(false)}
        {strip(true)}
      </div>
    </div>
  );
}

function SectionHeader({ index, title, href }: { index: string; title: string; href?: string }) {
  return (
    <div className="mb-6 flex items-end justify-between">
      <div>
        <p className="mb-1 font-mono text-xs tracking-[0.2em] text-signal-text">
          <span className="text-ink-faint">//</span> {index}
        </p>
        <h2 className="font-display text-2xl font-bold uppercase tracking-wide text-ink sm:text-3xl">
          {title}
        </h2>
      </div>
      {href && (
        <Link
          href={href}
          className="group font-mono text-[13px] uppercase tracking-wider text-ink-dim transition-colors hover:text-signal-text"
        >
          View all <span className="inline-block transition-transform group-hover:translate-x-1">→</span>
        </Link>
      )}
    </div>
  );
}

export default async function Home() {
  const { products, retailerCount, variantCount } = await getHomeData();

  const cpus = products.filter((p) => p.category === "cpu");
  const gpus = products.filter((p) => p.category === "gpu");

  const bestDeals = [...products]
    .sort((a, b) => {
      const discA = a.currentLowest !== null ? (a.msrp - a.currentLowest) / a.msrp : -Infinity;
      const discB = b.currentLowest !== null ? (b.msrp - b.currentLowest) / b.msrp : -Infinity;
      return discB - discA;
    })
    .slice(0, 4);

  const stats = [
    { value: String(products.length).padStart(2, "0"), label: "Products" },
    { value: String(variantCount).padStart(2, "0"), label: "GPU variants" },
    { value: String(retailerCount).padStart(2, "0"), label: "CA retailers" },
    { value: "24/7", label: "Monitoring" },
  ];

  return (
    <div>
      {/* Hero — oversized display type over the plotting grid */}
      <section className="px-4 pb-10 pt-14 sm:pt-20">
        <div className="mx-auto max-w-7xl">
          <p className="reveal mb-4 font-mono text-xs tracking-[0.25em] text-signal-text">
            <span className="text-ink-faint">//</span> CANADIAN PRICE TELEMETRY · CAD
          </p>
          <h1 className="reveal reveal-2 max-w-4xl font-display text-[clamp(2.6rem,7vw,5rem)] font-bold uppercase leading-[0.95] tracking-tight text-ink">
            Every AMD chip.
            <br />
            Every <span className="text-signal-text">CA price</span>.
            <br />
            Since launch day.
          </h1>
          <div className="reveal reveal-3 mt-8 flex flex-wrap items-center gap-4">
            <Link
              href="/cpus"
              className="rounded bg-signal px-7 py-3 font-display font-semibold uppercase tracking-wide text-white transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[0_8px_28px_-8px_var(--signal)] active:translate-y-0"
            >
              Browse CPUs
            </Link>
            <Link
              href="/gpus"
              className="rounded border border-line-strong px-7 py-3 font-display font-semibold uppercase tracking-wide text-ink transition-all duration-200 hover:-translate-y-0.5 hover:border-signal hover:text-signal-text active:translate-y-0"
            >
              Browse GPUs
            </Link>
          </div>

          {/* Telemetry readouts */}
          <dl className="reveal reveal-3 mt-12 grid max-w-2xl grid-cols-2 gap-px overflow-hidden rounded border border-line bg-line sm:grid-cols-4">
            {stats.map((s) => (
              <div key={s.label} className="bg-panel px-5 py-4">
                <dt className="order-last mt-1 font-mono text-[11px] uppercase tracking-wider text-ink-faint">
                  {s.label}
                </dt>
                <dd className="font-mono text-2xl font-semibold text-signal-text">{s.value}</dd>
              </div>
            ))}
          </dl>
        </div>
      </section>

      {/* Live price tape */}
      <PriceTicker products={products} />

      {/* Best Deals */}
      <section className="mx-auto max-w-7xl px-4 pb-4 pt-14">
        <SectionHeader index="01 · DEALS" title="Best deals right now" />
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {bestDeals.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </section>

      {/* CPUs Preview */}
      <section className="mx-auto max-w-7xl px-4 py-12">
        <SectionHeader index="02 · RYZEN" title="Processors" href="/cpus" />
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {cpus.slice(0, 3).map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </section>

      {/* GPUs Preview */}
      <section className="mx-auto max-w-7xl px-4 pb-8">
        <SectionHeader index="03 · RADEON" title="Graphics cards" href="/gpus" />
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {gpus.slice(0, 3).map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </section>
    </div>
  );
}
