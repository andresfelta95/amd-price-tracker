import Link from "next/link";
import { CATEGORY_META, listProducts } from "@/lib/catalog";
import type { Product } from "@/lib/types";

function byPrice(a: Product, b: Product) {
  return (a.currentLowest ?? Infinity) - (b.currentLowest ?? Infinity);
}

/**
 * Same-socket parts for a product page: a CPU shows the cheapest tracked board
 * per chipset, a board shows every compatible CPU. Renders nothing for GPUs.
 */
export default async function CompatibleParts({ product }: { product: Product }) {
  if (!product.socket || product.category === "gpu") return null;
  const isCpu = product.category === "cpu";
  const parts = await listProducts({ category: isCpu ? "motherboard" : "cpu", socket: product.socket });
  if (!parts.length) return null;

  let rows: Array<{ p: Product; label?: string }>;
  if (isCpu) {
    const best = new Map<string, Product>();
    for (const b of parts) {
      const key = b.chipset ?? "Other";
      const cur = best.get(key);
      if (!cur || byPrice(b, cur) < 0) best.set(key, b);
    }
    rows = Array.from(best.entries())
      .map(([chipset, p]) => ({ p, label: chipset }))
      .sort((a, b) => byPrice(a.p, b.p));
  } else {
    rows = [...parts].sort(byPrice).map((p) => ({ p }));
  }

  const target = isCpu ? "motherboard" : "cpu";
  const viewAll = `${CATEGORY_META[target].path}?socket=${product.socket.toLowerCase()}`;

  return (
    <div className="mb-8 rounded border border-line bg-panel p-6">
      <div className="mb-4 flex items-end justify-between gap-4">
        <div>
          <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-signal-text">
            <span className="text-ink-faint">//</span> {product.socket} · COMPATIBLE
          </p>
          <h3 className="font-display text-lg font-semibold text-ink">
            {isCpu ? "Cheapest board per chipset" : `${product.socket} processors`}
          </h3>
        </div>
        <Link href={viewAll} className="font-mono text-[12px] uppercase tracking-wider text-ink-dim transition-colors hover:text-signal-text">
          View all →
        </Link>
      </div>
      <ul className="divide-y divide-line">
        {rows.map(({ p, label }) => (
          <li key={p.id}>
            <Link href={`/product/${p.id}`} className="group flex items-center justify-between gap-4 py-2.5">
              <span className="flex min-w-0 items-center gap-3">
                {label && (
                  <span className="w-14 shrink-0 rounded-sm bg-raised px-1.5 py-0.5 text-center font-mono text-[11px] text-ink-dim ring-1 ring-inset ring-line">
                    {label}
                  </span>
                )}
                <span className="truncate text-ink transition-colors group-hover:text-signal-text">{p.name}</span>
              </span>
              <span className={`shrink-0 font-mono text-sm font-semibold ${p.currentLowest !== null ? "text-ink" : "text-ink-faint"}`}>
                {p.currentLowest !== null ? `C$${p.currentLowest.toFixed(2)}` : "N/A"}
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
