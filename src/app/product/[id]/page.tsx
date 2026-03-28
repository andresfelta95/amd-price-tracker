import { notFound } from "next/navigation";
import Link from "next/link";
import { products, getProductById } from "@/data/products";
import PriceChart from "@/components/PriceChart";
import RetailerTable from "@/components/RetailerTable";
import AlertForm from "@/components/AlertForm";
import ScrapeButton from "@/components/ScrapeButton";

interface ProductPageProps {
  params: { id: string };
}

export function generateStaticParams() {
  return products.map((p) => ({ id: p.id }));
}

export function generateMetadata({ params }: ProductPageProps) {
  const product = getProductById(params.id);
  return {
    title: product
      ? `${product.name} — AMD Price Tracker`
      : "Product Not Found",
  };
}

export default function ProductPage({ params }: ProductPageProps) {
  const product = getProductById(params.id);

  if (!product) {
    notFound();
  }

  const discount = Math.round(
    ((product.msrp - product.currentLowest) / product.msrp) * 100
  );

  return (
    <div className="max-w-7xl mx-auto px-4 py-10">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-sm text-gray-400 mb-6">
        <Link href="/" className="hover:text-white transition-colors">
          Home
        </Link>
        <span>/</span>
        <Link
          href={product.category === "cpu" ? "/cpus" : "/gpus"}
          className="hover:text-white transition-colors"
        >
          {product.category === "cpu" ? "CPUs" : "GPUs"}
        </Link>
        <span>/</span>
        <span className="text-white">{product.name}</span>
      </nav>

      {/* Product header */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
        {/* Image + basic info */}
        <div className="lg:col-span-2">
          <div className="flex flex-col sm:flex-row gap-6">
            <div className="w-full sm:w-48 h-48 bg-amd-gray border border-gray-700 rounded-xl flex items-center justify-center shrink-0">
              <span className="text-6xl">
                {product.category === "cpu" ? "🔲" : "🎮"}
              </span>
            </div>
            <div>
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
                {discount > 0 && (
                  <span className="text-xs font-semibold px-2 py-0.5 rounded bg-green-500/20 text-green-400">
                    -{discount}% below MSRP
                  </span>
                )}
              </div>
              <h1 className="text-3xl font-bold text-white mb-3">
                {product.name}
              </h1>
              <div className="flex items-end gap-3 mb-4">
                <span className="text-4xl font-bold text-white">
                  ${product.currentLowest}
                </span>
                {discount > 0 && (
                  <span className="text-xl text-gray-500 line-through mb-1">
                    ${product.msrp}
                  </span>
                )}
              </div>

              {/* Specs */}
              <div className="grid grid-cols-2 gap-x-6 gap-y-2">
                {Object.entries(product.specs).map(([key, value]) => (
                  <div key={key}>
                    <span className="text-gray-400 text-sm">{key}: </span>
                    <span className="text-white text-sm font-medium">
                      {value}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Alert form */}
        <div>
          <AlertForm product={product} />
        </div>
      </div>

      {/* Charts and retailers */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        <PriceChart data={product.priceHistory} msrp={product.msrp} />
        <RetailerTable retailers={product.retailers} />
      </div>

      {/* Scrape button */}
      <ScrapeButton productName={product.name} />
    </div>
  );
}
