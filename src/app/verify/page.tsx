import type { Metadata } from "next";
import Link from "next/link";
import { isAuthConfigured } from "@/lib/auth";
import { AuthNotConfigured } from "@/components/auth/AuthNotConfigured";
import { VerifyClient } from "@/components/auth/VerifyClient";

export const metadata: Metadata = {
  title: "Verify email",
  description: "Confirm your reMint email address.",
};

export default async function VerifyPage({
  searchParams,
}: {
  searchParams: Promise<{ token?: string }>;
}) {
  const { token } = await searchParams;
  return (
    <>
      <div className="pagehead">
        <p className="crumb">
          <Link href="/">Home</Link> · <Link href="/account">Account</Link> · Verify email
        </p>
        <h1 className="ptitle">Verify email</h1>
      </div>
      <section className="sec" style={{ paddingTop: 40 }}>
        <div className="shell-narrow">
          {isAuthConfigured() ? (
            <VerifyClient token={typeof token === "string" ? token : undefined} />
          ) : (
            <AuthNotConfigured />
          )}
        </div>
      </section>
    </>
  );
}
