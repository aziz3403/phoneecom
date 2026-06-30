import type { Metadata } from "next";
import Link from "next/link";
import { isAuthConfigured } from "@/lib/auth";
import { AuthNotConfigured } from "@/components/auth/AuthNotConfigured";
import { ResetClient } from "@/components/auth/ResetClient";

export const metadata: Metadata = {
  title: "Reset password",
  description: "Reset your reMint account password.",
};

export default async function ResetPage({
  searchParams,
}: {
  searchParams: Promise<{ token?: string }>;
}) {
  const { token } = await searchParams;
  return (
    <>
      <div className="pagehead">
        <p className="crumb">
          <Link href="/">Home</Link> · <Link href="/login">Account</Link> · Reset password
        </p>
        <h1 className="ptitle">Reset password</h1>
      </div>
      <section className="sec" style={{ paddingTop: 40 }}>
        <div className="shell-narrow">
          {isAuthConfigured() ? (
            <ResetClient token={typeof token === "string" ? token : undefined} />
          ) : (
            <AuthNotConfigured />
          )}
        </div>
      </section>
    </>
  );
}
