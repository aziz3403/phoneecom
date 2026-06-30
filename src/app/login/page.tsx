import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { auth, isAuthConfigured, isGoogleConfigured } from "@/lib/auth";
import { AuthNotConfigured } from "@/components/auth/AuthNotConfigured";
import { LoginClient } from "@/components/auth/LoginClient";

export const metadata: Metadata = {
  title: "Sign in",
  description: "Sign in or create your reMint account.",
};

const AUTH_ERRORS: Record<string, string> = {
  CredentialsSignin: "Incorrect email or password.",
  OAuthAccountNotLinked: "That email is already registered with a different sign-in method.",
};

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ callbackUrl?: string; error?: string }>;
}) {
  const { callbackUrl, error } = await searchParams;
  const dest = callbackUrl && callbackUrl.startsWith("/") ? callbackUrl : "/account";
  const initialError = error ? (AUTH_ERRORS[error] ?? "Couldn't sign you in. Please try again.") : "";

  const configured = isAuthConfigured();
  if (configured) {
    const session = await auth();
    if (session?.user) redirect(dest);
  }

  return (
    <>
      <div className="pagehead">
        <p className="crumb">
          <Link href="/">Home</Link> · Account
        </p>
        <h1 className="ptitle">Account</h1>
      </div>
      <section className="sec" style={{ paddingTop: 40 }}>
        <div className="shell-narrow">
          {configured ? (
            <LoginClient googleEnabled={isGoogleConfigured()} callbackUrl={dest} initialError={initialError} />
          ) : (
            <AuthNotConfigured />
          )}
        </div>
      </section>
    </>
  );
}
