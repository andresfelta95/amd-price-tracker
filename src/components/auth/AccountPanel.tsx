"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import type { User } from "@/lib/auth";
import { notifySessionChanged } from "@/lib/use-session";
import { FormError } from "./AuthShell";

const card = "corner-frame rounded border border-line bg-panel p-6";
const eyebrow = "mb-3 font-mono text-[11px] uppercase tracking-[0.2em] text-signal-text";
const smallBtn =
  "rounded border border-line-strong px-3 py-1.5 font-mono text-[11px] uppercase tracking-wider text-ink transition-colors hover:border-signal hover:text-signal-text disabled:opacity-50";

interface Props {
  user: User;
  telegramAvailable: boolean;
  welcome: boolean;
  next: string | null;
}

export default function AccountPanel({ user, telegramAvailable, welcome, next }: Props) {
  const router = useRouter();
  const [prefs, setPrefs] = useState({ notifyEmail: user.notifyEmail, notifyTelegram: user.notifyTelegram });
  const [verifySent, setVerifySent] = useState(false);
  const [telegramUrl, setTelegramUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const call = async (url: string, init: RequestInit) => {
    setBusy(true);
    setError(null);
    try {
      const res = await fetch(url, init);
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error ?? "Something went wrong");
      return data;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
      return null;
    } finally {
      setBusy(false);
    }
  };

  const savePrefs = async (next: typeof prefs) => {
    const data = await call("/api/account", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(next),
    });
    if (data) {
      setPrefs({ notifyEmail: data.notifyEmail, notifyTelegram: data.notifyTelegram });
      notifySessionChanged();
    }
  };

  const resendVerification = async () => {
    if (await call("/api/auth/resend-verification", { method: "POST" })) setVerifySent(true);
  };

  const linkTelegram = async () => {
    const data = await call("/api/account/telegram", { method: "POST" });
    if (data?.url) {
      setTelegramUrl(data.url);
      window.open(data.url, "_blank", "noopener");
    }
  };

  const unlinkTelegram = async () => {
    if (await call("/api/account/telegram", { method: "DELETE" })) router.refresh();
  };

  const logout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    notifySessionChanged();
    router.push("/");
    router.refresh();
  };

  return (
    <div className="space-y-4">
      {welcome && (
        <div className="rounded border border-gain/40 bg-gain-soft p-4 font-mono text-sm text-gain" role="status">
          ✓ Account created. We sent a confirmation link to {user.email}.
          {next && (
            <>
              {" "}
              <Link href={next} className="underline">Continue where you left off</Link>
            </>
          )}
        </div>
      )}

      <FormError message={error} />

      <section className={card}>
        <p className={eyebrow}><span className="text-ink-faint">//</span> IDENTITY</p>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="font-mono text-sm text-ink">{user.email}</p>
            <p className={`mt-1 font-mono text-[11px] uppercase tracking-wider ${user.emailVerified ? "text-gain" : "text-loss"}`}>
              {user.emailVerified ? "● confirmed" : "○ not confirmed — alerts are on hold"}
            </p>
          </div>
          <div className="flex gap-2">
            {!user.emailVerified && (
              <button onClick={resendVerification} disabled={busy || verifySent} className={smallBtn}>
                {verifySent ? "Sent ✓" : "Resend link"}
              </button>
            )}
            <button onClick={logout} className={smallBtn}>Log out</button>
          </div>
        </div>
      </section>

      <section className={card}>
        <p className={eyebrow}><span className="text-ink-faint">//</span> NOTIFICATIONS</p>
        <p className="mb-4 text-sm text-ink-dim">
          Where to send alerts. While a product stays at or below your target you get one reminder a day.
        </p>

        <label className="flex items-center justify-between gap-4 border-b border-line py-3">
          <span>
            <span className="block text-sm text-ink">Email</span>
            <span className="font-mono text-[11px] text-ink-faint">{user.email}</span>
          </span>
          <input
            type="checkbox"
            className="h-5 w-5 accent-[var(--signal)]"
            checked={prefs.notifyEmail}
            disabled={busy}
            onChange={(e) => savePrefs({ ...prefs, notifyEmail: e.target.checked })}
          />
        </label>

        <div className="flex items-center justify-between gap-4 py-3">
          <span>
            <span className="block text-sm text-ink">Telegram</span>
            <span className="font-mono text-[11px] text-ink-faint">
              {!telegramAvailable
                ? "not available on this server yet"
                : user.telegramLinked
                  ? "linked"
                  : "not linked"}
            </span>
          </span>
          {telegramAvailable && (
            <div className="flex items-center gap-3">
              {user.telegramLinked ? (
                <>
                  <button onClick={unlinkTelegram} disabled={busy} className={smallBtn}>Unlink</button>
                  <input
                    type="checkbox"
                    aria-label="Send alerts to Telegram"
                    className="h-5 w-5 accent-[var(--signal)]"
                    checked={prefs.notifyTelegram}
                    disabled={busy}
                    onChange={(e) => savePrefs({ ...prefs, notifyTelegram: e.target.checked })}
                  />
                </>
              ) : (
                <button onClick={linkTelegram} disabled={busy} className={smallBtn}>Link Telegram</button>
              )}
            </div>
          )}
        </div>

        {telegramUrl && !user.telegramLinked && (
          <p className="mt-2 rounded bg-raised p-3 font-mono text-[11px] leading-relaxed text-ink-dim">
            Telegram should have opened — press <strong className="text-ink">Start</strong> in the bot chat.
            If it didn&apos;t, <a href={telegramUrl} target="_blank" rel="noopener noreferrer" className="text-signal-text underline">open this link</a>{" "}
            (valid 15 minutes), then{" "}
            <button onClick={() => router.refresh()} className="text-signal-text underline">refresh</button>.
          </p>
        )}
      </section>

      <Link href="/alerts" className="block text-center font-mono text-xs text-signal-text hover:underline">
        Manage your alerts →
      </Link>
    </div>
  );
}
