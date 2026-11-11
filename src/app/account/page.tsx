export const dynamic = "force-dynamic";

import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { telegramConfigured } from "@/lib/notify/telegram";
import AccountPanel from "@/components/auth/AccountPanel";
import { safeNext } from "@/components/auth/AuthShell";

export const metadata = { title: "Account — AMD Price Tracker" };

export default async function AccountPage({ searchParams }: { searchParams: { welcome?: string; next?: string } }) {
  const user = await getCurrentUser();
  if (!user) redirect("/login?next=/account");

  return (
    <div className="mx-auto max-w-2xl px-4 py-12">
      <p className="mb-1 font-mono text-xs tracking-[0.2em] text-signal-text">
        <span className="text-ink-faint">//</span> OPERATOR
      </p>
      <h1 className="mb-8 font-display text-3xl font-bold uppercase tracking-wide text-ink sm:text-4xl">Account</h1>
      <AccountPanel
        user={user}
        telegramAvailable={telegramConfigured()}
        welcome={searchParams.welcome === "1"}
        next={searchParams.next ? safeNext(searchParams.next) : null}
      />
    </div>
  );
}
