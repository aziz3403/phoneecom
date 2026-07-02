import type { Metadata } from "next";
import Link from "next/link";
import { ShieldAlert } from "lucide-react";
import { isAuthConfigured } from "@/lib/auth";
import { isAdminUser, adminOrders, adminTradeIns, adminBulkQuotes, adminApplications } from "@/lib/admin";
import { catalogStock } from "@/lib/inventory";
import { AdminDashboard } from "@/components/admin/AdminDashboard";

export const metadata: Metadata = {
  title: "Admin — reMint",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

export default async function AdminPage() {
  if (!isAuthConfigured() || !(await isAdminUser())) {
    return (
      <div className="mx-auto flex min-h-[60vh] w-full max-w-[520px] flex-col items-center justify-center px-[22px] text-center">
        <div className="grid h-14 w-14 place-items-center rounded-full bg-[#fbeaea] text-[#b23b3b]">
          <ShieldAlert className="h-7 w-7" />
        </div>
        <h1 className="mt-5 text-[26px] font-bold tracking-[-.02em] text-[#1d1d1f]">Owner access only</h1>
        <p className="mt-2 text-[14.5px] leading-relaxed text-[#6e6e73]">
          This is the reMint back office. Sign in with an admin account — the first admin is
          bootstrapped by adding your email to the <code className="rounded bg-[#f2f2f4] px-1.5 py-0.5 text-[12.5px]">ADMIN_EMAILS</code> environment
          variable.
        </p>
        <Link href="/login?callbackUrl=/admin" className="btn mt-6">Sign in</Link>
      </div>
    );
  }

  const [orders, tradeIns, bulkQuotes, applications, stock] = await Promise.all([
    adminOrders(),
    adminTradeIns(),
    adminBulkQuotes(),
    adminApplications(),
    catalogStock().catch(() => ({}) as Record<string, number>),
  ]);
  const stockUnits = Object.values(stock).reduce((n, v) => n + v, 0);

  return (
    <div className="pt-8">
      <div className="mx-auto w-full max-w-[1180px] px-[22px] pb-6">
        <h1 className="text-[30px] font-bold tracking-[-.02em] text-[#1d1d1f]">Back office</h1>
        <p className="mt-1 text-[14.5px] text-[#6e6e73]">
          Orders, trade-ins, bulk quotes and wholesale approvals — actions here email the customer automatically.
        </p>
      </div>
      <AdminDashboard
        orders={orders}
        tradeIns={tradeIns}
        bulkQuotes={bulkQuotes}
        applications={applications}
        stockUnits={stockUnits}
      />
    </div>
  );
}
