import AuthShell, { safeNext } from "@/components/auth/AuthShell";
import CredentialsForm from "@/components/auth/CredentialsForm";

export const metadata = { title: "Sign up — AMD Price Tracker" };

export default function SignupPage({ searchParams }: { searchParams: { next?: string } }) {
  return (
    <AuthShell eyebrow="NEW OPERATOR" title="Create account">
      <p className="mb-5 text-sm text-ink-dim">
        Free. Set target prices on any CPU or GPU and get an email or Telegram message when they drop.
      </p>
      <CredentialsForm mode="signup" next={safeNext(searchParams.next)} />
    </AuthShell>
  );
}
