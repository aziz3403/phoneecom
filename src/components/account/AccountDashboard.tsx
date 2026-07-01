"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import {
  Package,
  LogOut,
  User,
  CheckCircle2,
  Truck,
  Building2,
  CreditCard,
  ChevronRight,
  ShieldCheck,
  RefreshCcw,
  Banknote,
} from "lucide-react";
import { logoutAction } from "@/lib/auth-actions";
import type { FullOrder } from "@/lib/orders";
import type { MyTradeIn } from "@/lib/trade-ins";
import type { Profile } from "@/lib/profile-actions";
import { imageFor } from "@/lib/products";
import { formatPrice, cn } from "@/lib/utils";
import { PhImg } from "@/components/home/PhImg";
import { ProfileEditor } from "./ProfileEditor";
import { VerifyBanner } from "./VerifyBanner";

type DashOrder = FullOrder & { statusLabel: string; etaLabel: string; delivered: boolean };

interface DashUser {
  name: string;
  email: string;
  wholesaleApproved: boolean;
  emailVerified: boolean;
}

export function AccountDashboard({
  user,
  orders,
  tradeIns = [],
  profile,
}: {
  user: DashUser;
  orders: DashOrder[];
  tradeIns?: MyTradeIn[];
  profile: Profile | null;
}) {
  const [tab, setTab] = useState<"orders" | "tradeins" | "details">("orders");
  const [pending, start] = useTransition();
  const initials = user.name.split(" ").map((w) => w[0]).slice(0, 2).join("");

  const totalSaved = orders.reduce((s, o) => s + (o.savings ?? 0), 0);
  const co2 = orders.reduce((s, o) => s + (o.co2kg ?? 0), 0);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 22 }}>
      {/* profile header */}
      <div className="scard-bord" style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 16, flexWrap: "wrap" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <div style={{ width: 56, height: 56, borderRadius: "50%", background: "var(--accent)", color: "#fff", display: "grid", placeItems: "center", fontSize: 18, fontWeight: 700 }}>
            {initials || <User className="h-6 w-6" />}
          </div>
          <div>
            <p style={{ fontSize: 20, fontWeight: 700, letterSpacing: "-.01em" }}>{user.name}</p>
            <p style={{ fontSize: 14, color: "var(--text2)" }}>{user.email}</p>
          </div>
        </div>
        <button className="chip" onClick={() => start(async () => { await logoutAction(); })} disabled={pending}>
          <LogOut className="h-4 w-4" /> {pending ? "Signing out…" : "Sign out"}
        </button>
      </div>

      {!user.emailVerified && <VerifyBanner />}

      {/* stats */}
      {orders.length > 0 && (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 12 }}>
          <Stat label="Orders" value={String(orders.length)} />
          <Stat label="Saved vs new" value={formatPrice(totalSaved)} accent />
          <Stat label="CO₂ avoided" value={`~${co2}kg`} accent />
        </div>
      )}

      {user.wholesaleApproved && (
        <Link href="/wholesale" className="note2" style={{ textDecoration: "none" }}>
          <Building2 className="h-5 w-5 shrink-0" style={{ color: "var(--accent)" }} />
          <span><b>Wholesale trade account active.</b> Live pricing and bulk ordering are unlocked on the wholesale portal.</span>
        </Link>
      )}

      {/* tabs */}
      <div style={{ display: "flex", gap: 9 }}>
        <button className={cn("chip", tab === "orders" && "on accent")} onClick={() => setTab("orders")}>Orders</button>
        <button className={cn("chip", tab === "tradeins" && "on accent")} onClick={() => setTab("tradeins")}>
          Trade-ins{tradeIns.length > 0 ? ` (${tradeIns.length})` : ""}
        </button>
        <button className={cn("chip", tab === "details" && "on accent")} onClick={() => setTab("details")}>Details</button>
      </div>

      {tab === "tradeins" ? (
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <RefreshCcw className="h-5 w-5" style={{ color: "var(--accent)" }} />
            <h3 style={{ fontSize: 18, fontWeight: 700 }}>Your trade-ins</h3>
            <span style={{ fontSize: 14, color: "var(--text3)" }}>({tradeIns.length})</span>
          </div>
          {tradeIns.length === 0 ? (
            <div className="scard-bord" style={{ border: "1px dashed var(--line)", padding: "48px 0", textAlign: "center" }}>
              <p style={{ color: "var(--text2)" }}>No trade-ins yet — your old phone is worth real money.</p>
              <div style={{ marginTop: 16 }}><Link className="btn" href="/trade-in">Get an instant quote</Link></div>
            </div>
          ) : (
            tradeIns.map((t) => <TradeInCard key={t.id} t={t} />)
          )}
        </div>
      ) : tab === "orders" ? (
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <Package className="h-5 w-5" style={{ color: "var(--accent)" }} />
            <h3 style={{ fontSize: 18, fontWeight: 700 }}>Order history</h3>
            <span style={{ fontSize: 14, color: "var(--text3)" }}>({orders.length})</span>
          </div>

          {orders.length === 0 ? (
            <div className="scard-bord" style={{ border: "1px dashed var(--line)", padding: "48px 0", textAlign: "center" }}>
              <p style={{ color: "var(--text2)" }}>No orders yet.</p>
              <div style={{ marginTop: 16 }}><Link className="btn" href="/shop">Start shopping</Link></div>
            </div>
          ) : (
            orders.map((o) => <OrderCard key={o.id} order={o} />)
          )}
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <ProfileEditor initial={profile} />
          <div className="scard-bord">
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8, color: "var(--accent)" }}>
              <CreditCard className="h-5 w-5" />
              <h3 style={{ fontSize: 16, fontWeight: 700, color: "var(--text)" }}>Payment method</h3>
            </div>
            <p style={{ fontSize: 14, color: "var(--text2)" }}>Visa •••• 4242 · Expires 09/29</p>
            <p style={{ fontSize: 12.5, color: "var(--text3)", marginTop: 8, display: "inline-flex", alignItems: "center", gap: 6 }}>
              <ShieldCheck className="h-3.5 w-3.5" /> Demo — entered fresh at checkout; nothing is stored.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

