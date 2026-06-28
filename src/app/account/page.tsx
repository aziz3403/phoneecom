import type { Metadata } from "next";
import Link from "next/link";
import { AccountClient } from "@/components/account/AccountClient";

export const metadata: Metadata = {
  title: "Your account",
  description: "Manage your reMint account, track orders and saved details.",
};

export default function AccountPage() {
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
          <AccountClient />
        </div>
      </section>
    </>
  );
}
