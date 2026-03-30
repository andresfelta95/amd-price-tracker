import ProductCard from "@/components/ProductCard";
import pool from "@/lib/db";
import { Product } from "@/lib/types";

export const metadata = {
  title: "AMD CPUs — Canadian Price Tracker",
  description: "Track Canadian prices on AMD Ryzen processors.",
};

async function getCpus(): Promise<Product[]> {
  const client = await pool.connect();
  try {
    const pRes = await client.query(
      `SELECT id, name, category, image, specs, msrp::float FROM products WHERE category='cpu' ORDER BY msrp DESC`
    );
    return Promise.all(
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
  } finally {
    client.release();
  }
}

export default async function CPUsPage() {
  const cpus = await getCpus();
  const lowest = cpus.length ? Math.min(...cpus.map((c) => c.currentLowest)) : 0;
  const bestSavings = cpus.length
    ? Math.max(...cpus.map((c) => Math.round(((c.msrp - c.currentLowest) / c.msrp) * 100)))
    : 0;

  return (
    <div className="max-w-7xl mx-auto px-4 py-10">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">AMD Processors</h1>
        <p className="text-gray-400">
          Canadian prices (CAD) across retailers for AMD Ryzen CPUs. Click any product to see full price history.
        </p>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        <div className="bg-amd-gray border border-gray-700 rounded-xl p-4">
          <p className="text-gray-400 text-sm">CPUs Tracked</p>
          <p className="text-2xl font-bold text-white">{cpus.length}</p>
        </div>
        <div className="bg-amd-gray border border-gray-700 rounded-xl p-4">
          <p className="text-gray-400 text-sm">Lowest Price</p>
          <p className="text-2xl font-bold text-green-400">C${lowest.toFixed(2)}</p>
        </div>
        <div className="bg-amd-gray border border-gray-700 rounded-xl p-4">
          <p className="text-gray-400 text-sm">Best Savings</p>
          <p className="text-2xl font-bold text-amd-red">{bestSavings}% off</p>
        </div>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {cpus.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </div>
  );
}
