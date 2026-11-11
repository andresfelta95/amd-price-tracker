import type { ReactNode } from "react";

export const inputClass =
  "w-full rounded border border-line-strong bg-raised px-3 py-2 font-mono text-sm text-ink placeholder:text-ink-faint transition-colors focus:border-signal focus:outline-none";

export const labelClass = "mb-1 block font-mono text-xs uppercase tracking-wider text-ink-dim";

export const submitClass =
  "w-full rounded bg-signal py-2.5 font-display font-semibold uppercase tracking-wide text-white transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[0_8px_28px_-8px_var(--signal)] active:translate-y-0 disabled:translate-y-0 disabled:opacity-60 disabled:shadow-none";

/** Only same-site paths — never redirect to another origin after login. */
export function safeNext(next: string | string[] | undefined): string {
  const n = Array.isArray(next) ? next[0] : next;
  return n && n.startsWith("/") && !n.startsWith("//") ? n : "/alerts";
}

export function FormError({ message }: { message: string | null }) {
  if (!message) return null;
  return (
    <p className="rounded border border-signal/30 bg-signal-soft p-2.5 font-mono text-xs text-signal-text" role="alert">
      {message}
    </p>
  );
}

export default function AuthShell({ eyebrow, title, children }: { eyebrow: string; title: string; children: ReactNode }) {
  return (
    <div className="mx-auto max-w-md px-4 py-16">
      <div className="corner-frame rounded border border-line bg-panel p-6 sm:p-8">
        <p className="mb-1 font-mono text-xs tracking-[0.2em] text-signal-text">
          <span className="text-ink-faint">//</span> {eyebrow}
        </p>
        <h1 className="mb-6 font-display text-2xl font-bold uppercase tracking-wide text-ink">{title}</h1>
        {children}
      </div>
    </div>
  );
}
