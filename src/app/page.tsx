import Link from "next/link";
import ProductCard from "@/components/ProductCard";
import pool from "@/lib/db";
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
          `SELECT DISTINCT ON (r.id) ps.price::float
           FROM price_snapshots ps JOIN retailers r ON r.id=ps.retailer_id
           WHERE ps.product_id=$1 ORDER BY r.id, ps.recorded_at DESC`,
          [p.id]
        );
        const prices = rRes.rows.map((r) => r.price);
        const currentLowest = prices.length ? Math.min(...prices) : p.msrp;
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

export default async function Home() {
  const { products, retailerCount, variantCount } = await getHomeData();

  const cpus = products.filter((p) => p.category === "cpu");
  const gpus = products.filter((p) => p.category === "gpu");

  const bestDeals = [...products]
    .sort((a, b) => {
      const discA = (a.msrp - a.currentLowest) / a.msrp;
      const discB = (b.msrp - b.currentLowest) / b.msrp;
      return discB - discA;
    })
    .slice(0, 4);

  return (
    <div>
      {/* Hero */}
      <section className="bg-gradient-to-br from-amd-dark via-amd-gray to-amd-dark py-16 px-4">
        <div className="max-w-7xl mx-auto text-center">
          <h1 className="text-4xl sm:text-5xl font-bold text-white mb-4">
            AMD Price Tracker Canada
          </h1>
          <p className="text-xl text-gray-400 mb-8 max-w-2xl mx-auto">
            Track Canadian prices (CAD) on AMD Ryzen processors and Radeon GPUs across retailers.
            See full price history since launch, brand variants, and set alerts.
          </p>
          <div className="flex items-center justify-center gap-4">
            <Link
              href="/cpus"
              className="bg-amd-red hover:bg-red-700 text-white px-8 py-3 rounded-lg font-semibold transition-colors"
            >
              Browse CPUs
            </Link>
            <Link
              href="/gpus"
              className="bg-gray-700 hover:bg-gray-600 text-white px-8 py-3 rounded-lg font-semibold transition-colors"
            >
              Browse GPUs
            </Link>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 mt-12 max-w-xl mx-auto">
            <div>
              <p className="text-3xl font-bold text-amd-red">{products.length}</p>
              <p className="text-gray-400 text-sm">Products</p>
            </div>
            <div>
              <p className="text-3xl font-bold text-amd-red">{variantCount}</p>
              <p className="text-gray-400 text-sm">GPU Variants</p>
            </div>
            <div>
              <p className="text-3xl font-bold text-amd-red">{retailerCount}</p>
              <p className="text-gray-400 text-sm">CA Retailers</p>
            </div>
            <div>
              <p className="text-3xl font-bold text-amd-red">24/7</p>
              <p className="text-gray-400 text-sm">Monitoring</p>
            </div>
          </div>
        </div>
      </section>

      {/* Best Deals */}
      <section className="max-w-7xl mx-auto px-4 py-12">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-white">Best Deals Right Now</h2>
          <span className="text-xs text-gray-500 bg-gray-800 px-2 py-1 rounded">🇨🇦 CAD prices</span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {bestDeals.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </section>

      {/* CPUs Preview */}
      <section className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-white">AMD Processors</h2>
          <Link href="/cpus" className="text-amd-red hover:text-red-400 text-sm font-medium transition-colors">
            View All →
          </Link>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {cpus.slice(0, 3).map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </section>

      {/* GPUs Preview */}
      <section className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-white">AMD Graphics Cards</h2>
          <Link href="/gpus" className="text-amd-red hover:text-red-400 text-sm font-medium transition-colors">
            View All →
          </Link>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {gpus.slice(0, 3).map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </section>
    </div>
  );
}
