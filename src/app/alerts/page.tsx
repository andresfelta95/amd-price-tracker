"use client";

import Link from "next/link";
import { useAlertStore } from "@/lib/store";

export default function AlertsPage() {
  const alerts = useAlertStore((s) => s.alerts);
  const removeAlert = useAlertStore((s) => s.removeAlert);

  return (
    <div className="max-w-4xl mx-auto px-4 py-10">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">Your Price Alerts</h1>
        <p className="text-gray-400">
          Manage your price drop notifications. You&apos;ll be emailed when a product
          hits your target price.
        </p>
      </div>

      {alerts.length === 0 ? (
        <div className="bg-amd-gray border border-gray-700 rounded-xl p-12 text-center">
          <p className="text-5xl mb-4">🔔</p>
          <h2 className="text-xl font-semibold text-white mb-2">
            No alerts set
          </h2>
          <p className="text-gray-400 mb-6">
            Browse products and set price alerts to get notified when prices
            drop.
          </p>
          <div className="flex items-center justify-center gap-3">
            <Link
              href="/cpus"
              className="bg-amd-red hover:bg-red-700 text-white px-6 py-2 rounded-lg font-medium transition-colors"
            >
              Browse CPUs
            </Link>
            <Link
              href="/gpus"
              className="bg-gray-700 hover:bg-gray-600 text-white px-6 py-2 rounded-lg font-medium transition-colors"
            >
              Browse GPUs
            </Link>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          {alerts.map((alert) => (
            <div
              key={alert.id}
              className="bg-amd-gray border border-gray-700 rounded-xl p-5 flex items-center justify-between"
            >
              <div className="flex-1">
                <Link
                  href={`/product/${alert.productId}`}
                  className="text-white font-semibold text-lg hover:text-amd-red transition-colors"
                >
                  {alert.productName}
                </Link>
                <div className="flex items-center gap-4 mt-1">
                  <span className="text-gray-400 text-sm">
                    Target: <span className="text-green-400 font-medium">${alert.targetPrice}</span>
                  </span>
                  <span className="text-gray-400 text-sm">
                    Current: <span className="text-white font-medium">${alert.currentPrice}</span>
                  </span>
                  <span className="text-gray-500 text-xs">
                    {alert.email}
                  </span>
                </div>
                {alert.isTriggered && (
                  <span className="inline-block mt-2 text-xs bg-green-500/20 text-green-400 px-2 py-0.5 rounded">
                    Price target reached!
                  </span>
                )}
              </div>
              <button
                onClick={() => removeAlert(alert.id)}
                className="text-gray-500 hover:text-red-400 transition-colors ml-4 p-2"
                title="Remove alert"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z"
                    clipRule="evenodd"
                  />
                </svg>
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
