import Link from "next/link";
import AuthShell from "@/components/auth/AuthShell";
import ResetPasswordForm from "@/components/auth/ResetPasswordForm";

export const metadata = { title: "Choose a new password — AMD Price Tracker" };

export default function ResetPasswordPage({ searchParams }: { searchParams: { token?: string } }) {
  return (
    <AuthShell eyebrow="RECOVERY" title="New password">
      {searchParams.token ? (
        <ResetPasswordForm token={searchParams.token} />
      ) : (
        <p className="text-sm text-ink-dim">
          This link is missing its token.{" "}
          <Link href="/forgot-password" className="text-signal-text hover:underline">Request a new one</Link>.
        </p>
      )}
    </AuthShell>
  );
}