function Stat({ label, value, accent }: { label: string; value: string; accent?: boolean }) {
  return (
    <div className="scard-bord" style={{ padding: "16px 18px" }}>
      <div style={{ fontSize: 22, fontWeight: 700, letterSpacing: "-.02em", color: accent ? "var(--accent)" : "var(--text)" }}>{value}</div>
      <div style={{ fontSize: 12.5, color: "var(--text3)", marginTop: 2 }}>{label}</div>
    </div>
  );
}

function OrderCard({ order }: { order: DashOrder }) {
  const itemCount = order.lines.reduce((n, l) => n + l.qty, 0);
  const thumbs = order.lines.slice(0, 3);
  const names = order.lines.map((l) => l.name);
  const summary = names.length === 1 ? names[0] : `${names[0]} + ${names.length - 1} more`;

  return (
    <Link
      href={`/account/orders/${order.id}`}
      className="scard-bord block transition hover:border-[#0a8f6e]/40"
      style={{ textDecoration: "none", display: "block" }}
    >
      <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", justifyContent: "space-between", gap: 8 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <span style={{ fontWeight: 600 }}>{order.id}</span>
          <StatusChip delivered={order.delivered} label={order.statusLabel} />
        </div>
        <span style={{ fontSize: 12.5, color: "var(--text3)" }}>
          {new Date(order.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
        </span>
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: 14, marginTop: 14 }}>
        <div style={{ display: "flex", gap: 8, flex: "none" }}>
          {thumbs.map((l, i) => (
            <PhImg key={i} slug={l.slug} src={imageFor(l.slug, l.colorName)} label={l.name} className="oth" style={{ width: 46, height: 58, borderRadius: 8 }} />
          ))}
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 14.5, fontWeight: 600, lineHeight: 1.3 }}>{summary}</div>
          <div style={{ fontSize: 13, color: "var(--text2)", marginTop: 3, display: "inline-flex", alignItems: "center", gap: 6 }}>
            {order.delivered ? (
              <><CheckCircle2 className="h-4 w-4" style={{ color: "var(--accent)" }} /> Delivered</>
            ) : (
              <><Truck className="h-4 w-4" style={{ color: "var(--accent)" }} /> Arrives {order.etaLabel}</>
            )}
          </div>
        </div>
      </div>

      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: 14, paddingTop: 14, borderTop: "1px solid var(--line)" }}>
        <span style={{ fontSize: 13, color: "var(--text2)" }}>
          {itemCount} {itemCount === 1 ? "item" : "items"} · <b style={{ color: "var(--text)" }}>{formatPrice(order.total)}</b>
        </span>
        <span className="link" style={{ fontSize: 13.5, fontWeight: 600, display: "inline-flex", alignItems: "center", gap: 2 }}>
          Details &amp; tracking <ChevronRight className="h-4 w-4" />
        </span>
      </div>
    </Link>
  );
}

