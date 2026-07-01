import type { Metadata } from "next";
import Link from "next/link";
import { RefreshCw, Boxes, ShieldCheck, Lock, LogIn } from "lucide-react";
import { getInventory } from "@/lib/inventory";
import { InventoryClient } from "@/components/inventory/InventoryClient";
import { auth, isAuthConfigured } from "@/lib/auth";

export const metadata: Metadata = {
  title: "Live inventory",
  description:
    "Live, daily-synced warehouse stock — reserved for approved reMint trade accounts.",
};

export default async function InventoryPage() {
  // Live warehouse stock is wholesale-only. Gate on the server so the full
  // stock list never reaches (or is fetched for) non-approved visitors.
  const session = isAuthConfigured() ? await auth() : null;
  const approved = Boolean(session?.user?.wholesaleApproved);

  if (!approved) {
    return <InventoryLocked signedIn={Boolean(session?.user)} />;
  }

  const { items, live, units } = await getInventory();
  const synced = new Date().toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });

  return (
    <div className="pt-12">
      <header className="pagehead">
        <p className="crumb">
          <Link href="/">Home</Link> · Live inventory
        </p>
        <div className="mt-4 flex flex-wrap items-center gap-3">
          <span className="tag accent">
            <span className="livedot" />
            {live ? "Live — synced from inventory sheet" : "Synced inventory"}
          </span>
          <span className="inline-flex items-center gap-1.5 text-xs text-[#86868b]">
            <RefreshCw className="h-3.5 w-3.5" /> Updated {synced} · auto-syncs daily
          </span>
        </div>

        <h1 className="ptitle mt-3">Live inventory</h1>
        <p className="psub">
          Straight from our warehouse and refreshed every day — your approved trade-account view.
          Every device is fully unlocked, fully functional, and guaranteed 80%+ battery health.
        </p>

        <div className="mt-8 grid max-w-2xl grid-cols-3 overflow-hidden rounded-[22px] border border-[#d2d2d7] bg-[#d2d2d7] gap-px">
          {[
            { icon: Boxes, label: "Units in stock", value: units.toLocaleString() },
            { icon: RefreshCw, label: "Listings", value: items.length.toLocaleString() },
            { icon: ShieldCheck, label: "Battery", value: "80%+" },
          ].map((s) => (
            <div key={s.label} className="bg-white p-5 text-center">
              <s.icon className="mx-auto h-5 w-5 text-[#0a8f6e]" />
              <p className="mt-2 text-2xl font-bold tracking-[-.02em] text-[#1d1d1f]">{s.value}</p>
              <p className="text-xs text-[#6e6e73]">{s.label}</p>
            </div>
          ))}
        </div>
      </header>

      <div className="shell pb-24 pt-10">
        <InventoryClient items={items} />
      </div>
    </div>
  );
}

function InventoryLocked({ signedIn }: { signedIn: boolean }) {
  return (
    <div className="pt-12">
      <header className="pagehead">
        <p className="crumb">
          <Link href="/">Home</Link> · Live inventory
        </p>
        <div className="mt-4">
          <span className="tag accent">
            <Lock className="h-3.5 w-3.5" /> Approved trade accounts only
          </span>
        </div>
        <h1 className="ptitle mt-3">Live warehouse inventory</h1>
        <p className="psub">
          Our full live stock list — every model, condition grade and quantity — is reserved for
          approved wholesale partners.
        </p>
      </header>

      <div className="shell pb-24 pt-10">
        <div
          className="scard-bord"
          style={{ maxWidth: 540, margin: "0 auto", textAlign: "center", padding: "40px 28px" }}
        >
          <div
            style={{
              width: 56,
              height: 56,
              margin: "0 auto 18px",
              borderRadius: "50%",
              display: "grid",
              placeItems: "center",
              background: "#f1f7f3",
              color: "var(--accent)",
            }}
          >
            <Lock className="h-7 w-7" />
          </div>
          <h2 style={{ fontSize: 22, fontWeight: 700, letterSpacing: "-.02em" }}>
            Live inventory is for trade accounts
          </h2>
          <p style={{ fontSize: 15, color: "var(--text2)", marginTop: 10, lineHeight: 1.55 }}>
            Apply for a wholesale trade account to unlock the full live stock list with real-time
            quantities and volume pricing — most applications are approved in under a minute.
          </p>
          <div style={{ marginTop: 22, display: "flex", gap: 10, justifyContent: "center", flexWrap: "wrap" }}>
            <Link className="btn" href="/wholesale">
              Apply for a trade account
            </Link>
            {!signedIn && (
              <Link className="btn btn-lt" href="/login?callbackUrl=/inventory" style={{ display: "inline-flex", alignItems: "center", gap: 8 }}>
                <LogIn className="h-4 w-4" /> Sign in
              </Link>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
