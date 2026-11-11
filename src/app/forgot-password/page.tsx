"use client";

import { useState } from "react";
import Link from "next/link";
import AuthShell, { inputClass, labelClass, submitClass } from "@/components/auth/AuthShell";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [busy, setBusy] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    await fetch("/api/auth/forgot", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    }).catch(() => null);
    setSent(true);
    setBusy(false);
  };

  return (
    <AuthShell eyebrow="RECOVERY" title="Reset password">
      {sent ? (
        <div className="space-y-4">
          <p className="rounded border border-gain/40 bg-gain-soft p-4 font-mono text-sm text-gain" role="status">
            If an account exists for {email}, a reset link is on its way. It expires in 1 hour.
          </p>
          <Link href="/login" className="block text-center font-mono text-xs text-signal-text hover:underline">
            Back to log in
          </Link>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          <p className="text-sm text-ink-dim">Enter your email and we&apos;ll send you a link to choose a new password.</p>
          <div>
            <label htmlFor="email" className={labelClass}>Email</label>
            <input
              id="email"
              type="email"
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className={inputClass}
              required
            />
          </div>
          <button type="submit" disabled={busy} className={submitClass}>
            {busy ? "…" : "Send reset link"}
          </button>
        </form>
      )}
    </AuthShell>
  );
}
