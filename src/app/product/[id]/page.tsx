import { notFound } from "next/navigation";
import Link from "next/link";
import pool from "@/lib/db";
import { Product, Retailer, PricePoint, GpuVariant } from "@/lib/types";
import PriceChart from "@/components/PriceChart";
import RetailerTable from "@/components/RetailerTable";
import AlertForm from "@/components/AlertForm";
import ScrapeButton from "@/components/ScrapeButton";
import GpuVariantsPanel from "@/components/GpuVariantsPanel";

interface ProductPageProps {
  params: { id: string };
}

async function getProduct(id: string): Promise<Product | null> {
  const client = await pool.connect();
  try {
    const pRes = await client.query(
      `SELECT id, name, category, image, specs, msrp::float, release_date FROM products WHERE id=$1`,
      [id]
    );
    if (!pRes.rows.length) return null;
    const p = pRes.rows[0];

    const rRes = await client.query(
      `SELECT DISTINCT ON (r.id)
         r.id, r.name, r.url, ps.price::float, ps.in_stock, ps.recorded_at
       FROM price_snapshots ps
       JOIN retailers r ON r.id = ps.retailer_id
       WHERE ps.product_id = $1
       ORDER BY r.id, ps.recorded_at DESC`,
      [id]
    );

    const retailers: Retailer[] = rRes.rows.map((r) => ({
      id: r.id,
      name: r.name,
      url: r.url,
      price: r.price,
      currency: "CAD",
      inStock: r.in_stock,
      lastChecked: r.recorded_at.toISOString(),
    }));

    const histRes = await client.query(
      `SELECT DATE(recorded_at) AS date, MIN(price)::float AS price
       FROM price_snapshots
       WHERE product_id = $1
       GROUP BY DATE(recorded_at)
       ORDER BY date ASC`,
      [id]
    );
    const priceHistory: PricePoint[] = histRes.rows.map((r) => ({
      date: r.date.toISOString().split("T")[0],
      price: r.price,
    }));

    const currentLowest =
      retailers.length > 0 ? Math.min(...retailers.map((r) => r.price)) : p.msrp;

    let variants: GpuVariant[] | undefined;
    if (p.category === "gpu") {
      const vRes = await client.query(
        `SELECT gv.id, gv.product_id, gv.brand, gv.variant, gv.full_name, gv.url,
                r.name AS retailer_name,
                (SELECT price::float FROM gpu_variant_snapshots WHERE variant_id=gv.id ORDER BY recorded_at DESC LIMIT 1) AS current_price,
                (SELECT in_stock FROM gpu_variant_snapshots WHERE variant_id=gv.id ORDER BY recorded_at DESC LIMIT 1) AS in_stock
         FROM gpu_variants gv
         LEFT JOIN retailers r ON r.id = gv.retailer_id
         WHERE gv.product_id = $1
         ORDER BY gv.brand, gv.variant`,
        [id]
      );

      variants = await Promise.all(
        vRes.rows.map(async (v) => {
          const vhRes = await pool.query(
            `SELECT DATE(recorded_at) AS date, MIN(price)::float AS price
             FROM gpu_variant_snapshots
             WHERE variant_id = $1
             GROUP BY DATE(recorded_at)
             ORDER BY date ASC`,
            [v.id]
          );
          return {
            id: v.id,
            productId: v.product_id,
            brand: v.brand,
            variant: v.variant,
            fullName: v.full_name,
            retailerName: v.retailer_name,
            url: v.url,
            currentPrice: v.current_price,
            inStock: v.in_stock,
            priceHistory: vhRes.rows.map((r) => ({
              date: r.date.toISOString().split("T")[0],
              price: r.price,
            })),
          };
        })
      );
    }

    return {
      id: p.id,
      name: p.name,
      category: p.category,
      image: p.image,
      specs: p.specs,
      msrp: p.msrp,
      releaseDate: p.release_date?.toISOString().split("T")[0],
      currentLowest,
      retailers,
      priceHistory,
      variants,
    };
  } finally {
    client.release();
  }
}

export async function generateStaticParams() {
  const res = await pool.query(`SELECT id FROM products`);
  return res.rows.map((r) => ({ id: r.id }));
}

export async function generateMetadata({ params }: ProductPageProps) {
  const client = await pool.connect();
  try {
    const res = await client.query(`SELECT name FROM products WHERE id=$1`, [params.id]);
    const name = res.rows[0]?.name;
    return { title: name ? `${name} — AMD Price Tracker CA` : "Product Not Found" };
  } finally {
    client.release();
  }
}

export default async function ProductPage({ params }: ProductPageProps) {
  const product = await getProduct(params.id);
  if (!product) notFound();

  const discount = Math.round(
    ((product.msrp - product.currentLowest) / product.msrp) * 100
  );

  return (
    <div className="max-w-7xl mx-auto px-4 py-10">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-sm text-gray-400 mb-6">
        <Link href="/" className="hover:text-white transition-colors">Home</Link>
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
                {product.releaseDate && (
                  <span className="text-xs text-gray-500">
                    Released {new Date(product.releaseDate).toLocaleDateString("en-CA", { year: "numeric", month: "short" })}
                  </span>
                )}
              </div>
              <h1 className="text-3xl font-bold text-white mb-3">{product.name}</h1>
              <div className="flex items-end gap-3 mb-4">
                <span className="text-4xl font-bold text-white">
                  C${product.currentLowest.toFixed(2)}
                </span>
                {discount > 0 && (
                  <span className="text-xl text-gray-500 line-through mb-1">
                    C${product.msrp.toFixed(2)}
                  </span>
                )}
              </div>
              <div className="grid grid-cols-2 gap-x-6 gap-y-2">
                {Object.entries(product.specs).map(([key, value]) => (
                  <div key={key}>
                    <span className="text-gray-400 text-sm">{key}: </span>
                    <span className="text-white text-sm font-medium">{value}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
        <div>
          <AlertForm product={product} />
        </div>
      </div>

      {/* Price chart + retailers */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        <PriceChart
          data={product.priceHistory}
          msrp={product.msrp}
          releaseDate={product.releaseDate}
        />
        <RetailerTable retailers={product.retailers} />
      </div>

      {/* GPU variants */}
      {product.variants && product.variants.length > 0 && (
        <div className="mb-8">
          <GpuVariantsPanel variants={product.variants} />
        </div>
      )}

      <ScrapeButton productName={product.name} />
    </div>
  );
}
