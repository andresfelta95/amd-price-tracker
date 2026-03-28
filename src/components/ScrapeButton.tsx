"use client";

import { useState } from "react";
import { ScrapedPrice } from "@/lib/scraper";

interface ScrapeButtonProps {
  productName: string;
}

export default function ScrapeButton({ productName }: ScrapeButtonProps) {
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<ScrapedPrice[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleScrape = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(
        `/api/scrape?product=${encodeURIComponent(productName)}`
      );
      const data = await res.json();
      if (data.error) {
        setError(data.error);
      } else {
        setResults(data.prices);
      }
    } catch {
      setError("Failed to fetch live prices. Retailers may be blocking requests.");
    }
    setLoading(false);
  };

  return (
    <div className="bg-amd-gray border border-gray-700 rounded-xl p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-white font-semibold text-lg">Live Price Check</h3>
        <button
          onClick={handleScrape}
          disabled={loading}
          className="bg-amd-red hover:bg-red-700 disabled:bg-gray-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2"
        >
          {loading ? (
            <>
              <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              Scraping...
            </>
          ) : (
            "Refresh Prices"
          )}
        </button>
      </div>

      {error && (
        <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-3 text-yellow-400 text-sm mb-3">
          {error} — Showing cached data instead.
        </div>
      )}

      {results && (
        <div className="space-y-2">
          {results.map((r) => (
            <div
              key={r.retailer}
              className="flex items-center justify-between bg-gray-800 rounded-lg px-4 py-2"
            >
              <span className="text-white font-medium">{r.retailer}</span>
              {r.price ? (
                <span className="text-green-400 font-semibold">
                  C${r.price.toFixed(2)}
                </span>
              ) : (
                <span className="text-gray-500 text-sm">
                  {r.error || "Price not found"}
                </span>
              )}
            </div>
          ))}
          <p className="text-gray-500 text-xs mt-2">
            Scraped at {new Date().toLocaleString()}
          </p>
        </div>
      )}

      {!results && !error && (
        <p className="text-gray-500 text-sm">
          Click &quot;Refresh Prices&quot; to scrape live prices from retailers.
        </p>
      )}
    </div>
  );
}
