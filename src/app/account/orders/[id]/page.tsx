import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { Check, Package, Truck, MapPin, CreditCard, Leaf, ArrowLeft, Copy } from "lucide-react";
import { auth, isAuthConfigured } from "@/lib/auth";
import { getMyOrder } from "@/lib/orders";
import { computeTracking, fmtDay } from "@/lib/tracking";
import { GRADES } from "@/lib/grades";
import { imageFor } from "@/lib/products";
import { formatPrice, formatPriceDecimal } from "@/lib/utils";
import { PhImg } from "@/components/home/PhImg";
import { AuthNotConfigured } from "@/components/auth/AuthNotConfigured";

export const metadata: Metadata = { title: "Order details" };

export default async function OrderDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  if (!isAuthConfigured()) {
    return (
      <section className="sec" style={{ paddingTop: 56 }}>
        <div className="shell-narrow">
          <AuthNotConfigured />
        </div>
      </section>
    );
  }

  const session = await auth();
  if (!session?.user) redirect(`/login?callbackUrl=/account/orders/${id}`);

  const order = await getMyOrder(id);
  if (!order) {
    return (
      <div className="shell-narrow" style={{ padding: "80px 22px", textAlign: "center" }}>
        <h1 style={{ fontSize: 30, fontWeight: 700, letterSpacing: "-.02em" }}>Order not found</h1>
        <p style={{ marginTop: 12, color: "var(--text2)", fontSize: 17 }}>
          We couldn&apos;t find order <b style={{ color: "var(--text)" }}>{id}</b> on your account.
        </p>
        <div style={{ marginTop: 24 }}>
          <Link className="btn" href="/account">Back to your orders</Link>
        </div>
      </div>
    );
  }

  const t = computeTracking({
    placedAtISO: order.createdAt,
    etaISO: order.etaISO,
    express: order.express,
    nowISO: new Date().toISOString(),
  });
  const itemCount = order.lines.reduce((n, l) => n + l.qty, 0);
  const subtotal = order.subtotal ?? order.lines.reduce((s, l) => s + l.unit * l.qty, 0);
  const deliveryCost = order.express ? 15 : 0;

  return (
    <div className="shell" style={{ maxWidth: 1080, padding: "26px 22px 60px" }}>
      <Link className="link" href="/account" style={{ fontSize: 14, display: "inline-flex", gap: 5, alignItems: "center" }}>
        <ArrowLeft className="h-4 w-4" /> Your orders
      </Link>

      {/* header */}
      <div className="mt-3 flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 style={{ fontSize: "clamp(24px,4vw,32px)", fontWeight: 700, letterSpacing: "-.02em" }}>
            Order {order.id}
          </h1>
          <p style={{ color: "var(--text2)", fontSize: 14.5, marginTop: 4 }}>
            Placed {new Date(order.createdAt).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })} · {itemCount} {itemCount === 1 ? "item" : "items"}
          </p>
        </div>
        <span
          className="inline-flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-[13.5px] font-semibold"
          style={{ background: t.delivered ? "rgba(10,143,110,.12)" : "#eef3ff", color: t.delivered ? "var(--accent)" : "#3257d6" }}
        >
          {t.delivered ? <Check className="h-4 w-4" /> : <Truck className="h-4 w-4" />} {t.statusLabel}
        </span>
      </div>

      <div className="mt-7 grid items-start gap-7 lg:grid-cols-[minmax(0,1fr)_320px]">
        {/* ============ left ============ */}
        <div className="flex flex-col gap-5">
          {/* tracking */}
          <section className="scard-bord">
            <div className="flex flex-wrap items-center justify-between gap-2" style={{ marginBottom: 18 }}>
              <h2 style={{ fontSize: 17, fontWeight: 700 }}>Tracking</h2>
              {!t.delivered && (
                <span style={{ fontSize: 13.5, color: "var(--text2)" }}>
                  Estimated delivery <b style={{ color: "var(--text)" }}>{t.etaLabel}</b>
                </span>
              )}
            </div>

            {/* progress bar */}
            <div style={{ height: 6, borderRadius: 6, background: "var(--gray)", overflow: "hidden", marginBottom: 22 }}>
              <div style={{ height: "100%", width: `${t.percent}%`, background: "var(--accent)", borderRadius: 6 }} />
            </div>

            <div style={{ display: "flex", flexDirection: "column" }}>
              {t.steps.map((s, i) => {
                const filled = s.done || (s.current && t.delivered);
                const active = s.current && !t.delivered;
                return (
                  <div key={s.key} style={{ display: "flex", gap: 14, position: "relative", paddingBottom: i === t.steps.length - 1 ? 0 : 24 }}>
                    {i !== t.steps.length - 1 && (
                      <span style={{ position: "absolute", left: 13, top: 28, bottom: 0, width: 2, background: s.done ? "var(--accent)" : "var(--line)" }} />
                    )}
                    <span
                      style={{
                        width: 28, height: 28, borderRadius: "50%", flex: "none", zIndex: 1,
                        display: "flex", alignItems: "center", justifyContent: "center",
                        border: `2px solid ${filled || active ? "var(--accent)" : "var(--line)"}`,
                        background: filled ? "var(--accent)" : "#fff",
                        color: filled ? "#fff" : active ? "var(--accent)" : "var(--text3)",
                      }}
                    >
                      {filled ? <Check className="h-3.5 w-3.5" strokeWidth={2.5} /> : active ? <span style={{ width: 8, height: 8, borderRadius: "50%", background: "var(--accent)" }} /> : <span style={{ width: 7, height: 7, borderRadius: "50%", background: "var(--line)" }} />}
                    </span>
                    <div style={{ flex: 1 }}>
                      <div style={{ display: "flex", justifyContent: "space-between", gap: 10, flexWrap: "wrap" }}>
                        <span style={{ fontSize: 15, fontWeight: 600, color: active ? "var(--accent)" : "var(--text)" }}>{s.label}</span>
                        <span style={{ fontSize: 12.5, color: "var(--text3)", fontWeight: 500 }}>
                          {filled ? fmtDay(s.at) : `Est. ${fmtDay(s.at)}`}
                        </span>
                      </div>
                      <p style={{ fontSize: 13, color: "var(--text3)", marginTop: 3 }}>{s.desc}</p>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* carrier */}
            {order.trackingNumber && (
              <div className="mt-1 flex flex-wrap items-center justify-between gap-2 rounded-xl" style={{ background: "var(--gray)", padding: "12px 15px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <Truck className="h-[18px] w-[18px]" style={{ color: "var(--accent)" }} />
                  <div>
                    <div style={{ fontSize: 13.5, fontWeight: 600 }}>{order.carrier ?? "Carrier"}</div>
                    <div style={{ fontSize: 12.5, color: "var(--text2)", fontFamily: "ui-monospace, monospace" }}>{order.trackingNumber}</div>
                  </div>
                </div>
                <span style={{ fontSize: 12, color: "var(--text3)", display: "inline-flex", alignItems: "center", gap: 5 }}>
                  <Copy className="h-3.5 w-3.5" /> demo tracking #
                </span>
              </div>
            )}
          </section>

          {/* items */}
          <section className="scard-bord">
            <h2 style={{ fontSize: 17, fontWeight: 700, marginBottom: 14, display: "flex", alignItems: "center", gap: 8 }}>
              <Package className="h-5 w-5" style={{ color: "var(--accent)" }} /> Items
            </h2>
            {order.lines.map((l, idx) => (
              <div key={`${l.slug ?? l.name}-${idx}`} style={{ display: "flex", gap: 14, padding: idx === 0 ? "2px 0 16px" : "16px 0", borderTop: idx === 0 ? "none" : "1px solid var(--line)" }}>
                {l.slug ? (
                  <Link href={`/product/${l.slug}`} style={{ flex: "none" }}>
                    <PhImg slug={l.slug} src={imageFor(l.slug, l.colorName)} label={l.name} className="oimg" style={{ width: 58, height: 74, borderRadius: 10 }} />
                  </Link>
                ) : (
                  <PhImg slug={l.slug} src={imageFor(l.slug, l.colorName)} label={l.name} className="oimg" style={{ width: 58, height: 74, borderRadius: 10, flex: "none" }} />
                )}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 15, fontWeight: 600, display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
                    {l.slug ? <Link href={`/product/${l.slug}`}>{l.name}</Link> : l.name}
                    {l.grade && <span style={{ fontSize: 11, fontWeight: 600, color: "var(--accent)", background: "rgba(10,143,110,.1)", padding: "2px 9px", borderRadius: 980 }}>{GRADES[l.grade].label}</span>}
                  </div>
                  <div style={{ fontSize: 13, color: "var(--text2)", marginTop: 5 }}>
                    {l.colorName} · {l.gb >= 1024 ? "1TB" : `${l.gb}GB`} · Qty {l.qty}
                    {l.mode === "wholesale" && <span style={{ color: "var(--accent)" }}> · wholesale</span>}
                  </div>
                  {l.slug && (
                    <Link className="link" href={`/product/${l.slug}`} style={{ fontSize: 13, marginTop: 6, display: "inline-block" }}>
                      Buy again
                    </Link>
                  )}
                </div>
                <div style={{ textAlign: "right", flex: "none", fontSize: 15, fontWeight: 700 }}>{formatPrice(l.unit * l.qty)}</div>
              </div>
            ))}
          </section>

          {/* addresses */}
          <section className="scard-bord">
            <div className="grid gap-5 sm:grid-cols-2">
              <div>
                <h3 style={subhead}><MapPin className="h-4 w-4" /> Shipping to</h3>
                <p style={addrp}>
                  {(order.shipTo ?? "—").split("\n").map((line, i) => (
                    <span key={i}>{i === 0 ? <b style={{ color: "var(--text)" }}>{line}</b> : line}<br /></span>
                  ))}
                </p>
              </div>
              <div>
                <h3 style={subhead}><Truck className="h-4 w-4" /> Delivery</h3>
                <p style={addrp}>
                  <b style={{ color: "var(--text)" }}>{order.deliveryLabel ?? "Standard shipping"}</b><br />
                  {order.express ? "Express" : "Free · fully offset"}<br />
                  {t.delivered ? "Delivered" : `Arrives ${t.etaLabel}`}
                </p>
                <h3 style={{ ...subhead, marginTop: 16 }}><CreditCard className="h-4 w-4" /> Payment</h3>
                <p style={addrp}><b style={{ color: "var(--text)" }}>{order.paymentLabel ?? "Card"}</b></p>
              </div>
            </div>
          </section>
        </div>

        {/* ============ right summary ============ */}
        <aside className="scard-bord lg:sticky lg:top-24">
          <h2 style={{ fontSize: 16, fontWeight: 700, marginBottom: 14 }}>Payment summary</h2>
          <Row label={`Subtotal · ${itemCount} ${itemCount === 1 ? "item" : "items"}`} value={formatPriceDecimal(subtotal)} />
          {order.savings ? <Row label="You saved" value={`−${formatPrice(order.savings)}`} accent /> : null}
          <Row label="Delivery" value={deliveryCost === 0 ? "Free" : formatPrice(deliveryCost)} accent={deliveryCost === 0} />
          <Row label="Estimated tax" value={formatPriceDecimal(order.tax ?? 0)} />
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginTop: 12, paddingTop: 14, borderTop: "1px solid var(--line)" }}>
            <span style={{ fontSize: 15, fontWeight: 600 }}>Total</span>
            <span style={{ fontSize: 22, fontWeight: 700, letterSpacing: "-.02em" }}>{formatPriceDecimal(order.total)}</span>
          </div>

          {order.co2kg ? (
            <div className="mt-4 rounded-xl" style={{ background: "#edf6f0", border: "1px solid #d6e9df", padding: "12px 14px", display: "flex", gap: 10, alignItems: "center" }}>
              <Leaf className="h-5 w-5 shrink-0" style={{ color: "var(--accent)" }} />
              <span style={{ fontSize: 12.5, color: "var(--text2)", lineHeight: 1.35 }}>
                <b style={{ color: "var(--accent)" }}>~{order.co2kg}kg</b> of CO₂ saved vs new — and a tree planted.
              </span>
            </div>
          ) : null}

          <div className="mt-4 flex flex-col gap-2">
            <Link className="btn btn-lt" href="/help" style={{ width: "100%", borderRadius: 12 }}>Get help with this order</Link>
          </div>
        </aside>
      </div>
    </div>
  );
}

const subhead: React.CSSProperties = {
  fontSize: 12, fontWeight: 600, color: "var(--text3)", letterSpacing: ".04em",
  textTransform: "uppercase", marginBottom: 8, display: "flex", alignItems: "center", gap: 6,
};
const addrp: React.CSSProperties = { fontSize: 14, color: "var(--text2)", lineHeight: 1.55 };

function Row({ label, value, accent }: { label: string; value: string; accent?: boolean }) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between", fontSize: 14, padding: "5px 0", color: "var(--text2)" }}>
      <span>{label}</span>
      <b style={{ color: accent ? "var(--accent)" : "var(--text)" }}>{value}</b>
    </div>
  );
}
