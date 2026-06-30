"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Minus, Plus, Leaf, Lock, ShoppingBag, ChevronDown, Check } from "lucide-react";
import {
  useCart,
  lineUnitPrice,
  lineTotal,
  cartSubtotal,
  cartCount,
  itemKey,
  type CartItem,
} from "@/lib/cart-store";
import { useAccount } from "@/lib/account-store";
import { useSession } from "next-auth/react";
import { placeOrderAction } from "@/lib/order-actions";
import { makeShipment } from "@/lib/tracking";
import { deliveryWindow, EXPRESS_FEE } from "@/lib/delivery";
import { imageFor } from "@/lib/products";

export interface AddressPrefill {
  fullName?: string;
  line1?: string;
  city?: string;
  state?: string;
  zip?: string;
}
import { GRADES } from "@/lib/grades";
import { formatPrice, formatPriceDecimal } from "@/lib/utils";
import { PhImg } from "@/components/home/PhImg";

const US_STATES = [
  "AL", "AK", "AZ", "AR", "CA", "CO", "CT", "DE", "FL", "GA", "HI", "ID", "IL",
  "IN", "IA", "KS", "KY", "LA", "ME", "MD", "MA", "MI", "MN", "MS", "MO", "MT",
  "NE", "NV", "NH", "NJ", "NM", "NY", "NC", "ND", "OH", "OK", "OR", "PA", "RI",
  "SC", "SD", "TN", "TX", "UT", "VT", "VA", "WA", "WV", "WI", "WY",
];

type DeliveryId = "free" | "next";
type PayId = "card" | "apple" | "paypal";

