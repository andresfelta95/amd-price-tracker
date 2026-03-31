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
    <div className="bg-amd-gray border border-gray-700 rounded-xl p-6">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-white font-semibold text-lg">Live Price Refresh</h3>
          <p className="text-gray-500 text-xs mt-0.5">
            Fetches real-time prices and saves them to the database
          </p>
        </div>
        <button
          onClick={handleScrape}
          disabled={loading}
          className="bg-amd-red hover:bg-red-700 disabled:bg-gray-600 text-white px-5 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2 shrink-0"
        >
          {loading ? (
            <>
              <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              Fetching...
            </>
          ) : (
            <>
              <span>↻</span> Refresh Prices
            </>
          )}
        </button>
      </div>

      {error && (
        <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-3 text-yellow-400 text-sm">
          {error}
        </div>
      )}

      {results && (
        <div className="space-y-2">
          {results.prices.map((r) => (
            <div
              key={r.retailer}
              className="flex items-center justify-between bg-gray-800 rounded-lg px-4 py-2.5"
            >
              <div className="flex items-center gap-2">
                <span className="text-white font-medium text-sm">{r.retailer}</span>
                <span className={`text-xs px-1.5 py-0.5 rounded ${r.source === "api" ? "bg-blue-500/20 text-blue-400" : "bg-gray-600 text-gray-300"}`}>
                  {r.source}
                </span>
              </div>
              <div className="flex items-center gap-3">
                {r.price != null ? (
                  <>
                    <span className={`text-xs ${r.inStock ? "text-green-400" : "text-red-400"}`}>
                      {r.inStock ? "In Stock" : "OOS"}
                    </span>
                    <span className="text-green-400 font-semibold">C${r.price.toFixed(2)}</span>
                  </>
                ) : (
                  <span className="text-gray-500 text-xs">{r.error ?? "Not found"}</span>
                )}
              </div>
            </div>
          ))}
          <div className="flex items-center gap-4 mt-3 text-xs">
            {results.saved.length > 0 && (
              <span className="text-green-400">
                ✓ Saved to DB: {results.saved.join(", ")}
              </span>
            )}
            {results.failed.length > 0 && (
              <span className="text-gray-500">
                No data: {results.failed.join(", ")}
              </span>
            )}
          </div>
        </div>
      )}

      {!results && !error && !loading && (
        <p className="text-gray-500 text-sm">
          Covers Best Buy CA (API), Newegg.ca, Memory Express, Canada Computers.
          Results are saved to the database and charts update automatically.
        </p>
      )}
    </div>
  );
}
