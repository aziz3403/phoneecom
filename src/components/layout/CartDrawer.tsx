"use client";

import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import { X, Minus, Plus, Trash2, ShoppingBag, ArrowRight } from "lucide-react";
import { useCart, lineUnitPrice, lineTotal, cartSubtotal } from "@/lib/cart-store";
import { formatPrice, cn } from "@/lib/utils";
import { ButtonLink } from "@/components/ui/Button";
import { GradeBadge } from "@/components/ui/Badge";

export function CartDrawer() {
  const open = useCart((s) => s.open);
  const setOpen = useCart((s) => s.setOpen);
  const items = useCart((s) => s.items);
  const setQty = useCart((s) => s.setQty);
  const remove = useCart((s) => s.remove);
  const subtotal = cartSubtotal(items);

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            className="fixed inset-0 z-[60] bg-black/60 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setOpen(false)}
          />
          <motion.aside
            className="fixed right-0 top-0 z-[70] flex h-full w-full max-w-md flex-col border-l border-white/10 bg-ink-900/95 backdrop-blur-xl"
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 30, stiffness: 280 }}
          >
            <div className="flex items-center justify-between border-b border-white/10 px-6 py-5">
              <div className="flex items-center gap-2">
                <ShoppingBag className="h-5 w-5 text-brand-300" />
                <h2 className="font-display text-lg font-bold text-white">Your bag</h2>
                <span className="text-sm text-white/40">({items.length})</span>
              </div>
              <button
                onClick={() => setOpen(false)}
                className="grid h-9 w-9 place-items-center rounded-full bg-white/5 text-white/70 hover:bg-white/10 hover:text-white"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {items.length === 0 ? (
              <div className="flex flex-1 flex-col items-center justify-center gap-4 px-6 text-center">
                <div className="grid h-20 w-20 place-items-center rounded-full bg-white/5">
                  <ShoppingBag className="h-9 w-9 text-white/30" />
                </div>
                <p className="text-white/60">Your bag is empty.</p>
                <ButtonLink href="/shop" variant="primary" size="md" onClick={() => setOpen(false)}>
                  Browse phones <ArrowRight className="h-4 w-4" />
                </ButtonLink>
              </div>
            ) : (
              <>
                <div className="flex-1 space-y-3 overflow-y-auto px-4 py-4">
                  {items.map((item) => (
                    <div
                      key={`${item.slug}-${item.mode}`}
                      className="flex gap-3 rounded-2xl border border-white/10 bg-white/[0.03] p-3"
                    >
                      <div
                        className="grid h-20 w-16 shrink-0 place-items-center rounded-xl"
                        style={{
                          background: `linear-gradient(150deg, ${item.colorHex}, #0b0b17)`,
                          boxShadow: "inset 0 0 0 1px rgba(255,255,255,.08)",
                        }}
                      >
                        <div className="h-14 w-9 rounded-md bg-black/40 ring-1 ring-white/10" />
                      </div>
                      <div className="flex min-w-0 flex-1 flex-col">
                        <div className="flex items-start justify-between gap-2">
                          <div className="min-w-0">
                            <p className="truncate font-medium text-white">{item.name}</p>
                            <p className="text-xs text-white/45">
                              {item.color} · {item.storage}GB
                            </p>
                          </div>
                          <button
                            onClick={() => remove(item.slug, item.mode)}
                            className="text-white/30 hover:text-rose-400"
                            aria-label="Remove"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                        <div className="mt-1 flex items-center gap-2">
                          <GradeBadge grade={item.grade} size="sm" showDot={false} />
                          {item.mode === "wholesale" && (
                            <span className="rounded-full bg-brand-500/15 px-2 py-0.5 text-[10px] font-semibold uppercase text-brand-200">
                              Wholesale
                            </span>
                          )}
                        </div>
                        <div className="mt-auto flex items-center justify-between pt-2">
                          <div className="flex items-center gap-1 rounded-full bg-white/5 p-1">
                            <button
                              onClick={() => setQty(item.slug, item.mode, item.qty - 1)}
                              className="grid h-7 w-7 place-items-center rounded-full text-white/70 hover:bg-white/10"
                            >
                              <Minus className="h-3.5 w-3.5" />
                            </button>
                            <span className="w-7 text-center text-sm font-semibold text-white">{item.qty}</span>
                            <button
                              onClick={() => setQty(item.slug, item.mode, item.qty + 1)}
                              className="grid h-7 w-7 place-items-center rounded-full text-white/70 hover:bg-white/10"
                            >
                              <Plus className="h-3.5 w-3.5" />
                            </button>
                          </div>
                          <div className="text-right">
                            <p className="font-semibold text-white">{formatPrice(lineTotal(item))}</p>
                            <p className="text-[11px] text-white/40">{formatPrice(lineUnitPrice(item))} ea</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="border-t border-white/10 px-6 py-5">
                  <div className="mb-1 flex items-center justify-between text-sm text-white/55">
                    <span>Subtotal</span>
                    <span>{formatPrice(subtotal)}</span>
                  </div>
                  <div className="mb-4 flex items-center justify-between text-sm text-white/55">
                    <span>Shipping</span>
                    <span className="text-mint-300">Free · 2-day</span>
                  </div>
                  <div className="mb-4 flex items-center justify-between">
                    <span className="text-white/70">Total</span>
                    <span className="font-display text-2xl font-bold text-white">{formatPrice(subtotal)}</span>
                  </div>
                  <ButtonLink
                    href="/cart"
                    variant="primary"
                    size="lg"
                    className={cn("w-full")}
                    onClick={() => setOpen(false)}
                  >
                    Checkout <ArrowRight className="h-4 w-4" />
                  </ButtonLink>
                  <button
                    onClick={() => setOpen(false)}
                    className="mt-3 w-full text-center text-sm text-white/50 hover:text-white"
                  >
                    Continue shopping
                  </button>
                </div>
              </>
            )}
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}
