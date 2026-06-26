"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  Minus,
  Plus,
  Trash2,
  ShoppingBag,
  ShieldCheck,
  Truck,
  Lock,
  ArrowRight,
  CheckCircle2,
  Tag,
} from "lucide-react";
import { useCart, lineUnitPrice, lineTotal, cartSubtotal, itemKey } from "@/lib/cart-store";
import { tierForQty } from "@/lib/wholesale";
import { formatPrice, cn } from "@/lib/utils";
import { GradeBadge } from "@/components/ui/Badge";
import { ButtonLink } from "@/components/ui/Button";

export function CartClient() {
  const items = useCart((s) => s.items);
  const setQty = useCart((s) => s.setQty);
  const remove = useCart((s) => s.remove);
  const clear = useCart((s) => s.clear);

  const [mounted, setMounted] = useState(false);
  const [placed, setPlaced] = useState(false);
  const [orderId, setOrderId] = useState("");
  const [promo, setPromo] = useState("");

  useEffect(() => setMounted(true), []);

  const subtotal = cartSubtotal(items);
  const tax = Math.round(subtotal * 0.08);
  const total = subtotal + tax;

  function placeOrder() {
    setOrderId("RM-" + Math.floor(100000 + Math.random() * 899999));
    setPlaced(true);
    clear();
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  if (!mounted) {
    return (
      <div className="mx-auto max-w-7xl px-5 py-10 sm:px-8">
        <div className="grid gap-8 lg:grid-cols-[1.6fr_1fr]">
          <div className="space-y-3">
            {[0, 1].map((i) => (
              <div key={i} className="h-36 animate-pulse rounded-3xl border border-white/10 bg-white/5" />
            ))}
          </div>
          <div className="h-72 animate-pulse rounded-3xl border border-white/10 bg-white/5" />
        </div>
      </div>
    );
  }

  if (placed) {
    return (
      <div className="mx-auto max-w-2xl px-5 py-16 text-center sm:px-8">
        <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}>
          <div className="mx-auto grid h-20 w-20 place-items-center rounded-full bg-mint-500/20">
            <CheckCircle2 className="h-11 w-11 text-mint-400" />
          </div>
        </motion.div>
        <h1 className="mt-6 font-display text-4xl font-extrabold text-white">Order confirmed</h1>
        <p className="mt-3 text-white/60">
          Thanks for going certified pre-owned. Your order{" "}
          <span className="font-semibold text-white">{orderId}</span> is on its way — free 2-day
          shipping.
        </p>
        <p className="mt-2 text-sm text-white/40">(This is a demo store — no payment was taken.)</p>
        <div className="mt-8 flex justify-center gap-3">
          <ButtonLink href="/shop" size="lg">
            Keep shopping <ArrowRight className="h-4.5 w-4.5" />
          </ButtonLink>
          <ButtonLink href="/" variant="secondary" size="lg">
            Back home
          </ButtonLink>
        </div>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="mx-auto max-w-2xl px-5 py-24 text-center sm:px-8">
        <div className="mx-auto grid h-20 w-20 place-items-center rounded-full bg-white/5">
          <ShoppingBag className="h-9 w-9 text-white/30" />
        </div>
        <h1 className="mt-6 font-display text-3xl font-bold text-white">Your bag is empty</h1>
        <p className="mt-2 text-white/55">Find a certified phone you&apos;ll love for less.</p>
        <div className="mt-7 flex justify-center gap-3">
          <ButtonLink href="/shop" size="lg">
            Shop phones <ArrowRight className="h-4.5 w-4.5" />
          </ButtonLink>
          <ButtonLink href="/wholesale" variant="outline" size="lg">
            Wholesale
          </ButtonLink>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto grid max-w-7xl gap-8 px-5 pb-24 sm:px-8 lg:grid-cols-[1.6fr_1fr]">
      {/* items + shipping */}
      <div>
        <div className="flex items-center justify-between">
          <h2 className="font-display text-2xl font-bold text-white">
            Your bag <span className="text-white/40">({items.length})</span>
          </h2>
          {items.length > 0 && (
            <button onClick={clear} className="text-sm text-white/45 hover:text-rose-400">
              Clear all
            </button>
          )}
        </div>

        <div className="mt-5 space-y-3">
          <AnimatePresence initial={false}>
            {items.map((item) => (
              <motion.div
                key={itemKey(item)}
                layout
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="flex gap-4 rounded-3xl border border-white/10 bg-ink-850/50 p-4"
              >
                <Link
                  href={`/product/${item.slug}`}
                  className="grid h-28 w-20 shrink-0 place-items-center rounded-2xl"
                  style={{ background: `linear-gradient(150deg, ${item.colorHex}, #0b0b17)` }}
                >
                  <span className="h-20 w-12 rounded-lg bg-black/40 ring-1 ring-white/10" />
                </Link>

                <div className="flex min-w-0 flex-1 flex-col">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <Link href={`/product/${item.slug}`} className="font-display text-lg font-semibold text-white hover:text-brand-200">
                        {item.name}
                      </Link>
                      <p className="text-sm text-white/45">
                        {item.colorName} · {item.gb}GB
                      </p>
                      <div className="mt-2 flex flex-wrap items-center gap-2">
                        <GradeBadge grade={item.grade} size="sm" />
                        {item.mode === "wholesale" && (
                          <span className="rounded-full bg-brand-500/15 px-2.5 py-0.5 text-[11px] font-semibold uppercase text-brand-200">
                            Wholesale · {tierForQty(item.qty).label}
                          </span>
                        )}
                      </div>
                    </div>
                    <button
                      onClick={() => remove(itemKey(item))}
                      className="text-white/30 hover:text-rose-400"
                      aria-label="Remove"
                    >
                      <Trash2 className="h-4.5 w-4.5" />
                    </button>
                  </div>

                  <div className="mt-auto flex items-center justify-between pt-3">
                    <div className="flex items-center gap-1 rounded-full border border-white/10 bg-white/5 p-1">
                      <button
                        onClick={() => setQty(itemKey(item), item.qty - 1)}
                        className="grid h-8 w-8 place-items-center rounded-full text-white/70 hover:bg-white/10"
                      >
                        <Minus className="h-3.5 w-3.5" />
                      </button>
                      <span className="w-9 text-center text-sm font-semibold text-white">{item.qty}</span>
                      <button
                        onClick={() => setQty(itemKey(item), item.qty + 1)}
                        className="grid h-8 w-8 place-items-center rounded-full text-white/70 hover:bg-white/10"
                      >
                        <Plus className="h-3.5 w-3.5" />
                      </button>
                    </div>
                    <div className="text-right">
                      <p className="font-display text-lg font-bold text-white">{formatPrice(lineTotal(item))}</p>
                      <p className="text-xs text-white/40">{formatPrice(lineUnitPrice(item))} each</p>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        {/* shipping form (demo) */}
        <div className="mt-8 rounded-3xl border border-white/10 bg-ink-850/50 p-6">
          <h3 className="font-display text-lg font-semibold text-white">Shipping details</h3>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            {[
              { ph: "Full name", span: false },
              { ph: "Email address", span: false },
              { ph: "Address", span: true },
              { ph: "City", span: false },
              { ph: "ZIP / Postal code", span: false },
            ].map((f) => (
              <input
                key={f.ph}
                placeholder={f.ph}
                className={cn(
                  "rounded-2xl border border-white/10 bg-ink-900 px-4 py-3 text-white placeholder:text-white/35 focus:border-brand-400/60 focus:outline-none",
                  f.span && "sm:col-span-2",
                )}
              />
            ))}
          </div>
        </div>
      </div>

      {/* summary */}
      <div className="lg:sticky lg:top-24 lg:self-start">
        <div className="rounded-3xl border border-white/10 bg-ink-850/60 p-6">
          <h3 className="font-display text-xl font-bold text-white">Order summary</h3>

          {/* promo */}
          <div className="mt-5 flex items-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-3 py-2">
            <Tag className="h-4 w-4 text-white/40" />
            <input
              value={promo}
              onChange={(e) => setPromo(e.target.value)}
              placeholder="Promo code"
              className="w-full bg-transparent text-sm text-white placeholder:text-white/35 focus:outline-none"
            />
            <button className="shrink-0 rounded-full bg-white/10 px-3 py-1.5 text-xs font-medium text-white hover:bg-white/15">
              Apply
            </button>
          </div>

          <div className="mt-5 space-y-3 text-sm">
            <Row label={`Subtotal (${items.length} items)`} value={formatPrice(subtotal)} />
            <Row label="Shipping" value={<span className="text-mint-300">Free · 2-day</span>} />
            <Row label="Estimated tax" value={formatPrice(tax)} />
            <div className="my-2 border-t border-white/10" />
            <div className="flex items-center justify-between">
              <span className="text-white/80">Total</span>
              <span className="font-display text-2xl font-bold text-white">{formatPrice(total)}</span>
            </div>
          </div>

          <button
            onClick={placeOrder}
            disabled={items.length === 0}
            className="mt-6 inline-flex h-14 w-full items-center justify-center gap-2 rounded-full bg-gradient-to-r from-brand-500 via-brand-400 to-glacier-400 font-medium text-white shadow-[0_14px_50px_-12px_rgba(116,48,255,.9)] transition hover:-translate-y-0.5 disabled:opacity-40"
          >
            <Lock className="h-4.5 w-4.5" /> Place order
          </button>

          <div className="mt-5 space-y-2.5 text-xs text-white/50">
            <p className="flex items-center gap-2">
              <ShieldCheck className="h-4 w-4 text-mint-400" /> 12-month warranty on every device
            </p>
            <p className="flex items-center gap-2">
              <Truck className="h-4 w-4 text-mint-400" /> Free carbon-neutral 2-day shipping
            </p>
            <p className="flex items-center gap-2">
              <Lock className="h-4 w-4 text-mint-400" /> Secure, encrypted checkout
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

function Row({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-white/55">{label}</span>
      <span className="font-medium text-white">{value}</span>
    </div>
  );
}
