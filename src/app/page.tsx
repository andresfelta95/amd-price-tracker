import Link from "next/link";
import ProductCard from "@/components/ProductCard";
import { products } from "@/data/products";

export default function Home() {
  const cpus = products.filter((p) => p.category === "cpu");
  const gpus = products.filter((p) => p.category === "gpu");

  // Find best deals (biggest discount from MSRP)
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
            AMD Price Tracker
          </h1>
          <p className="text-xl text-gray-400 mb-8 max-w-2xl mx-auto">
            Track Canadian prices (CAD) on AMD Ryzen processors and Radeon GPUs
            across retailers. Find the best deals and set price alerts.
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

          {/* Stats */}
          <div className="grid grid-cols-3 gap-6 mt-12 max-w-lg mx-auto">
            <div>
              <p className="text-3xl font-bold text-amd-red">
                {products.length}
              </p>
              <p className="text-gray-400 text-sm">Products</p>
            </div>
            <div>
              <p className="text-3xl font-bold text-amd-red">
                {new Set(products.flatMap((p) => p.retailers.map((r) => r.name))).size}
              </p>
              <p className="text-gray-400 text-sm">Retailers</p>
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
          <Link
            href="/cpus"
            className="text-amd-red hover:text-red-400 text-sm font-medium transition-colors"
          >
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
          <Link
            href="/gpus"
            className="text-amd-red hover:text-red-400 text-sm font-medium transition-colors"
          >
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
