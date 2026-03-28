import { Retailer } from "@/lib/types";

interface RetailerTableProps {
  retailers: Retailer[];
}

function formatPrice(price: number, currency: "USD" | "CAD" = "USD"): string {
  if (currency === "CAD") return `C$${price.toFixed(2)}`;
  return `$${price.toFixed(2)}`;
}

function RegionTable({
  retailers,
  currency,
  label,
  flag,
}: {
  retailers: Retailer[];
  currency: "USD" | "CAD";
  label: string;
  flag: string;
}) {
  if (retailers.length === 0) return null;
  const sorted = [...retailers].sort((a, b) => a.price - b.price);

  return (
    <div className="mb-6">
      <div className="flex items-center gap-2 mb-3">
        <span className="text-lg">{flag}</span>
        <span className="text-gray-300 text-sm font-semibold uppercase tracking-wide">
          {label}
        </span>
        <span className="text-xs text-gray-500">({currency})</span>
      </div>
      <table className="w-full">
        <thead>
          <tr className="border-b border-gray-700">
            <th className="text-left text-gray-400 text-sm font-medium pb-3">
              Retailer
            </th>
            <th className="text-left text-gray-400 text-sm font-medium pb-3">
              Price
            </th>
            <th className="text-left text-gray-400 text-sm font-medium pb-3">
              Stock
            </th>
            <th className="text-right text-gray-400 text-sm font-medium pb-3">
              Action
            </th>
          </tr>
        </thead>
        <tbody>
          {sorted.map((retailer, idx) => (
            <tr
              key={`${retailer.name}-${retailer.region ?? "US"}`}
              className="border-b border-gray-800 last:border-0"
            >
              <td className="py-3">
                <div className="flex items-center gap-2">
                  {idx === 0 && (
                    <span className="text-xs bg-green-500/20 text-green-400 px-1.5 py-0.5 rounded font-medium">
                      BEST
                    </span>
                  )}
                  <span className="text-white font-medium">
                    {retailer.name}
                  </span>
                </div>
              </td>
              <td className="py-3">
                <span
                  className={`font-semibold text-lg ${
                    idx === 0 ? "text-green-400" : "text-white"
                  }`}
                >
                  {formatPrice(retailer.price, currency)}
                </span>
              </td>
              <td className="py-3">
                {retailer.inStock ? (
                  <span className="text-green-400 text-sm flex items-center gap-1">
                    <span className="w-2 h-2 bg-green-400 rounded-full inline-block" />
                    In Stock
                  </span>
                ) : (
                  <span className="text-red-400 text-sm flex items-center gap-1">
                    <span className="w-2 h-2 bg-red-400 rounded-full inline-block" />
                    Out of Stock
                  </span>
                )}
              </td>
              <td className="py-3 text-right">
                <a
                  href={retailer.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`inline-block px-4 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                    retailer.inStock
                      ? "bg-amd-red hover:bg-red-700 text-white"
                      : "bg-gray-700 text-gray-400 cursor-not-allowed"
                  }`}
                >
                  {retailer.inStock ? "Buy Now" : "Unavailable"}
                </a>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default function RetailerTable({ retailers }: RetailerTableProps) {
  const usRetailers = retailers.filter((r) => !r.region || r.region === "US");
  const caRetailers = retailers.filter((r) => r.region === "CA");
  const lastChecked = retailers[0]?.lastChecked;

  return (
    <div className="bg-amd-gray border border-gray-700 rounded-xl p-6">
      <h3 className="text-white font-semibold text-lg mb-4">Where to Buy</h3>
      <div className="overflow-x-auto">
        <RegionTable
          retailers={usRetailers}
          currency="USD"
          label="United States"
          flag="🇺🇸"
        />
        <RegionTable
          retailers={caRetailers}
          currency="CAD"
          label="Canada"
          flag="🇨🇦"
        />
      </div>
      {lastChecked && (
        <p className="text-gray-500 text-xs mt-3">
          Last checked: {new Date(lastChecked).toLocaleString()}
        </p>
      )}
    </div>
  );
}
