import Link from "next/link";
import { CATEGORY_META, isPlaceholderImage } from "@/lib/catalog";
import { Product } from "@/lib/types";

interface ProductCardProps {
  product: Product;
}

function specLine(p: Product): string {
  if (p.category === "cpu") return `${p.specs.Cores}C / ${p.specs["Boost Clock"]}`;
  if (p.category === "motherboard") return `${p.specs["Form Factor"] ?? ""} · DDR${p.socket === "AM4" ? "4" : "5"}`;
  return `${p.specs.VRAM} / ${p.specs["Boost Clock"]}`;
}

export default function ProductCard({ product }: ProductCardProps) {
  const discount =
    product.currentLowest !== null
      ? Math.round(((product.msrp - product.currentLowest) / product.msrp) * 100)
      : 0;
  const hasDiscount = discount > 0;
  const inStockCount = product.retailers.filter((r) => r.inStock).length;

  return (
    <Link
      href={`/product/${product.id}`}
      className="corner-frame group block rounded border border-line bg-panel p-5 transition-all duration-200 hover:-translate-y-1 hover:border-line-strong hover:bg-raised"
    >
      <div className="mb-4 flex h-40 w-full items-center justify-center overflow-hidden rounded bg-raised">
        {!isPlaceholderImage(product.image) ? (
          <img
            src={product.image}
            alt={product.name}
            className="h-full w-full object-contain p-2 transition-transform duration-300 group-hover:scale-[1.04]"
          />
        ) : (
          <div className="font-mono text-xs uppercase tracking-widest text-ink-faint">
            {CATEGORY_META[product.category].placeholder}
          </div>
        )}
      </div>

      {/* Designators */}
      <div className="mb-2 flex items-center gap-2 font-mono text-[11px] uppercase tracking-wider">
        <span
          className={`rounded-sm px-1.5 py-0.5 ${
            product.category === "cpu"
              ? "bg-signal-soft text-signal-text"
              : "bg-raised text-ink-dim ring-1 ring-inset ring-line-strong"
          }`}
        >
          {product.category === "motherboard" ? "board" : product.category}
        </span>
        {product.socket && (
          <span className="rounded-sm px-1.5 py-0.5 text-ink-dim ring-1 ring-inset ring-line">
            {product.socket}
            {product.chipset ? ` · ${product.chipset}` : ""}
          </span>
        )}
        {hasDiscount && (
          <span className="rounded-sm bg-gain-soft px-1.5 py-0.5 text-gain">▼{discount}%</span>
        )}
      </div>

      {/* Name */}
      <h3 className="mb-1 font-display text-lg font-semibold leading-snug text-ink transition-colors group-hover:text-signal-text">
        {product.name}
      </h3>

      {/* Key specs */}
      <p className="mb-4 font-mono text-xs text-ink-dim">
        {specLine(product)}
      </p>

      {/* Readout */}
      <div className="flex items-end justify-between border-t border-line pt-3">
        <div>
          <p className={`font-mono text-2xl font-semibold ${product.currentLowest !== null ? "text-ink" : "text-ink-faint"}`}>
            {product.currentLowest !== null ? (
              <>
                <span className="mr-0.5 text-sm text-ink-faint">C$</span>
                {product.currentLowest.toFixed(2)}
              </>
            ) : (
              "N/A"
            )}
          </p>
          {hasDiscount && (
            <p className="font-mono text-xs text-ink-faint line-through">
              C${product.msrp} MSRP
            </p>
          )}
        </div>
        <div className="text-right font-mono text-[11px] leading-relaxed">
          <p className="text-ink-faint">{inStockCount} retailers</p>
          <p className={product.retailers.some((r) => r.inStock) ? "text-gain" : "text-ink-faint"}>
            {product.retailers.some((r) => r.inStock) ? "● in stock" : "○ out of stock"}
          </p>
        </div>
      </div>
    </Link>
  );
}
