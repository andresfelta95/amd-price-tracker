import AuthShell, { safeNext } from "@/components/auth/AuthShell";
import CredentialsForm from "@/components/auth/CredentialsForm";

export const metadata = { title: "Log in — AMD Price Tracker" };

export default function LoginPage({ searchParams }: { searchParams: { next?: string } }) {
  return (
    <AuthShell eyebrow="AUTH" title="Log in">
      <CredentialsForm mode="login" next={safeNext(searchParams.next)} />
    </AuthShell>
  );
}
