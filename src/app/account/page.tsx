import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { auth, isAuthConfigured } from "@/lib/auth";
import { getMyOrders } from "@/lib/orders";
import { AccountDashboard } from "@/components/account/AccountDashboard";
import { AuthNotConfigured } from "@/components/auth/AuthNotConfigured";

export const metadata: Metadata = {
  title: "Your account",
  description: "Manage your reMint account, track orders and saved details.",
};

export default async function AccountPage() {
  const configured = isAuthConfigured();
  let dashboard: React.ReactNode = <AuthNotConfigured />;

  if (configured) {
    const session = await auth();
    if (!session?.user) redirect("/login?callbackUrl=/account");
    const orders = await getMyOrders();
    dashboard = (
      <AccountDashboard
        user={{
          name: session.user.name ?? "there",
          email: session.user.email ?? "",
          wholesaleApproved: session.user.wholesaleApproved,
        }}
        orders={orders}
      />
    );
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
        <div className="shell-narrow">{dashboard}</div>
      </section>
    </>
  );
}
