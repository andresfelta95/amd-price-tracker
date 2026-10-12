"use client";

import { useState } from "react";
import Link from "next/link";
import { Product } from "@/lib/types";
import { notifySessionChanged, useSession } from "@/lib/use-session";

interface AlertFormProps {
  product: Product;
}

export default function AlertForm({ product }: AlertFormProps) {
  const { session } = useSession();
  const [targetPrice, setTargetPrice] = useState(
    product.currentLowest !== null ? Math.floor(product.currentLowest * 0.9).toString() : ""
  );
  const [status, setStatus] = useState<"idle" | "saving" | "saved">("idle");
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const price = parseFloat(targetPrice);
    if (isNaN(price) || price <= 0) return;

    setStatus("saving");
    setError(null);
    try {
      const res = await fetch("/api/alerts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId: product.id, targetPrice: price }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error ?? "Couldn't save the alert");
      }
      setStatus("saved");
      notifySessionChanged();
      setTimeout(() => setStatus("idle"), 4000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Couldn't save the alert");
      setStatus("idle");
    }
  };

  const inputClass =
    "w-full rounded border border-line-strong bg-raised px-3 py-2 font-mono text-sm text-ink placeholder:text-ink-faint transition-colors focus:border-signal focus:outline-none";
  const user = session?.user;

  return (
    <div className="corner-frame rounded border border-line bg-panel p-6">
      <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-signal-text">
        <span className="text-ink-faint">//</span> ARM ALERT
      </p>
      <h3 className="mb-2 font-display text-lg font-semibold text-ink">Set price alert</h3>
      <p className="mb-4 text-sm text-ink-dim">
        Get notified by email or Telegram when the price drops to your target.
      </p>

      {!session ? (
        <div className="h-24 animate-pulse rounded bg-raised" aria-hidden />
      ) : !user ? (
        <div className="space-y-3">
          <p className="font-mono text-xs text-ink-faint">
            current lowest {product.currentLowest !== null ? `C$${product.currentLowest.toFixed(2)}` : "n/a"}
          </p>
          <Link
            href={`/login?next=/product/${product.id}`}
            className="block w-full rounded bg-signal py-2.5 text-center font-display font-semibold uppercase tracking-wide text-white transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[0_8px_28px_-8px_var(--signal)]"
          >
            Log in to set alerts
          </Link>
          <p className="text-center font-mono text-[11px] text-ink-faint">
            No account?{" "}
            <Link href={`/signup?next=/product/${product.id}`} className="text-signal-text hover:underline">
              Sign up free
            </Link>
          </p>
        </div>
      ) : status === "saved" ? (
        <div className="rounded border border-gain/40 bg-gain-soft p-4 font-mono text-sm text-gain" role="status">
          ▼ Alert armed. You&apos;ll be notified when {product.name} drops to C${targetPrice}.{" "}
          <Link href="/alerts" className="underline">Manage alerts</Link>
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
          {!user.emailVerified && (
            <p className="rounded border border-loss/30 bg-loss-soft p-2 font-mono text-[11px] text-loss">
              Confirm your email to start receiving alerts — check your inbox or{" "}
              <Link href="/account" className="underline">resend it</Link>.
            </p>
          )}
          {error && (
            <p className="font-mono text-xs text-signal-text" role="alert">{error}</p>
          )}
          <button
            type="submit"
            disabled={status === "saving"}
            className="w-full rounded bg-signal py-2.5 font-display font-semibold uppercase tracking-wide text-white transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[0_8px_28px_-8px_var(--signal)] active:translate-y-0 disabled:opacity-60"
          >
            {status === "saving" ? "Saving…" : "Create alert"}
          </button>
          <p className="font-mono text-[11px] text-ink-faint">
            {user.notifyEmail || user.notifyTelegram ? (
              <>
                Alerts go to{" "}
                {[user.notifyEmail && user.email, user.notifyTelegram && "Telegram"].filter(Boolean).join(" and ")}.
                One reminder a day while the price stays below target.
              </>
            ) : (
              <>
                All notifications are off — turn one on in <Link href="/account" className="underline">Account</Link>.
              </>
            )}
          </p>
        </form>
      )}
    </div>
  );
}
