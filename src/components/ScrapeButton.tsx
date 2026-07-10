"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

interface ScrapeResult {
  retailer: string;
  price: number | null;
  inStock: boolean;
  source: string;
  error?: string;
}

interface ScrapeButtonProps {
  productId: string;
  productName: string;
}

export default function ScrapeButton({ productId, productName }: ScrapeButtonProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<{ saved: string[]; failed: string[]; prices: ScrapeResult[] } | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleScrape = async () => {
    setLoading(true);
    setError(null);
    setResults(null);
    try {
      const res = await fetch(`/api/scrape?productId=${encodeURIComponent(productId)}`);
      const data = await res.json();
      if (data.error) {
        setError(data.error);
      } else {
        setResults({ saved: data.saved, failed: data.failed, prices: data.results });
        // Refresh server-side data (retailer table + chart)
        router.refresh();
      }
    } catch {
      setError("Request failed. Check your network connection.");
    }
    setLoading(false);
  };

  return (
    <div className="rounded border border-line bg-panel p-6">
      <div className="mb-4 flex items-center justify-between gap-4">
        <div>
          <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-signal-text">
            <span className="text-ink-faint">//</span> PROBE
          </p>
          <h3 className="font-display text-lg font-semibold text-ink">Live price refresh</h3>
          <p className="mt-0.5 font-mono text-[11px] text-ink-faint">
            fetches real-time prices and saves them to the database
          </p>
        </div>
        <button
          onClick={handleScrape}
          disabled={loading}
          className="flex shrink-0 items-center gap-2 rounded bg-signal px-5 py-2 font-mono text-xs font-medium uppercase tracking-wider text-white transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[0_6px_20px_-6px_var(--signal)] disabled:translate-y-0 disabled:bg-raised disabled:text-ink-faint disabled:shadow-none"
        >
          {loading ? (
            <>
              <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
              Probing…
            </>
          ) : (
            <>
              <span aria-hidden>↻</span> Refresh prices
            </>
          )}
        </button>
      </div>

      {error && (
        <div className="rounded border border-loss/30 bg-loss-soft p-3 font-mono text-sm text-loss" role="alert">
          {error}
        </div>
      )}

      {results && (
        <div className="space-y-2">
          {results.prices.map((r) => (
            <div
              key={r.retailer}
              className="flex items-center justify-between rounded bg-raised px-4 py-2.5"
            >
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-ink">{r.retailer}</span>
                <span className={`rounded-sm px-1.5 py-0.5 font-mono text-[10px] uppercase tracking-wider ${r.source === "api" ? "bg-signal-soft text-signal-text" : "bg-panel text-ink-dim"}`}>
                  {r.source}
                </span>
              </div>
              <div className="flex items-center gap-3 font-mono">
                {r.price != null ? (
                  <>
                    <span className={`text-xs ${r.inStock ? "text-gain" : "text-signal-text"}`}>
                      {r.inStock ? "● in stock" : "○ oos"}
                    </span>
                    <span className="font-semibold text-gain">C${r.price.toFixed(2)}</span>
                  </>
                ) : (
                  <span className="text-xs text-ink-faint">{r.error ?? "not found"}</span>
                )}
              </div>
            </div>
          ))}
          <div className="mt-3 flex items-center gap-4 font-mono text-[11px]">
            {results.saved.length > 0 && (
              <span className="text-gain">✓ saved to DB: {results.saved.join(", ")}</span>
            )}
            {results.failed.length > 0 && (
              <span className="text-ink-faint">no data: {results.failed.join(", ")}</span>
            )}
          </div>
        </div>
      )}

      {!results && !error && !loading && (
        <p className="font-mono text-xs leading-relaxed text-ink-faint">
          Covers Best Buy CA (API), Newegg.ca, Memory Express, Canada Computers.
          Results are saved to the database and charts update automatically.
        </p>
      )}
    </div>
  );
}