/** Friendly date helper, e.g. "Wed, Jul 1". */
function fmtDate(d: Date): string {
  return d.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" });
}
/** Short date e.g. "Jul 1" for the per-line shipping note. */
function fmtShort(d: Date): string {
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

export function CartClient({ initialProfile }: { initialProfile?: AddressPrefill | null } = {}) {
  const items = useCart((s) => s.items);
  const setQty = useCart((s) => s.setQty);
  const remove = useCart((s) => s.remove);
  const clear = useCart((s) => s.clear);
  const addOrder = useAccount((s) => s.addOrder);
  const router = useRouter();
  const { data: session } = useSession();

  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  // ---- demo-only checkout state ----
  const [first, setFirst] = useState("");
  const [last, setLast] = useState("");
  const [email, setEmail] = useState("");
  const [street, setStreet] = useState("");
  const [city, setCity] = useState("");
  const [stateCode, setStateCode] = useState("");
  const [zip, setZip] = useState("");
  const [sameBilling, setSameBilling] = useState(true);
  const [delivery, setDelivery] = useState<DeliveryId>("free");
  const [pay, setPay] = useState<PayId>("card");

  // Prefill shipping from the signed-in account (only into empty fields).
  useEffect(() => {
    const u = session?.user;
    if (!u) return;
    if (u.email) setEmail((v) => v || u.email!);
    if (u.name) {
      const [f, ...rest] = u.name.split(" ");
      setFirst((v) => v || f || "");
      setLast((v) => v || rest.join(" "));
    }
  }, [session]);

  // Prefill the saved shipping address (account → Details).
  useEffect(() => {
    if (!initialProfile) return;
    if (initialProfile.fullName) {
      const [f, ...rest] = initialProfile.fullName.split(" ");
      setFirst((v) => v || f || "");
      setLast((v) => v || rest.join(" "));
    }
    if (initialProfile.line1) setStreet((v) => v || initialProfile.line1!);
    if (initialProfile.city) setCity((v) => v || initialProfile.city!);
    if (initialProfile.state) setStateCode((v) => v || initialProfile.state!);
    if (initialProfile.zip) setZip((v) => v || initialProfile.zip!);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ---- dates (stable after mount) ----
  const { etaFree, etaNext, freeRange, nextRange } = useMemo(() => {
    const wf = deliveryWindow(false);
    const wn = deliveryWindow(true);
    return {
      etaFree: new Date(wf.maxISO),
      etaNext: new Date(wn.maxISO),
      freeRange: wf.rangeLabel,
      nextRange: wn.rangeLabel,
    };
  }, []);
  const etaDate = delivery === "next" ? etaNext : etaFree;

  // ---- pricing ----
  const subtotal = cartSubtotal(items);
  const retailSum = items.reduce(
    (sum, i) => sum + (i.original && i.original > 0 ? i.original : lineUnitPrice(i)) * i.qty,
    0,
  );
  const savings = Math.max(0, retailSum - subtotal);
  const count = cartCount(items);
  const deliveryCost = delivery === "next" ? EXPRESS_FEE : 0;
  const tax = Math.round((subtotal + deliveryCost) * 0.0825);
  const total = subtotal + deliveryCost + tax;
  const co2 = count * 80;
  const savePct = retailSum > 0 ? Math.round((savings / retailSum) * 100) : 0;

  async function placeOrder() {
    const id = "RM-" + Math.floor(100000 + Math.random() * 899999);
    const now = new Date();
    const deliveryLabel = delivery === "next" ? "2-day express" : "Standard shipping";
    const paymentLabel =
      pay === "apple" ? "Apple Pay" : pay === "paypal" ? "PayPal" : "Visa ···· 4242";
    const shipTo = [
      `${first || "Alex"} ${last || "Rivera"}`.trim(),
      street || "1 Market Street",
      `${city || "San Francisco"}, ${stateCode || "CA"} ${zip || "94105"}`,
      "United States",
    ].join("\n");
    const dateLabel = now.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
    const emailVal = email || "alex@email.com";
    const lines = items.map((i) => ({
      name: i.name,
      qty: i.qty,
      gb: i.gb,
      colorName: i.colorName,
      mode: i.mode,
      unit: lineUnitPrice(i),
      slug: i.slug,
      colorHex: i.colorHex,
      grade: i.grade,
      original: i.original,
    }));
    const express = delivery === "next";
    const seed = parseInt(id.replace(/\D/g, ""), 10) || 1;
    const { carrier, trackingNumber } = makeShipment(express, seed);
    const snapshot = {
      lines,
      dateLabel,
      email: emailVal,
      shipTo,
      deliveryLabel,
      deliveryEta: fmtDate(etaDate),
      paymentLabel,
      subtotal,
      savings,
      tax,
      co2kg: co2,
      express,
      etaISO: etaDate.toISOString(),
      carrier,
      trackingNumber,
    };

    // Local copy powers the receipt page (and guest history).
    addOrder({ id, total, status: "Confirmed", ...snapshot });

    // Persist to the account for signed-in users (best-effort).
    try {
      await placeOrderAction({ id, total, status: "Confirmed", email: emailVal, data: snapshot });
    } catch {
      /* ignore — receipt still works from the local copy */
    }

    clear();
    router.push(`/order-confirmed/${id}`);
  }

  // ---- loading skeleton (avoids hydration mismatch on persisted store) ----
  if (!mounted) {
    return (
      <div className="shell" style={{ padding: "30px 22px 0" }}>
        <div className="co-grid">
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            {[0, 1].map((i) => (
              <div key={i} style={{ height: 150, borderRadius: 18, background: "var(--gray)" }} />
            ))}
          </div>
          <div style={{ height: 320, borderRadius: 18, border: "1px solid var(--line)" }} />
        </div>
      </div>
    );
  }

  const empty = items.length === 0;
  const stepDetails = empty ? "todo" : "now";

  return (
    <div className="shell" style={{ maxWidth: 1080, padding: "8px 22px 0" }}>
      {/* step tracker */}
      <div className="co-steps">
        <Step n="✓" label="Bag" state={empty ? "now" : "done"} />
        <StepBar />
        <Step n="2" label="Details" state={stepDetails} />
        <StepBar />
        <Step n="3" label="Payment" state="todo" />
        <StepBar />
        <Step n="4" label="Done" state="todo" />
        <span style={{ marginLeft: "auto", fontSize: 12, color: "var(--text3)", display: "inline-flex", alignItems: "center", gap: 6 }}>
          <Lock className="h-3 w-3" /> Secure
        </span>
      </div>

      <div className="co-grid">
        {/* ============ main column ============ */}
        <div>
          {/* 1 · Your bag */}
          <section style={card}>
            <div style={cardh}>
              <span style={blkn}>1</span>
              Your bag · {count} {count === 1 ? "item" : "items"}
            </div>

            {empty ? (
              <div style={{ padding: "36px 0", textAlign: "center", color: "var(--text2)" }}>
                <ShoppingBag className="mx-auto h-9 w-9" style={{ color: "var(--text3)" }} />
                <b style={{ display: "block", fontSize: 17, color: "var(--text)", margin: "12px 0 5px" }}>
                  Your bag is empty.
                </b>
                Browse certified devices and give one a second life.
                <div style={{ marginTop: 18 }}>
                  <Link className="btn" href="/shop">
                    Shop phones
                  </Link>
                </div>
              </div>
            ) : (
              <>
                {items.map((item, idx) => (
                  <BagLine
                    key={itemKey(item)}
                    item={item}
                    first={idx === 0}
                    eta={fmtShort(etaFree)}
                    onDec={() => setQty(itemKey(item), item.qty - 1)}
                    onInc={() => setQty(itemKey(item), item.qty + 1)}
                    onRemove={() => remove(itemKey(item))}
                  />
                ))}
                <div style={benstrip}>
                  <Benefit>50-point inspection</Benefit>
                  <Benefit>Free charger in the box</Benefit>
                  <Benefit>30-day returns</Benefit>
                  <Benefit>Data wiped to factory standard</Benefit>
                </div>
              </>
            )}
          </section>

          {/* 2 · Shipping details */}
          <section style={card}>
            <div style={cardh}>
              <span style={blkn}>2</span>
              Shipping details
            </div>
            <p style={cardsub}>Where should we send your order?</p>

            <div style={frow}>
              <Field label="First name">
                <input className="inpt" aria-label="First name" placeholder="Alex" value={first} onChange={(e) => setFirst(e.target.value)} />
              </Field>
              <Field label="Last name">
                <input className="inpt" aria-label="Last name" placeholder="Rivera" value={last} onChange={(e) => setLast(e.target.value)} />
              </Field>
            </div>
            <Field label="Email">
              <input className="inpt" type="email" aria-label="Email" placeholder="alex@email.com" value={email} onChange={(e) => setEmail(e.target.value)} />
            </Field>
            <Field label="Street address">
              <input className="inpt" aria-label="Street address" placeholder="1 Market Street" value={street} onChange={(e) => setStreet(e.target.value)} />
            </Field>
            <div className="co-frow3">
              <Field label="City">
                <input className="inpt" aria-label="City" placeholder="San Francisco" value={city} onChange={(e) => setCity(e.target.value)} />
              </Field>
              <Field label="State">
                <StateSelect value={stateCode} onChange={setStateCode} />
              </Field>
              <Field label="ZIP">
                <input className="inpt" aria-label="ZIP" placeholder="94105" value={zip} onChange={(e) => setZip(e.target.value)} />
              </Field>
            </div>

            <label style={chkrow}>
              <input
                type="checkbox"
                checked={sameBilling}
                onChange={(e) => setSameBilling(e.target.checked)}
                style={{ position: "absolute", opacity: 0, width: 1, height: 1 }}
                aria-label="Billing address same as shipping"
              />
              <span style={{ ...fbox, ...(sameBilling ? boxFilled : null) }}>
                {sameBilling && <Check className="h-3 w-3" />}
              </span>
              Billing address same as shipping
            </label>

            {!sameBilling && (
              <div style={{ marginTop: 14 }}>
                <Field label="Billing address">
                  <input className="inpt" aria-label="Billing address" placeholder="1 Market Street" />
                </Field>
                <div className="co-frow3">
                  <Field label="City">
                    <input className="inpt" aria-label="Billing city" placeholder="San Francisco" />
                  </Field>
                  <Field label="State">
                    <StateSelect value="" onChange={() => {}} ariaLabel="Billing state" />
                  </Field>
                  <Field label="ZIP">
                    <input className="inpt" aria-label="Billing ZIP" placeholder="94105" />
                  </Field>
                </div>
              </div>
            )}
          </section>

          {/* 3 · Delivery */}
          <section style={card}>
            <div style={cardh}>
              <span style={blkn}>3</span>
              Delivery
            </div>
            <div style={opts}>
              <OptionCard selected={delivery === "free"} onSelect={() => setDelivery("free")}>
                <div style={{ flex: 1 }}>
                  <div style={oname}>
                    <Leaf className="h-[15px] w-[15px]" style={{ color: "var(--accent)" }} />
                    Standard shipping
                  </div>
                  <div style={oeta}>Arrives {freeRange} · 5–7 business days, fully offset</div>
                </div>
                <div style={{ ...oprice, color: "var(--accent)", fontWeight: 600 }}>Free</div>
              </OptionCard>
              <OptionCard selected={delivery === "next"} onSelect={() => setDelivery("next")}>
                <div style={{ flex: 1 }}>
                  <div style={oname}>2-day express</div>
                  <div style={oeta}>Arrives {nextRange} · order by 2pm ET</div>
                </div>
                <div style={oprice}>{formatPrice(EXPRESS_FEE)}</div>
              </OptionCard>
            </div>
          </section>

          {/* 4 · Payment */}
          <section style={card}>
            <div style={cardh}>
              <span style={blkn}>4</span>
              Payment
            </div>
            <p style={cardsub}>All transactions are encrypted and secure.</p>
            <div style={opts}>
              <OptionCard selected={pay === "card"} onSelect={() => setPay("card")}>
                <div style={{ flex: 1 }}>
                  <div style={oname}>Credit or debit card</div>
                  <div style={odesc}>Visa, Mastercard, Amex, Discover</div>
                </div>
              </OptionCard>
              {pay === "card" && (
                <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                  <Field label="Card number">
                    <input className="inpt" aria-label="Card number" placeholder="1234 5678 9012 3456" />
                  </Field>
                  <div className="co-frow3">
                    <Field label="Expiry">
                      <input className="inpt" aria-label="Card expiry" placeholder="MM / YY" />
                    </Field>
                    <Field label="CVC">
                      <input className="inpt" aria-label="Card CVC" placeholder="123" />
                    </Field>
                    <Field label="ZIP">
                      <input className="inpt" aria-label="Card billing ZIP" placeholder="94105" />
                    </Field>
                  </div>
                </div>
              )}
              <OptionCard selected={pay === "apple"} onSelect={() => setPay("apple")}>
                <div style={{ flex: 1 }}>
                  <div style={oname}>Apple Pay</div>
                  <div style={odesc}>Pay with Face ID or Touch ID</div>
                </div>
              </OptionCard>
              <OptionCard selected={pay === "paypal"} onSelect={() => setPay("paypal")}>
                <div style={{ flex: 1 }}>
                  <div style={oname}>PayPal</div>
                  <div style={odesc}>Checkout with your PayPal balance</div>
                </div>
              </OptionCard>
            </div>
          </section>
        </div>

        {/* ============ summary ============ */}
        <aside className="co-aside">
          <div className="co-summary">
            <div style={sumtop}>
              <div style={{ fontSize: 13, color: "var(--text2)", fontWeight: 500 }}>Order total</div>
              <div style={sumtotal}>
                {formatPriceDecimal(total)}
                <span style={{ fontSize: 14, fontWeight: 500, color: "var(--text3)" }}>USD</span>
              </div>
              {savings > 0 && (
                <div style={savetag}>
                  <Leaf className="h-[13px] w-[13px]" />
                  You&apos;re saving {formatPrice(savings)} ({savePct}%) vs new
                </div>
              )}
            </div>

            <div style={{ padding: "16px 24px 4px" }}>
              <button
                onClick={placeOrder}
                disabled={empty}
                className="btn"
                style={{
                  width: "100%",
                  padding: "14px 20px",
                  fontSize: 16,
                  borderRadius: 13,
                  opacity: empty ? 0.4 : 1,
                  cursor: empty ? "not-allowed" : "pointer",
                }}
              >
                Place order — {formatPriceDecimal(total)}
              </button>
            </div>
            <div style={sumeta}>
              <Lock className="h-[11px] w-[11px]" /> Encrypted &amp; secure · 30-day returns
            </div>

            <div style={{ padding: "18px 24px 22px" }}>
              <SumRow label={`Subtotal · ${count} ${count === 1 ? "item" : "items"}`} value={<b style={{ color: "var(--text)" }}>{formatPriceDecimal(subtotal)}</b>} />
              <SumRow label="You save" value={<b style={{ color: "var(--accent)" }}>−{formatPrice(savings)}</b>} />
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
              <SumRow label="Charger & cable" value={<b style={{ color: "var(--accent)" }}>Included</b>} />

              {!empty && (
                <div style={sumitems}>
                  {items.map((item) => (
                    <div key={itemKey(item)} style={{ display: "flex", gap: 11, alignItems: "center" }}>
                      <PhImg slug={item.slug} src={imageFor(item.slug, item.colorName)} label={item.name} className="siimg" style={siimg} />
                      <div style={{ minWidth: 0 }}>
                        <div style={{ fontSize: 13.5, fontWeight: 600, lineHeight: 1.2 }}>{item.name}</div>
                        <div style={{ fontSize: 11.5, color: "var(--text3)", marginTop: 2 }}>
                          {GRADES[item.grade].label} · Qty {item.qty}
                        </div>
                      </div>
                      <div style={{ marginLeft: "auto", fontSize: 13.5, fontWeight: 600 }}>
                        {formatPrice(lineTotal(item))}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div style={ecocard}>
              <span style={{ fontSize: 20, fontWeight: 700, color: "var(--accent)", flex: "none" }}>
                ~{co2}kg
              </span>
              <span style={{ fontSize: 12, color: "var(--text2)", lineHeight: 1.3 }}>
                of CO₂ kept out of the air — and a tree planted with your order.
              </span>
            </div>

            <div style={{ padding: "0 24px 22px", display: "flex", flexDirection: "column", gap: 8 }}>
              <Trust>Every device unlocked &amp; network-ready</Trust>
              <Trust>Free 30-day returns — a deduction may apply if not returned as sold</Trust>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}

/* ============================ sub-components ============================ */

function BagLine({
  item,
  first,
  eta,
  onDec,
  onInc,
  onRemove,
}: {
  item: CartItem;
  first: boolean;
  eta: string;
  onDec: () => void;
  onInc: () => void;
  onRemove: () => void;
}) {
  const unit = lineUnitPrice(item);
  const lineSave =
    item.original && item.original > unit ? (item.original - unit) * item.qty : 0;
  return (
    <div
      style={{
        display: "flex",
        gap: 16,
        padding: first ? "4px 0 18px" : "18px 0",
        borderTop: first ? "none" : "1px solid var(--line)",
      }}
    >
      <Link href={`/product/${item.slug}`} style={{ flex: "none" }}>
        <PhImg slug={item.slug} src={imageFor(item.slug, item.colorName)} label={item.name} className="climg" style={climg} />
      </Link>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={clname}>
          <Link href={`/product/${item.slug}`}>{item.name}</Link>
          <span style={clgrade}>{GRADES[item.grade].label}</span>
        </div>
        <div style={clspecs}>
          <Spec>{item.colorName}</Spec>
          <Spec>{item.gb >= 1024 ? "1TB" : `${item.gb}GB`}</Spec>
          <Spec>80%+ battery</Spec>
          <Spec>Unlocked</Spec>
        </div>
        <div style={clship}>
          <Leaf className="h-[13px] w-[13px]" /> Free carbon-neutral shipping · arrives {eta}
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 16, marginTop: 12 }}>
          <div className="qty">
            <button onClick={onDec} aria-label="Decrease quantity">
              <Minus className="h-3.5 w-3.5" />
            </button>
            <span>{item.qty}</span>
            <button onClick={onInc} aria-label="Increase quantity">
              <Plus className="h-3.5 w-3.5" />
            </button>
          </div>
          <button onClick={onRemove} style={clremove} aria-label={`Remove ${item.name}`}>
            Remove
          </button>
        </div>
      </div>
      <div style={{ textAlign: "right", flex: "none", minWidth: 96 }}>
        <div style={{ fontSize: 18, fontWeight: 700 }}>{formatPrice(unit * item.qty)}</div>
        {item.original && item.original > unit && (
          <>
            <div style={{ fontSize: 13, color: "var(--text3)", textDecoration: "line-through" }}>
              {formatPrice(item.original * item.qty)}
            </div>
            <div style={{ fontSize: 12, fontWeight: 600, color: "var(--accent)", marginTop: 3 }}>
              Save {formatPrice(lineSave)}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

function StateSelect({
  value,
  onChange,
  ariaLabel = "State",
}: {
  value: string;
  onChange: (v: string) => void;
  ariaLabel?: string;
}) {
  return (
    <div style={{ position: "relative" }}>
      <select
        className="sel"
        aria-label={ariaLabel}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        style={{ appearance: "none", WebkitAppearance: "none", paddingRight: 34, cursor: "pointer", color: value ? "var(--text)" : "var(--text3)" }}
      >
        <option value="" disabled>
          State
        </option>
        {US_STATES.map((s) => (
          <option key={s} value={s} style={{ color: "var(--text)" }}>
            {s}
          </option>
        ))}
      </select>
      <ChevronDown
        className="h-3.5 w-3.5"
        style={{ position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)", pointerEvents: "none", color: "var(--text3)" }}
      />
    </div>
  );
}

function OptionCard({
  selected,
  onSelect,
  children,
}: {
  selected: boolean;
  onSelect: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onSelect}
      aria-pressed={selected}
      style={{
        position: "relative",
        width: "100%",
        textAlign: "left",
        border: "1px solid var(--line)",
        borderRadius: 13,
        padding: "15px 17px",
        cursor: "pointer",
        display: "flex",
        alignItems: "center",
        gap: 14,
        background: "#fff",
        boxShadow: selected ? "0 0 0 1.5px var(--accent)" : "none",
        borderColor: selected ? "var(--accent)" : "var(--line)",
      }}
    >
      <span
        style={{
          width: 19,
          height: 19,
          borderRadius: "50%",
          border: `1.5px solid ${selected ? "var(--accent)" : "var(--line)"}`,
          flex: "none",
          position: "relative",
        }}
      >
        {selected && (
          <span style={{ position: "absolute", inset: 3.5, borderRadius: "50%", background: "var(--accent)" }} />
        )}
      </span>
      {children}
    </button>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="field" style={{ marginBottom: 13 }}>
      <label className="flabel" style={{ fontWeight: 500, color: "var(--text2)", fontSize: 12.5 }}>
        {label}
      </label>
      {children}
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

function Benefit({ children }: { children: React.ReactNode }) {
  return (
    <span style={{ fontSize: 12.5, color: "var(--text2)", display: "inline-flex", alignItems: "center", gap: 7 }}>
      <span style={{ color: "var(--accent)", fontWeight: 700 }}>✓</span>
      {children}
    </span>
  );
}

function Trust({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ display: "flex", gap: 9, fontSize: 12, color: "var(--text2)", alignItems: "center" }}>
      <span style={{ color: "var(--accent)", fontWeight: 700 }}>✓</span>
      {children}
    </div>
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

function Step({ n, label, state }: { n: string; label: string; state: "done" | "now" | "todo" }) {
  const color = state === "done" ? "var(--accent)" : state === "now" ? "var(--text)" : "var(--text3)";
  const filled = state === "done" || state === "now";
  return (
    <span style={{ display: "flex", alignItems: "center", gap: 7, color, fontWeight: 500, fontSize: 13 }}>
      <span
        style={{
          width: 21,
          height: 21,
          borderRadius: "50%",
          border: `1.5px solid ${filled ? "var(--accent)" : "var(--line)"}`,
          background: filled ? "var(--accent)" : "transparent",
          color: filled ? "#fff" : "var(--text3)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: 11,
          fontWeight: 600,
        }}
      >
        {n}
      </span>
      {label}
    </span>
  );
}

function StepBar() {
  return <span className="co-bar" style={{ width: 30, height: 1.5, background: "var(--line)", margin: "0 12px" }} />;
}

/* ============================ inline style tokens ============================ */

const card: React.CSSProperties = {
  border: "1px solid var(--line)",
  borderRadius: 18,
  padding: "24px 26px",
  marginBottom: 18,
};
const cardh: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: 10,
  fontSize: 17,
  fontWeight: 700,
  letterSpacing: "-.01em",
  marginBottom: 6,
};
const blkn: React.CSSProperties = {
  width: 23,
  height: 23,
  borderRadius: "50%",
  background: "var(--accent)",
  color: "#fff",
  fontSize: 12,
  fontWeight: 700,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  flex: "none",
};
const cardsub: React.CSSProperties = {
  fontSize: 13,
  color: "var(--text3)",
  margin: "0 0 16px 33px",
};
const frow: React.CSSProperties = { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 };
const chkrow: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: 11,
  cursor: "pointer",
  fontSize: 14,
  color: "var(--text)",
  margin: "6px 0 2px",
  position: "relative",
};
const fbox: React.CSSProperties = {
  width: 18,
  height: 18,
  borderRadius: 6,
  border: "1.5px solid var(--line)",
  flex: "none",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  color: "#fff",
};
const boxFilled: React.CSSProperties = { background: "var(--accent)", borderColor: "var(--accent)" };
const opts: React.CSSProperties = { display: "flex", flexDirection: "column", gap: 11 };
const oname: React.CSSProperties = { fontSize: 14.5, fontWeight: 600, display: "flex", alignItems: "center", gap: 8 };
const odesc: React.CSSProperties = { fontSize: 12.5, color: "var(--text3)", marginTop: 2 };
const oeta: React.CSSProperties = { fontSize: 12.5, color: "var(--text2)", marginTop: 2, fontWeight: 500 };
const oprice: React.CSSProperties = { fontSize: 15, fontWeight: 600 };
const climg: React.CSSProperties = { width: 72, height: 92, borderRadius: 11, flex: "none" };
const clname: React.CSSProperties = {
  fontSize: 16,
  fontWeight: 600,
  display: "flex",
  alignItems: "center",
  gap: 9,
  flexWrap: "wrap",
};
const clgrade: React.CSSProperties = {
  fontSize: 11,
  fontWeight: 600,
  color: "var(--accent)",
  background: "rgba(10,143,110,.1)",
  padding: "2px 9px",
  borderRadius: 980,
};
const clspecs: React.CSSProperties = { display: "flex", flexWrap: "wrap", gap: 6, marginTop: 8 };
const clship: React.CSSProperties = {
  fontSize: 12.5,
  color: "var(--accent)",
  marginTop: 9,
  display: "flex",
  alignItems: "center",
  gap: 6,
};
const clremove: React.CSSProperties = {
  fontSize: 12.5,
  color: "var(--text3)",
  background: "none",
  border: "none",
  cursor: "pointer",
  padding: 0,
};
const benstrip: React.CSSProperties = {
  display: "flex",
  flexWrap: "wrap",
  gap: 18,
  marginTop: 18,
  paddingTop: 16,
  borderTop: "1px solid var(--line)",
};
const sumtop: React.CSSProperties = {
  background: "var(--gray)",
  padding: "22px 24px",
  borderBottom: "1px solid var(--line)",
};
const sumtotal: React.CSSProperties = {
  fontSize: 34,
  fontWeight: 700,
  letterSpacing: "-.025em",
  lineHeight: 1.1,
  marginTop: 2,
  display: "flex",
  alignItems: "baseline",
  gap: 8,
};
const savetag: React.CSSProperties = {
  display: "inline-flex",
  alignItems: "center",
  gap: 6,
  fontSize: 12.5,
  fontWeight: 600,
  color: "var(--accent)",
  background: "rgba(10,143,110,.1)",
  padding: "5px 11px",
  borderRadius: 980,
  marginTop: 12,
};
const sumeta: React.CSSProperties = {
  fontSize: 12.5,
  color: "var(--text2)",
  textAlign: "center",
  margin: "11px 24px 0",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  gap: 6,
};
const sumitems: React.CSSProperties = {
  marginTop: 14,
  paddingTop: 16,
  borderTop: "1px solid var(--line)",
  display: "flex",
  flexDirection: "column",
  gap: 13,
};
const siimg: React.CSSProperties = { width: 38, height: 48, borderRadius: 8, flex: "none" };
const ecocard: React.CSSProperties = {
  margin: "16px 24px",
  background: "#edf6f0",
  border: "1px solid #d6e9df",
  borderRadius: 13,
  padding: "13px 15px",
  display: "flex",
  gap: 12,
  alignItems: "center",
};
