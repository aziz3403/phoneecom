import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { auth, isAuthConfigured } from "@/lib/auth";
import { getMyOrders } from "@/lib/orders";
import { getProfile } from "@/lib/profile-actions";
import { isEmailVerified } from "@/lib/verify-actions";
import { computeTracking } from "@/lib/tracking";
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

    const [orders, profile, emailVerified] = await Promise.all([
      getMyOrders(),
      getProfile(),
      isEmailVerified(),
    ]);
    const now = new Date().toISOString();
    const enriched = orders.map((o) => {
      const t = computeTracking({ placedAtISO: o.createdAt, etaISO: o.etaISO, express: o.express, nowISO: now });
      return { ...o, statusLabel: t.statusLabel, etaLabel: t.etaLabel, delivered: t.delivered };
    });

    dashboard = (
      <AccountDashboard
        user={{
          name: session.user.name ?? "there",
          email: session.user.email ?? "",
          wholesaleApproved: session.user.wholesaleApproved,
          emailVerified,
        }}
        orders={enriched}
        profile={profile}
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
      <section className="sec" style={{ paddingTop: 36 }}>
        <div className="shell-narrow">{dashboard}</div>
      </section>
    </>
  );
}
