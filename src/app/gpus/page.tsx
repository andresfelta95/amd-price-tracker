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
          `SELECT DISTINCT ON (r.id) ps.price::float
           FROM price_snapshots ps JOIN retailers r ON r.id=ps.retailer_id
           WHERE ps.product_id=$1 ORDER BY r.id, ps.recorded_at DESC`,
          [p.id]
        );
        const prices = rRes.rows.map((r) => r.price);
        const currentLowest = prices.length ? Math.min(...prices) : p.msrp;

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
          retailers: [],
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
  const lowest = gpus.length ? Math.min(...gpus.map((g) => g.currentLowest)) : 0;
  const bestSavings = gpus.length
    ? Math.max(...gpus.map((g) => Math.round(((g.msrp - g.currentLowest) / g.msrp) * 100)))
    : 0;
  const totalVariants = gpus.reduce((acc, g) => acc + (g._variantCount ?? 0), 0);

  return (
    <div className="max-w-7xl mx-auto px-4 py-10">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">AMD Graphics Cards</h1>
        <p className="text-gray-400">
          Canadian prices (CAD) across retailers for AMD Radeon GPUs. Each card shows brand variants (ASUS, Gigabyte, MSI, Sapphire, and more).
        </p>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 mb-8">
        <div className="bg-amd-gray border border-gray-700 rounded-xl p-4">
          <p className="text-gray-400 text-sm">GPUs Tracked</p>
          <p className="text-2xl font-bold text-white">{gpus.length}</p>
        </div>
        <div className="bg-amd-gray border border-gray-700 rounded-xl p-4">
          <p className="text-gray-400 text-sm">Variants Tracked</p>
          <p className="text-2xl font-bold text-blue-400">{totalVariants}</p>
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
        {gpus.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </div>
  );
}
