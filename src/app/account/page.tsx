import type { Metadata } from "next";
import { AccountClient } from "@/components/account/AccountClient";

export const metadata: Metadata = {
  title: "Your account",
  description: "Manage your reMint account, track orders and saved details.",
};

export default function AccountPage() {
  return (
    <div className="pt-28">
      <div className="mx-auto max-w-4xl px-5 pb-6 sm:px-8">
        <p className="text-sm text-white/40">Home · Account</p>
        <h1 className="mt-2 font-display text-4xl font-extrabold tracking-tight text-white sm:text-5xl">
          Account
        </h1>
      </div>
      <div className="mx-auto max-w-4xl px-5 pb-24 sm:px-8">
        <AccountClient />
      </div>
    </div>
  );
}
