"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { notifySessionChanged } from "@/lib/use-session";
import { FormError, inputClass, labelClass, submitClass } from "./AuthShell";

export default function ResetPasswordForm({ token }: { token: string }) {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setError(null);
    const res = await fetch("/api/auth/reset", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token, password }),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      setError(data.error ?? "Something went wrong");
      setBusy(false);
      return;
    }
    notifySessionChanged();
    router.push("/alerts");
    router.refresh();
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="password" className={labelClass}>New password</label>
        <input
          id="password"
          type="password"
          autoComplete="new-password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className={inputClass}
          minLength={10}
          required
        />
        <p className="mt-1 font-mono text-[11px] text-ink-faint">At least 10 characters. You&apos;ll be logged out everywhere else.</p>
      </div>
      <FormError message={error} />
      {error && (
        <Link href="/forgot-password" className="block font-mono text-xs text-signal-text hover:underline">
          Request a new link
        </Link>
      )}
      <button type="submit" disabled={busy} className={submitClass}>
        {busy ? "…" : "Save password"}
      </button>
    </form>
  );
}
