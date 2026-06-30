"use client";

import { use, useEffect, useState } from "react";
import Link from "next/link";
import { Leaf, Check } from "lucide-react";
import { useAccount, type Order } from "@/lib/account-store";
import { useCart } from "@/lib/cart-store";
import { confirmCheckout } from "@/lib/payment-actions";
import { GRADES } from "@/lib/grades";
import { formatPrice, formatPriceDecimal } from "@/lib/utils";
import { PhImg } from "@/components/home/PhImg";
import { imageFor } from "@/lib/products";

export default function OrderConfirmedPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const orders = useAccount((s) => s.orders);
  const clearCart = useCart((s) => s.clear);

  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  // Returning from Stripe Checkout (?session_id=…): the payment went through,
  // so empty the bag and re-verify/confirm the order server-side (best-effort —
  // the webhook is the source of truth).
  useEffect(() => {
    const sid = new URLSearchParams(window.location.search).get("session_id");
    if (!sid) return;
    clearCart();
    confirmCheckout(id, sid).catch(() => {});
  }, [id, clearCart]);

  if (!mounted) {
    return (
      <div className="shell-narrow" style={{ padding: "60px 22px" }}>
        <div style={{ height: 420, borderRadius: 18, background: "var(--gray)" }} />
      </div>
    );
  }

  const order = orders.find((o) => o.id === id);

  if (!order) {
    return (
      <div className="shell-narrow" style={{ padding: "80px 22px", textAlign: "center" }}>
        <h1 style={{ fontSize: 32, fontWeight: 700, letterSpacing: "-.02em" }}>
          We couldn&apos;t find that order
        </h1>
        <p style={{ marginTop: 12, color: "var(--text2)", fontSize: 17 }}>
          The order <b style={{ color: "var(--text)" }}>{id}</b> isn&apos;t in this browser. It may
          have been placed on another device.
        </p>
        <div style={{ marginTop: 28, display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
          <Link className="btn" href="/shop">
            Shop phones
          </Link>
          <Link className="btn btn-lt" href="/account">
            View your orders
          </Link>
        </div>
      </div>
    );
  }

  return <Confirmation order={order} />;
}

function Confirmation({ order }: { order: Order }) {
  const firstName = (order.shipTo?.split("\n")[0] ?? "there").split(" ")[0] || "there";
  const itemCount = order.lines.reduce((n, l) => n + l.qty, 0);
  const subtotal = order.subtotal ?? order.lines.reduce((s, l) => s + l.unit * l.qty, 0);
  const savings = order.savings ?? 0;
  const tax = order.tax ?? 0;
  const deliveryLabel = order.deliveryLabel ?? "Standard shipping";
  const isFreeDelivery = !/express/i.test(deliveryLabel);
  const deliveryCost = isFreeDelivery ? 0 : 15;
  const eta = order.deliveryEta ?? "soon";
  const co2 = order.co2kg ?? itemCount * 80;

  return (
    <>
      {/* ============ hero ============ */}
      <section style={hero}>
        <div className="orb" style={orb1} />
        <div className="orb" style={orb2} />
        <div style={heroin}>
          <div style={checkMedallion}>
            <Check className="h-8 w-8" style={{ color: "#fff" }} strokeWidth={3} />
          </div>
          <h1 style={htitle}>Order confirmed. Thank you, {firstName}.</h1>
          <p style={hsub}>
            Your certified devices are reserved and heading to inspection-clearance. A receipt is on
            its way to {order.email ?? "your inbox"}.
          </p>
          <div style={hmeta}>
            <Meta k="Order number" v={`#${order.id}`} />
            <Meta k="Estimated delivery" v={eta} accent />
            <Meta k="Total paid" v={formatPriceDecimal(order.total)} />
            <Meta k="Payment method" v={order.paymentLabel ?? "Card"} />
          </div>
        </div>
      </section>

      <div className="oc-grid">
        {/* ============ main ============ */}
        <div>
          {/* what happens next */}
          <section style={card}>
            <div style={cardh}>
              <Leaf className="h-[18px] w-[18px]" style={{ color: "var(--accent)" }} />
              What happens next
            </div>
            <div style={{ display: "flex", flexDirection: "column" }}>
              <TimelineStep
                done
                title="Order placed"
                desc="Payment confirmed and receipt emailed."
                time={`${order.dateLabel}`}
              />
              <TimelineStep
                now
                n="2"
                title="Final inspection & sanitization"
                desc="Each device gets a last 50-point check and a fresh factory wipe before it ships."
                time="In progress · ~24 hours"
              />
              <TimelineStep
                n="3"
                title="Packed & shipped"
                desc="Plastic-free packaging, carbon-neutral courier. Tracking link by email."
                time="Expected soon"
              />
              <TimelineStep
                n="4"
                last
                title="Delivered"
                desc="Set up in minutes — every phone arrives unlocked and ready."
                time={`Expected ${eta}`}
              />
            </div>
          </section>

          {/* your order */}
          <section style={card}>
            <div style={cardh}>
              Your order · {itemCount} {itemCount === 1 ? "item" : "items"}
            </div>
            {order.lines.map((l, idx) => (
              <div
                key={`${l.slug ?? l.name}-${idx}`}
                style={{
                  display: "flex",
                  gap: 15,
                  padding: idx === 0 ? "2px 0 16px" : "16px 0",
                  borderTop: idx === 0 ? "none" : "1px solid var(--line)",
                }}
              >
                <PhImg slug={l.slug} src={imageFor(l.slug, l.colorName)} label={l.name} className="iimg" style={iimg} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={iname}>
                    {l.name}
                    {l.grade && <span style={igrade}>{GRADES[l.grade].label}</span>}
                  </div>
                  <div style={ispecs}>
                    <Spec>{l.colorName}</Spec>
                    <Spec>{l.gb >= 1024 ? "1TB" : `${l.gb}GB`}</Spec>
                    <Spec>80%+ battery</Spec>
                    <Spec>Unlocked</Spec>
                  </div>
                  <div style={{ fontSize: 12, color: "var(--accent)", marginTop: 8 }}>
                    ✓ Free charger included in the box
                  </div>
                </div>
                <div style={{ textAlign: "right", flex: "none" }}>
                  <div style={{ fontSize: 16, fontWeight: 700 }}>{formatPrice(l.unit * l.qty)}</div>
                  <div style={{ fontSize: 12, color: "var(--text3)", marginTop: 2 }}>Qty {l.qty}</div>
                </div>
              </div>
            ))}
          </section>

          {/* delivery & billing */}
          <section style={card}>
            <div style={cardh}>Delivery &amp; billing</div>
            <div className="oc-addgrid">
              <div>
                <h4 style={addh4}>Shipping to</h4>
                <p style={addp}>
                  {(order.shipTo ?? "—").split("\n").map((line, i) => (
                    <span key={i}>
                      {i === 0 ? <b style={{ color: "var(--text)", fontWeight: 600 }}>{line}</b> : line}
                      <br />
                    </span>
                  ))}
                </p>
              </div>
              <div>
                <h4 style={addh4}>Delivery method</h4>
                <p style={addp}>
                  <b style={{ color: "var(--text)", fontWeight: 600 }}>{deliveryLabel}</b>
                  <br />
                  {isFreeDelivery ? "Free · fully offset" : `${formatPrice(deliveryCost)} · express`}
                  <br />
                  Arrives {eta}
                  <br />
                  Tracking sent by email
                </p>
              </div>
            </div>
          </section>
        </div>

        {/* ============ summary ============ */}
        <aside>
          <div className="oc-summary">
            <div style={sumh}>Payment summary</div>
            <div style={{ padding: "16px 22px" }}>
              <SumRow label={`Subtotal · ${itemCount} ${itemCount === 1 ? "item" : "items"}`} value={<b style={{ color: "var(--text)" }}>{formatPriceDecimal(subtotal)}</b>} />
              <SumRow label="You saved" value={<b style={{ color: "var(--accent)" }}>−{formatPrice(savings)}</b>} />
              <SumRow
                label="Delivery"
                value={
                  deliveryCost === 0 ? (
                    <b style={{ color: "var(--accent)" }}>Free</b>
                  ) : (
                    <b style={{ color: "var(--text)" }}>{formatPrice(deliveryCost)}</b>
                  )
                }
              />
              <SumRow label="Estimated tax" value={<b style={{ color: "var(--text)" }}>{formatPriceDecimal(tax)}</b>} />
              <div style={sumtotalRow}>
                <span style={{ fontSize: 15, fontWeight: 600 }}>Total paid</span>
                <span style={{ fontSize: 24, fontWeight: 700, letterSpacing: "-.02em" }}>
                  {formatPriceDecimal(order.total)}
                </span>
              </div>
            </div>

            <div style={ecocard}>
              <div style={{ display: "flex", alignItems: "center", gap: 11 }}>
                <span style={{ fontSize: 21, fontWeight: 700, color: "var(--accent)" }}>~{co2}kg</span>
                <span style={{ fontSize: 12, color: "var(--text2)", lineHeight: 1.3 }}>
                  of CO₂ kept out of the air by choosing refurbished over new.
                </span>
              </div>
              <div style={ecotree}>
                <Leaf className="h-4 w-4" style={{ color: "var(--accent)" }} />A tree has been planted
                in your name.
              </div>
            </div>

            <div style={{ padding: "0 22px 20px", display: "flex", flexDirection: "column", gap: 10 }}>
              <Link className="btn" href="/account" style={{ width: "100%", borderRadius: 13 }}>
                Track my order
              </Link>
              <Link className="btn btn-lt" href="/shop" style={{ width: "100%", borderRadius: 13 }}>
                Continue shopping
              </Link>
            </div>
          </div>
        </aside>
      </div>

      <div style={{ maxWidth: 1000, margin: "0 auto", padding: "8px 24px 0", textAlign: "center" }}>
        <p style={{ fontSize: 13.5, color: "var(--text3)" }}>
          Need to change something? You can edit or cancel within 1 hour — <Link className="link" href="/help" style={{ fontSize: 13.5 }}>contact support</Link>.
        </p>
      </div>
    </>
  );
}

/* ============================ sub-components ============================ */

function Meta({ k, v, accent }: { k: string; v: string; accent?: boolean }) {
  return (
    <div style={{ textAlign: "left" }}>
      <div style={{ fontSize: 11, color: "var(--text3)", fontWeight: 600, letterSpacing: ".04em", textTransform: "uppercase" }}>
        {k}
      </div>
      <div style={{ fontSize: 15, fontWeight: 600, marginTop: 2, color: accent ? "var(--accent)" : "var(--text)" }}>
        {v}
      </div>
    </div>
  );
}

function TimelineStep({
  done,
  now,
  n,
  last,
  title,
  desc,
  time,
}: {
  done?: boolean;
  now?: boolean;
  n?: string;
  last?: boolean;
  title: string;
  desc: string;
  time: string;
}) {
  return (
    <div style={{ display: "flex", gap: 15, position: "relative", paddingBottom: last ? 0 : 26 }}>
      {!last && (
        <span
          style={{
            content: "''",
            position: "absolute",
            left: 13,
            top: 28,
            bottom: 0,
            width: 2,
            background: done ? "var(--accent)" : "var(--line)",
          }}
        />
      )}
      <span
        style={{
          width: 28,
          height: 28,
          borderRadius: "50%",
          border: `2px solid ${done || now ? "var(--accent)" : "var(--line)"}`,
          background: done ? "var(--accent)" : "#fff",
          flex: "none",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: 13,
          color: done ? "#fff" : now ? "var(--accent)" : "var(--text3)",
          zIndex: 1,
        }}
      >
        {done ? <Check className="h-3.5 w-3.5" strokeWidth={2.4} /> : n}
      </span>
      <div>
        <div style={{ fontSize: 15, fontWeight: 600, color: now ? "var(--accent)" : "var(--text)" }}>
          {title}
        </div>
        <div style={{ fontSize: 13, color: "var(--text3)", marginTop: 3 }}>{desc}</div>
        <div style={{ fontSize: 12.5, color: "var(--text2)", marginTop: 3, fontWeight: 500 }}>{time}</div>
      </div>
    </div>
  );
}

function Spec({ children }: { children: React.ReactNode }) {
  return (
    <span style={{ fontSize: 12, color: "var(--text2)", background: "var(--gray)", padding: "3px 9px", borderRadius: 7 }}>
      {children}
    </span>
  );
}

function SumRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between", fontSize: 14, padding: "6px 0", color: "var(--text2)" }}>
      <span>{label}</span>
      {value}
    </div>
  );
}

