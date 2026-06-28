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
import { useAccount } from "@/lib/account-store";
import { tierForQty } from "@/lib/wholesale";
import { formatPrice, cn } from "@/lib/utils";
import { GradeBadge } from "@/components/ui/Badge";
import { ButtonLink } from "@/components/ui/Button";
import { PhImg } from "@/components/home/PhImg";

export function CartClient() {
  const items = useCart((s) => s.items);
  const setQty = useCart((s) => s.setQty);
  const remove = useCart((s) => s.remove);
  const clear = useCart((s) => s.clear);
  const addOrder = useAccount((s) => s.addOrder);

  const [mounted, setMounted] = useState(false);
  const [placed, setPlaced] = useState(false);
  const [orderId, setOrderId] = useState("");
  const [promo, setPromo] = useState("");

  useEffect(() => setMounted(true), []);

  const subtotal = cartSubtotal(items);
  const tax = Math.round(subtotal * 0.08);
  const total = subtotal + tax;

  function placeOrder() {
    const id = "RM-" + Math.floor(100000 + Math.random() * 899999);
    addOrder({
      id,
      dateLabel: new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }),
      total,
      status: "Processing",
      lines: items.map((i) => ({
        name: i.name,
        qty: i.qty,
        gb: i.gb,
        colorName: i.colorName,
        mode: i.mode,
        unit: lineUnitPrice(i),
      })),
    });
    setOrderId(id);
    setPlaced(true);
    clear();
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  if (!mounted) {
    return (
      <div className="shell py-10">
        <div className="grid gap-8 lg:grid-cols-[1.6fr_1fr]">
          <div className="space-y-3">
            {[0, 1].map((i) => (
              <div key={i} className="h-36 animate-pulse rounded-[22px] bg-[#f5f5f7]" />
            ))}
          </div>
          <div className="h-72 animate-pulse rounded-[22px] border border-[#d2d2d7]" />
        </div>
      </div>
    );
  }

  if (placed) {
    return (
      <div className="mx-auto max-w-2xl px-[22px] py-16 text-center">
        <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}>
          <div className="mx-auto grid h-20 w-20 place-items-center rounded-full bg-[rgba(10,143,110,.1)]">
            <CheckCircle2 className="h-11 w-11 text-[#0a8f6e]" />
          </div>
        </motion.div>
        <h1 className="mt-6 text-4xl font-bold tracking-tight text-[#1d1d1f]">Order confirmed</h1>
        <p className="mt-3 text-[#6e6e73]">
          Thanks for going certified pre-owned. Your order{" "}
          <span className="font-semibold text-[#1d1d1f]">{orderId}</span> is on its way — free 2-day
          shipping.
        </p>
        <p className="mt-2 text-sm text-[#86868b]">(This is a demo store — no payment was taken.)</p>
        <div className="mt-8 flex justify-center gap-3">
          <ButtonLink href="/shop" size="lg">
            Keep shopping <ArrowRight className="h-4.5 w-4.5" />
          </ButtonLink>
          <ButtonLink href="/account" variant="secondary" size="lg">
            View your orders
          </ButtonLink>
        </div>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="mx-auto max-w-2xl px-[22px] py-24 text-center">
        <div className="mx-auto grid h-20 w-20 place-items-center rounded-full bg-[#f5f5f7]">
          <ShoppingBag className="h-9 w-9 text-[#86868b]" />
        </div>
        <h1 className="mt-6 text-3xl font-bold tracking-tight text-[#1d1d1f]">Your bag is empty</h1>
        <p className="mt-2 text-[#6e6e73]">Find a certified phone you&apos;ll love for less.</p>
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
    <div className="shell grid gap-8 pb-24 lg:grid-cols-[1.6fr_1fr]">
      {/* items + shipping */}
      <div>
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold tracking-tight text-[#1d1d1f]">
            Your bag <span className="text-[#86868b]">({items.length})</span>
          </h2>
          {items.length > 0 && (
            <button onClick={clear} className="text-sm text-[#86868b] transition-colors hover:text-[#1d1d1f]">
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
                className="scard flex gap-4 p-5"
              >
                <Link
                  href={`/product/${item.slug}`}
                  className="block h-28 w-20 shrink-0 overflow-hidden rounded-[14px]"
                >
                  <PhImg slug={item.slug} label={item.name} className="h-full w-full" />
                </Link>

                <div className="flex min-w-0 flex-1 flex-col">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <Link
                        href={`/product/${item.slug}`}
                        className="text-lg font-semibold text-[#1d1d1f] transition-colors hover:text-[#0a8f6e]"
                      >
                        {item.name}
                      </Link>
                      <p className="text-sm text-[#6e6e73]">
                        {item.colorName} · {item.gb}GB
                      </p>
                      <div className="mt-2 flex flex-wrap items-center gap-2">
                        <GradeBadge grade={item.grade} size="sm" />
                        {item.mode === "wholesale" && (
                          <span className="tag accent">
                            Wholesale · {tierForQty(item.qty).label}
                          </span>
                        )}
                      </div>
                    </div>
                    <button
                      onClick={() => remove(itemKey(item))}
                      className="text-[#86868b] transition-colors hover:text-[#1d1d1f]"
                      aria-label="Remove"
                    >
                      <Trash2 className="h-4.5 w-4.5" />
                    </button>
                  </div>

                  <div className="mt-auto flex items-center justify-between pt-3">
                    <div className="qty">
                      <button
                        onClick={() => setQty(itemKey(item), item.qty - 1)}
                        aria-label="Decrease quantity"
                      >
                        <Minus className="h-3.5 w-3.5" />
                      </button>
                      <span>{item.qty}</span>
                      <button
                        onClick={() => setQty(itemKey(item), item.qty + 1)}
                        aria-label="Increase quantity"
                      >
                        <Plus className="h-3.5 w-3.5" />
                      </button>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-bold text-[#1d1d1f]">{formatPrice(lineTotal(item))}</p>
                      <p className="text-xs text-[#86868b]">{formatPrice(lineUnitPrice(item))} each</p>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        {/* shipping form (demo) */}
        <div className="scard mt-8 p-6">
          <h3 className="text-lg font-semibold tracking-tight text-[#1d1d1f]">Shipping details</h3>
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
                className={cn("inpt", f.span && "sm:col-span-2")}
              />
            ))}
          </div>
        </div>
      </div>

      {/* summary */}
      <div className="lg:sticky lg:top-24 lg:self-start">
        <div className="scard-bord p-6">
          <h3 className="text-xl font-bold tracking-tight text-[#1d1d1f]">Order summary</h3>

          {/* promo */}
          <div className="mt-5 flex items-center gap-2 rounded-[12px] border border-[#d2d2d7] bg-white px-3 py-2">
            <Tag className="h-4 w-4 text-[#86868b]" />
            <input
              value={promo}
              onChange={(e) => setPromo(e.target.value)}
              placeholder="Promo code"
              className="w-full bg-transparent text-sm text-[#1d1d1f] placeholder:text-[#86868b] focus:outline-none"
            />
            <button className="shrink-0 rounded-full bg-[#f5f5f7] px-3 py-1.5 text-xs font-medium text-[#1d1d1f] transition-colors hover:bg-[#ececef]">
              Apply
            </button>
          </div>

          <div className="mt-5 space-y-3 text-sm">
            <Row label={`Subtotal (${items.length} items)`} value={formatPrice(subtotal)} />
            <Row label="Shipping" value={<span className="font-semibold text-[#0a8f6e]">Free · 2-day</span>} />
            <Row label="Estimated tax" value={formatPrice(tax)} />
            <hr className="hr my-2" />
            <div className="flex items-center justify-between">
              <span className="text-[#1d1d1f]">Total</span>
              <span className="text-2xl font-bold tracking-tight text-[#1d1d1f]">{formatPrice(total)}</span>
            </div>
          </div>

          <button
            onClick={placeOrder}
            disabled={items.length === 0}
            className="btn mt-6 w-full disabled:cursor-not-allowed disabled:opacity-40"
          >
            <Lock className="h-4.5 w-4.5" /> Place order
          </button>

          <div className="mt-5 space-y-2.5 text-xs text-[#6e6e73]">
            <p className="flex items-center gap-2">
              <ShieldCheck className="h-4 w-4 text-[#0a8f6e]" /> 12-month warranty on every device
            </p>
            <p className="flex items-center gap-2">
              <Truck className="h-4 w-4 text-[#0a8f6e]" /> Free carbon-neutral 2-day shipping
            </p>
            <p className="flex items-center gap-2">
              <Lock className="h-4 w-4 text-[#0a8f6e]" /> Secure, encrypted checkout
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
      <span className="text-[#6e6e73]">{label}</span>
      <span className="font-medium text-[#1d1d1f]">{value}</span>
    </div>
  );
}
