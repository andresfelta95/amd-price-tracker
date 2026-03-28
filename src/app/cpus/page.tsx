import ProductCard from "@/components/ProductCard";
import { getProductsByCategory } from "@/data/products";

export const metadata = {
  title: "AMD CPUs — Price Tracker",
  description: "Track prices on AMD Ryzen and Threadripper processors.",
};

export default function CPUsPage() {
  const cpus = getProductsByCategory("cpu");

  return (
    <div className="max-w-7xl mx-auto px-4 py-10">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">AMD Processors</h1>
        <p className="text-gray-400">
          Compare Canadian prices (CAD) across retailers for AMD Ryzen CPUs.
          Click on any product to see price history and retailer details.
        </p>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        <div className="bg-amd-gray border border-gray-700 rounded-xl p-4">
          <p className="text-gray-400 text-sm">Total CPUs Tracked</p>
          <p className="text-2xl font-bold text-white">{cpus.length}</p>
        </div>
        <div className="bg-amd-gray border border-gray-700 rounded-xl p-4">
          <p className="text-gray-400 text-sm">Lowest Price</p>
          <p className="text-2xl font-bold text-green-400">
            C${Math.min(...cpus.map((c) => c.currentLowest))}
          </p>
        </div>
        <div className="bg-amd-gray border border-gray-700 rounded-xl p-4">
          <p className="text-gray-400 text-sm">Best Savings</p>
          <p className="text-2xl font-bold text-amd-red">
            {Math.max(
              ...cpus.map((c) =>
                Math.round(((c.msrp - c.currentLowest) / c.msrp) * 100)
              )
            )}
            % off
          </p>
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