/* ============================ inline style tokens ============================ */

const hero: React.CSSProperties = {
  position: "relative",
  overflow: "hidden",
  isolation: "isolate",
  background: "linear-gradient(180deg,#edf6f0,#ffffff)",
  borderBottom: "1px solid var(--line)",
};
const orb1: React.CSSProperties = {
  width: 380,
  height: 380,
  background: "radial-gradient(circle,rgba(10,143,110,.16),transparent 67%)",
  top: -140,
  left: -90,
  zIndex: 0,
};
const orb2: React.CSSProperties = {
  width: 320,
  height: 320,
  background: "radial-gradient(circle,rgba(38,165,168,.14),transparent 67%)",
  top: -80,
  right: -80,
  zIndex: 0,
};
const heroin: React.CSSProperties = {
  maxWidth: 1000,
  margin: "0 auto",
  padding: "56px 24px 48px",
  textAlign: "center",
  position: "relative",
  zIndex: 1,
};
const checkMedallion: React.CSSProperties = {
  width: 74,
  height: 74,
  borderRadius: "50%",
  background: "var(--accent)",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  margin: "0 auto 22px",
  boxShadow: "0 12px 30px rgba(10,143,110,.32)",
};
const htitle: React.CSSProperties = {
  fontSize: "clamp(28px,4vw,42px)",
  fontWeight: 700,
  letterSpacing: "-.025em",
  lineHeight: 1.08,
};
const hsub: React.CSSProperties = {
  fontSize: 17,
  color: "var(--text2)",
  marginTop: 12,
  maxWidth: 540,
  marginLeft: "auto",
  marginRight: "auto",
  lineHeight: 1.5,
};
const hmeta: React.CSSProperties = {
  display: "inline-flex",
  flexWrap: "wrap",
  gap: "10px 26px",
  justifyContent: "center",
  marginTop: 22,
  background: "#fff",
  border: "1px solid var(--line)",
  borderRadius: 14,
  padding: "15px 24px",
  boxShadow: "0 6px 20px rgba(20,60,45,.06)",
};
const card: React.CSSProperties = {
  border: "1px solid var(--line)",
  borderRadius: 18,
  padding: "24px 26px",
  marginBottom: 18,
};
const cardh: React.CSSProperties = {
  fontSize: 17,
  fontWeight: 700,
  letterSpacing: "-.01em",
  marginBottom: 18,
  display: "flex",
  alignItems: "center",
  gap: 10,
};
const iimg: React.CSSProperties = { width: 60, height: 78, borderRadius: 10, flex: "none" };
const iname: React.CSSProperties = {
  fontSize: 15,
  fontWeight: 600,
  display: "flex",
  alignItems: "center",
  gap: 8,
  flexWrap: "wrap",
};
const igrade: React.CSSProperties = {
  fontSize: 11,
  fontWeight: 600,
  color: "var(--accent)",
  background: "rgba(10,143,110,.1)",
  padding: "2px 9px",
  borderRadius: 980,
};
const ispecs: React.CSSProperties = { display: "flex", flexWrap: "wrap", gap: 6, marginTop: 7 };
const addh4: React.CSSProperties = {
  fontSize: 12,
  fontWeight: 600,
  color: "var(--text3)",
  letterSpacing: ".04em",
  textTransform: "uppercase",
  marginBottom: 8,
};
const addp: React.CSSProperties = { fontSize: 14, color: "var(--text2)", lineHeight: 1.5 };
const sumh: React.CSSProperties = {
  padding: "18px 22px",
  borderBottom: "1px solid var(--line)",
  fontSize: 15,
  fontWeight: 700,
};
const sumtotalRow: React.CSSProperties = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "baseline",
  marginTop: 12,
  paddingTop: 14,
  borderTop: "1px solid var(--line)",
};
const ecocard: React.CSSProperties = {
  margin: "0 22px 18px",
  background: "#edf6f0",
  border: "1px solid #d6e9df",
  borderRadius: 13,
  padding: "14px 16px",
};
const ecotree: React.CSSProperties = {
  fontSize: 12.5,
  color: "var(--text)",
  marginTop: 10,
  paddingTop: 10,
  borderTop: "1px solid #d6e9df",
  display: "flex",
  alignItems: "center",
  gap: 8,
};
