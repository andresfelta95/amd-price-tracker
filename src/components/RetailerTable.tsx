import { Retailer } from "@/lib/types";

interface RetailerTableProps {
  retailers: Retailer[];
}

export default function RetailerTable({ retailers }: RetailerTableProps) {
  const sorted = [...retailers].sort((a, b) => a.price - b.price);

  return (
    <div className="bg-amd-gray border border-gray-700 rounded-xl p-6">
      <h3 className="text-white font-semibold text-lg mb-4">
        Where to Buy
      </h3>
      <div className="overflow-x-auto">
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
                key={retailer.name}
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
                    C${retailer.price.toFixed(2)}
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
      <p className="text-gray-500 text-xs mt-3">
        Last checked: {new Date(sorted[0]?.lastChecked).toLocaleString()}
      </p>
    </div>
  );
}
