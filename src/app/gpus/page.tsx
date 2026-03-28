import ProductCard from "@/components/ProductCard";
import { getProductsByCategory } from "@/data/products";

export const metadata = {
  title: "AMD GPUs — Price Tracker",
  description: "Track prices on AMD Radeon graphics cards.",
};

export default function GPUsPage() {
  const gpus = getProductsByCategory("gpu");

  return (
    <div className="max-w-7xl mx-auto px-4 py-10">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">
          AMD Graphics Cards
        </h1>
        <p className="text-gray-400">
          Compare Canadian prices (CAD) across retailers for AMD Radeon GPUs.
          Click on any product to see price history and retailer details.
        </p>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        <div className="bg-amd-gray border border-gray-700 rounded-xl p-4">
          <p className="text-gray-400 text-sm">Total GPUs Tracked</p>
          <p className="text-2xl font-bold text-white">{gpus.length}</p>
        </div>
        <div className="bg-amd-gray border border-gray-700 rounded-xl p-4">
          <p className="text-gray-400 text-sm">Lowest Price</p>
          <p className="text-2xl font-bold text-green-400">
            C${Math.min(...gpus.map((g) => g.currentLowest))}
          </p>
        </div>
        <div className="bg-amd-gray border border-gray-700 rounded-xl p-4">
          <p className="text-gray-400 text-sm">Best Savings</p>
          <p className="text-2xl font-bold text-amd-red">
            {Math.max(
              ...gpus.map((g) =>
                Math.round(((g.msrp - g.currentLowest) / g.msrp) * 100)
              )
            )}
            % off
          </p>
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