const TRADE_IN_STEPS = ["Submitted", "Received", "Inspected", "Paid"];

function TradeInCard({ t }: { t: MyTradeIn }) {
  const stepIdx = TRADE_IN_STEPS.indexOf(t.status);
  const terminal = ["Paid", "Returned", "Cancelled"].includes(t.status);
  return (
    <div className="scard-bord">
      <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", justifyContent: "space-between", gap: 8 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <span style={{ fontWeight: 600 }}>{t.id}</span>
          <span
            className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[12px] font-semibold"
            style={{
              background: t.status === "Paid" ? "rgba(10,143,110,.12)" : t.status === "Requoted" ? "#fff3e6" : "#eef3ff",
              color: t.status === "Paid" ? "var(--accent)" : t.status === "Requoted" ? "#9a5b00" : "#3257d6",
            }}
          >
            {t.status === "Paid" ? <CheckCircle2 className="h-3.5 w-3.5" /> : <RefreshCcw className="h-3.5 w-3.5" />} {t.status}
          </span>
        </div>
        <span style={{ fontSize: 12.5, color: "var(--text3)" }}>
          {new Date(t.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
        </span>
      </div>

      <p style={{ fontSize: 14.5, fontWeight: 600, marginTop: 12, lineHeight: 1.35 }}>{t.summary}</p>

      {/* progress: Submitted → Received → Inspected → Paid */}
      {stepIdx >= 0 && (
        <div style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 12 }}>
          {TRADE_IN_STEPS.map((s, i) => (
            <div key={s} style={{ display: "flex", alignItems: "center", gap: 6, flex: i < TRADE_IN_STEPS.length - 1 ? 1 : "none" }}>
              <span
                title={s}
                style={{
                  width: 9, height: 9, borderRadius: "50%", flex: "none",
                  background: i <= stepIdx ? "var(--accent)" : "var(--line)",
                }}
              />
              {i < TRADE_IN_STEPS.length - 1 && (
                <span style={{ height: 2, flex: 1, background: i < stepIdx ? "var(--accent)" : "var(--line)" }} />
              )}
            </div>
          ))}
        </div>
      )}
      {stepIdx >= 0 && (
        <div style={{ display: "flex", justifyContent: "space-between", marginTop: 5, fontSize: 11, color: "var(--text3)" }}>
          {TRADE_IN_STEPS.map((s) => (<span key={s}>{s}</span>))}
        </div>
      )}

      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: 14, paddingTop: 14, borderTop: "1px solid var(--line)" }}>
        <span style={{ fontSize: 13, color: "var(--text2)", display: "inline-flex", alignItems: "center", gap: 6 }}>
          <Banknote className="h-4 w-4" style={{ color: "var(--accent)" }} />
          {t.deviceCount} device{t.deviceCount === 1 ? "" : "s"} ·{" "}
          <b style={{ color: terminal && t.status !== "Paid" ? "var(--text)" : "var(--accent)" }}>{formatPrice(t.total)}</b>
          {" "}via {t.payoutMethod === "credit" ? "store credit" : t.payoutMethod === "bank" ? "bank transfer" : "PayPal"}
        </span>
        {t.status === "Submitted" && (
          <span style={{ fontSize: 12.5, color: "var(--text3)" }}>Ship within 7 days to hold your price</span>
        )}
      </div>
    </div>
  );
}

function StatusChip({ delivered, label }: { delivered: boolean; label: string }) {
  return (
    <span
      className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[12px] font-semibold"
      style={{ background: delivered ? "rgba(10,143,110,.12)" : "#eef3ff", color: delivered ? "var(--accent)" : "#3257d6" }}
    >
      {delivered ? <CheckCircle2 className="h-3.5 w-3.5" /> : <Truck className="h-3.5 w-3.5" />} {label}
    </span>
  );
}
