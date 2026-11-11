"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { notifySessionChanged } from "@/lib/use-session";
import { FormError, inputClass, labelClass, submitClass } from "./AuthShell";

const MIN_PASSWORD = 10;

/** Login and signup share one form; signup adds the password rules and goes to /account after. */
export default function CredentialsForm({ mode, next }: { mode: "login" | "signup"; next: string }) {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const signup = mode === "signup";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      const res = await fetch(`/api/auth/${mode}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error ?? "Something went wrong");
      notifySessionChanged();
      router.push(signup ? `/account?welcome=1&next=${encodeURIComponent(next)}` : next);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
      setBusy(false);
    }
  };

  const nextQuery = next !== "/alerts" ? `?next=${encodeURIComponent(next)}` : "";

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="email" className={labelClass}>Email</label>
        <input
          id="email"
          type="email"
          autoComplete="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className={inputClass}
          placeholder="you@example.com"
          required
        />
      </div>
      <div>
        <div className="flex items-baseline justify-between">
          <label htmlFor="password" className={labelClass}>Password</label>
          {!signup && (
            <Link href="/forgot-password" className="font-mono text-[11px] text-ink-faint hover:text-signal-text">
              Forgot?
            </Link>
          )}
        </div>
        <input
          id="password"
          type="password"
          autoComplete={signup ? "new-password" : "current-password"}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className={inputClass}
          minLength={signup ? MIN_PASSWORD : undefined}
          required
        />
        {signup && (
          <p className="mt-1 font-mono text-[11px] text-ink-faint">At least {MIN_PASSWORD} characters</p>
        )}
      </div>
      <FormError message={error} />
      <button type="submit" disabled={busy} className={submitClass}>
        {busy ? "…" : signup ? "Create account" : "Log in"}
      </button>
      <p className="text-center font-mono text-xs text-ink-faint">
        {signup ? (
          <>Already have an account? <Link href={`/login${nextQuery}`} className="text-signal-text hover:underline">Log in</Link></>
        ) : (
          <>New here? <Link href={`/signup${nextQuery}`} className="text-signal-text hover:underline">Create an account</Link></>
        )}
      </p>
    </form>
  );
}
