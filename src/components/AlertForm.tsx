"use client";

import { useState } from "react";
import { useAlertStore } from "@/lib/store";
import { Product } from "@/lib/types";

interface AlertFormProps {
  product: Product;
}

export default function AlertForm({ product }: AlertFormProps) {
  const [targetPrice, setTargetPrice] = useState(
    product.currentLowest !== null ? Math.floor(product.currentLowest * 0.9).toString() : ""
  );
  const [email, setEmail] = useState("");
  const [showSuccess, setShowSuccess] = useState(false);
  const addAlert = useAlertStore((s) => s.addAlert);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const price = parseFloat(targetPrice);
    if (isNaN(price) || !email) return;

    const alert = {
      id: `alert-${Date.now()}`,
      productId: product.id,
      productName: product.name,
      targetPrice: price,
      currentPrice: product.currentLowest ?? 0,
      isTriggered: product.currentLowest !== null && product.currentLowest <= price,
      createdAt: new Date().toISOString(),
      email,
    };

    // Save to local store
    addAlert(alert);

    // Also save to API
    try {
      await fetch("/api/alerts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(alert),
      });
    } catch {
      // Continue even if API fails — local store has it
    }

    setShowSuccess(true);
    setTimeout(() => setShowSuccess(false), 3000);
  };

  const inputClass =
    "w-full rounded border border-line-strong bg-raised px-3 py-2 font-mono text-sm text-ink placeholder:text-ink-faint transition-colors focus:border-signal focus:outline-none";

  return (
    <div className="corner-frame rounded border border-line bg-panel p-6">
      <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-signal-text">
        <span className="text-ink-faint">//</span> ARM ALERT
      </p>
      <h3 className="mb-2 font-display text-lg font-semibold text-ink">Set price alert</h3>
      <p className="mb-4 text-sm text-ink-dim">
        Get notified when the price drops to your target.
      </p>

      {showSuccess ? (
        <div className="rounded border border-gain/40 bg-gain-soft p-4 font-mono text-sm text-gain" role="status">
          ▼ Alert armed. You&apos;ll be notified when {product.name} drops to C${targetPrice}.
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-3">
          <div>
            <label htmlFor="alert-target" className="mb-1 block font-mono text-xs uppercase tracking-wider text-ink-dim">
              Target price (C$)
            </label>
            <input
              id="alert-target"
              type="number"
              value={targetPrice}
              onChange={(e) => setTargetPrice(e.target.value)}
              min="1"
              step="1"
              className={inputClass}
              placeholder="Enter target price"
              required
            />
            <p className="mt-1 font-mono text-[11px] text-ink-faint">
              current lowest {product.currentLowest !== null ? `C$${product.currentLowest.toFixed(2)}` : "n/a"}
            </p>
          </div>
          <div>
            <label htmlFor="alert-email" className="mb-1 block font-mono text-xs uppercase tracking-wider text-ink-dim">
              Email address
            </label>
            <input
              id="alert-email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className={inputClass}
              placeholder="your@email.com"
              required
            />
          </div>
          <button
            type="submit"
            className="w-full rounded bg-signal py-2.5 font-display font-semibold uppercase tracking-wide text-white transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[0_8px_28px_-8px_var(--signal)] active:translate-y-0"
          >
            Create alert
          </button>
        </form>
      )}
    </div>
  );
}
