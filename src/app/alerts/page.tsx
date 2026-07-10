"use client";

import Link from "next/link";
import { useAlertStore } from "@/lib/store";

export default function AlertsPage() {
  const alerts = useAlertStore((s) => s.alerts);
  const removeAlert = useAlertStore((s) => s.removeAlert);

  return (
    <div className="mx-auto max-w-4xl px-4 py-12">
      <div className="mb-8">
        <p className="mb-1 font-mono text-xs tracking-[0.2em] text-signal-text">
          <span className="text-ink-faint">//</span> WATCHLIST
        </p>
        <h1 className="mb-2 font-display text-3xl font-bold uppercase tracking-wide text-ink sm:text-4xl">
          Price alerts
        </h1>
        <p className="text-ink-dim">
          Manage your price drop notifications. You&apos;ll be emailed when a product
          hits your target price.
        </p>
      </div>

      {alerts.length === 0 ? (
        <div className="corner-frame rounded border border-line bg-panel p-12 text-center">
          <p className="mb-4 font-mono text-sm uppercase tracking-widest text-ink-faint">[ no alerts armed ]</p>
          <h2 className="mb-2 font-display text-xl font-semibold text-ink">
            Nothing on the watchlist
          </h2>
          <p className="mb-6 text-sm text-ink-dim">
            Browse products and set price alerts to get notified when prices drop.
          </p>
          <div className="flex items-center justify-center gap-3">
            <Link
              href="/cpus"
              className="rounded bg-signal px-6 py-2.5 font-display font-semibold uppercase tracking-wide text-white transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[0_8px_28px_-8px_var(--signal)]"
            >
              Browse CPUs
            </Link>
            <Link
              href="/gpus"
              className="rounded border border-line-strong px-6 py-2.5 font-display font-semibold uppercase tracking-wide text-ink transition-all duration-200 hover:-translate-y-0.5 hover:border-signal hover:text-signal-text"
            >
              Browse GPUs
            </Link>
          </div>
        </div>
      ) : (
        <div className="space-y-3">
          {alerts.map((alert) => (
            <div
              key={alert.id}
              className="corner-frame flex items-center justify-between rounded border border-line bg-panel p-5"
            >
              <div className="flex-1">
                <Link
                  href={`/product/${alert.productId}`}
                  className="font-display text-lg font-semibold text-ink transition-colors hover:text-signal-text"
                >
                  {alert.productName}
                </Link>
                <div className="mt-1 flex flex-wrap items-center gap-x-4 gap-y-1 font-mono text-xs">
                  <span className="text-ink-dim">
                    target <span className="font-semibold text-gain">C${alert.targetPrice}</span>
                  </span>
                  <span className="text-ink-dim">
                    current <span className="font-semibold text-ink">C${alert.currentPrice}</span>
                  </span>
                  <span className="text-ink-faint">{alert.email}</span>
                </div>
                {alert.isTriggered && (
                  <span className="mt-2 inline-block rounded-sm bg-gain-soft px-2 py-0.5 font-mono text-[11px] uppercase tracking-wider text-gain">
                    ▼ target reached
                  </span>
                )}
              </div>
              <button
                onClick={() => removeAlert(alert.id)}
                className="ml-4 rounded p-2 text-ink-faint transition-colors hover:bg-signal-soft hover:text-signal-text"
                title="Remove alert"
                aria-label={`Remove alert for ${alert.productName}`}
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
