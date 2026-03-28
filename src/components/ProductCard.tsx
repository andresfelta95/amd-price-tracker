import Link from "next/link";
import { Product } from "@/lib/types";

interface ProductCardProps {
  product: Product;
}

export default function ProductCard({ product }: ProductCardProps) {
  const discount = Math.round(
    ((product.msrp - product.currentLowest) / product.msrp) * 100
  );
  const hasDiscount = discount > 0;

  return (
    <Link href={`/product/${product.id}`}>
      <div className="bg-amd-gray border border-gray-700 rounded-xl p-5 hover:border-amd-red transition-all duration-200 hover:shadow-lg hover:shadow-amd-red/10 group">
        {/* Product image placeholder */}
        <div className="w-full h-40 bg-gray-800 rounded-lg mb-4 flex items-center justify-center overflow-hidden">
          <div className="text-4xl">
            {product.category === "cpu" ? "🔲" : "🎮"}
          </div>
        </div>

        {/* Badge */}
        <div className="flex items-center gap-2 mb-2">
          <span
            className={`text-xs font-semibold px-2 py-0.5 rounded ${
              product.category === "cpu"
                ? "bg-orange-500/20 text-orange-400"
                : "bg-blue-500/20 text-blue-400"
            }`}
          >
            {product.category.toUpperCase()}
          </span>
          {hasDiscount && (
            <span className="text-xs font-semibold px-2 py-0.5 rounded bg-green-500/20 text-green-400">
              -{discount}%
            </span>
          )}
        </div>

        {/* Name */}
        <h3 className="text-white font-semibold text-lg mb-1 group-hover:text-amd-red transition-colors">
          {product.name}
        </h3>

        {/* Key specs */}
        <p className="text-gray-400 text-sm mb-3">
          {product.category === "cpu"
            ? `${product.specs.Cores} Cores / ${product.specs["Boost Clock"]}`
            : `${product.specs.VRAM} / ${product.specs["Boost Clock"]}`}
        </p>

        {/* Pricing */}
        <div className="flex items-end justify-between">
          <div>
            <p className="text-2xl font-bold text-white">
              ${product.currentLowest}
            </p>
            {hasDiscount && (
              <p className="text-sm text-gray-500 line-through">
                ${product.msrp} MSRP
              </p>
            )}
          </div>
          <div className="text-right">
            <p className="text-xs text-gray-400">
              {product.retailers.filter((r) => r.inStock).length} retailers
            </p>
            <p className="text-xs text-green-400">
              {product.retailers.some((r) => r.inStock)
                ? "In Stock"
                : "Out of Stock"}
            </p>
          </div>
        </div>
      </div>
    </Link>
  );
}
