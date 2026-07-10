import { Retailer } from "@/lib/types";

interface RetailerTableProps {
  retailers: Retailer[];
}

export default function RetailerTable({ retailers }: RetailerTableProps) {
  const sorted = [...retailers].sort((a, b) => (a.price ?? Infinity) - (b.price ?? Infinity));
  const lastChecked = retailers[0]?.lastChecked;

  return (
    <div className="rounded border border-line bg-panel p-6">
      <div className="mb-4">
        <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-signal-text">
          <span className="text-ink-faint">//</span> SOURCES
        </p>
        <h3 className="font-display text-lg font-semibold text-ink">Canadian retailers (CAD)</h3>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-line-strong">
              <th className="pb-3 text-left font-mono text-[11px] font-medium uppercase tracking-wider text-ink-faint">Retailer</th>
              <th className="pb-3 text-left font-mono text-[11px] font-medium uppercase tracking-wider text-ink-faint">Price</th>
              <th className="pb-3 text-left font-mono text-[11px] font-medium uppercase tracking-wider text-ink-faint">Stock</th>
              <th className="pb-3 text-right font-mono text-[11px] font-medium uppercase tracking-wider text-ink-faint">Action</th>
            </tr>
          </thead>
          <tbody>
            {sorted.map((retailer, idx) => (
              <tr key={retailer.name} className="border-b border-line last:border-0">
                <td className="py-3">
                  <div className="flex items-center gap-2">
                    {idx === 0 && (
                      <span className="rounded-sm bg-gain-soft px-1.5 py-0.5 font-mono text-[10px] font-medium uppercase tracking-wider text-gain">
                        best
                      </span>
                    )}
                    <span className="font-medium text-ink">{retailer.name}</span>
                  </div>
                </td>
                <td className="py-3">
                  <span className={`font-mono text-lg font-semibold ${idx === 0 ? "text-gain" : "text-ink"}`}>
                    C${retailer.price.toFixed(2)}
                  </span>
                </td>
                <td className="py-3">
                  {retailer.inStock ? (
                    <span className="font-mono text-xs text-gain">● in stock</span>
                  ) : (
                    <span className="font-mono text-xs text-ink-faint">○ out of stock</span>
                  )}
                </td>
                <td className="py-3 text-right">
                  <a
                    href={retailer.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-disabled={!retailer.inStock}
                    className={`inline-block rounded px-4 py-1.5 font-mono text-xs font-medium uppercase tracking-wider transition-all duration-200 ${
                      retailer.inStock
                        ? "bg-signal text-white hover:-translate-y-0.5 hover:shadow-[0_6px_20px_-6px_var(--signal)]"
                        : "cursor-not-allowed bg-raised text-ink-faint"
                    }`}
                  >
                    {retailer.inStock ? "Buy now" : "Unavailable"}
                  </a>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {lastChecked && (
        <p className="mt-3 font-mono text-[11px] text-ink-faint">
          last checked {new Date(lastChecked).toLocaleString("en-CA")}
        </p>
      )}
    </div>
  );
}
