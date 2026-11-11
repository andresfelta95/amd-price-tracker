import Link from "next/link";
import AuthShell from "@/components/auth/AuthShell";

export const metadata = { title: "Confirm email — AMD Price Tracker" };

export default function VerifyEmailPage({ searchParams }: { searchParams: { status?: string } }) {
  const ok = searchParams.status === "ok";
  return (
    <AuthShell eyebrow="VERIFY" title={ok ? "Email confirmed" : "Link expired"}>
      {ok ? (
        <div className="space-y-4">
          <p className="rounded border border-gain/40 bg-gain-soft p-4 font-mono text-sm text-gain" role="status">
            ✓ You&apos;re all set — price alerts will now be delivered.
          </p>
          <Link href="/alerts" className="block text-center font-mono text-xs text-signal-text hover:underline">
            Go to your alerts
          </Link>
        </div>
      ) : (
        <p className="text-sm text-ink-dim">
          This confirmation link is invalid, already used, or older than 24 hours. Log in and send a new one from{" "}
          <Link href="/account" className="text-signal-text hover:underline">your account</Link>.
        </p>
      )}
    </AuthShell>
  );
}
