"use client";

import { useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Plus, Minus, Trash2, ShoppingCart, Check } from "lucide-react";
import { DEVICES, getDevice, baseStorage, storageFor } from "@/lib/products";
import { tierForQty, unitPrice, MOQ } from "@/lib/wholesale";
import { useCart } from "@/lib/cart-store";
import { formatPrice, cn } from "@/lib/utils";

interface Line {
  slug: string;
  gb: number;
  qty: number;
}

export function BulkOrderBuilder() {
  const add = useCart((s) => s.add);
  const setOpen = useCart((s) => s.setOpen);
  const [lines, setLines] = useState<Line[]>([
    { slug: "iphone-15-pro", gb: 128, qty: 50 },
    { slug: "galaxy-s23", gb: 128, qty: 100 },
  ]);
  const [added, setAdded] = useState(false);

  const computed = useMemo(
    () =>
      lines
        .map((l) => {
          const device = getDevice(l.slug);
          if (!device) return null;
          const sOpt = storageFor(device, l.gb);
          const tier = tierForQty(l.qty);
          const unit = unitPrice(sOpt.wholesale, l.qty);
          return {
            ...l,
            device,
            sOpt,
            tier,
            unit,
            subtotal: unit * l.qty,
            retailSubtotal: sOpt.price * l.qty,
          };
        })
        .filter((x): x is NonNullable<typeof x> => Boolean(x)),
    [lines],
  );

  const totals = useMemo(() => {
    const units = computed.reduce((n, l) => n + l.qty, 0);
    const total = computed.reduce((n, l) => n + l.subtotal, 0);
    const retail = computed.reduce((n, l) => n + l.retailSubtotal, 0);
    return { units, total, retail, savings: retail - total };
  }, [computed]);

  const available = DEVICES.filter((p) => !lines.some((l) => l.slug === p.slug));

  function addLine(slug: string) {
    if (!slug) return;
    const d = getDevice(slug);
    if (!d) return;
    setLines((ls) => [...ls, { slug, gb: baseStorage(d).gb, qty: MOQ * 2 }]);
  }
  function setQty(slug: string, qty: number) {
    setLines((ls) => ls.map((l) => (l.slug === slug ? { ...l, qty: Math.max(MOQ, qty) } : l)));
  }
  function setGb(slug: string, gb: number) {
    setLines((ls) => ls.map((l) => (l.slug === slug ? { ...l, gb } : l)));
  }
  function remove(slug: string) {
    setLines((ls) => ls.filter((l) => l.slug !== slug));
  }

  function addOrderToCart() {
    computed.forEach((l) => {
      const color = l.device.colors[0];
      add(
        {
          slug: l.device.slug,
          name: l.device.name,
          brand: l.device.brand,
          type: l.device.type,
          colorName: color.name,
          colorHex: color.hex,
          accent: color.accent,
          gb: l.gb,
          grade: l.device.grade,
          mode: "wholesale",
          retailPrice: l.sOpt.price,
          wholesaleBase: l.sOpt.wholesale,
        },
        l.qty,
      );
    });
    setAdded(true);
    setTimeout(() => {
      setAdded(false);
      setOpen(true);
    }, 700);
  }

  return (
    <div className="overflow-hidden rounded-3xl border border-white/10 bg-ink-850/50">
      <div className="hidden grid-cols-[1.7fr_1fr_0.7fr_1fr_auto] gap-4 border-b border-white/10 px-6 py-4 text-xs font-semibold uppercase tracking-wider text-white/40 md:grid">
        <span>Model</span>
        <span>Quantity</span>
        <span>Tier</span>
        <span className="text-right">Unit / Subtotal</span>
        <span />
      </div>

      <div className="divide-y divide-white/5">
        <AnimatePresence initial={false}>
          {computed.map((l) => (
            <motion.div
              key={l.slug}
              layout
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="grid grid-cols-2 items-center gap-4 px-6 py-4 md:grid-cols-[1.7fr_1fr_0.7fr_1fr_auto]"
            >
              <div className="col-span-2 flex items-center gap-3 md:col-span-1">
                <span
                  className="grid h-12 w-9 shrink-0 place-items-center rounded-lg"
                  style={{ background: `linear-gradient(150deg, ${l.device.colors[0].hex}, #0b0b17)` }}
                >
                  <span className="h-8 w-5 rounded bg-black/40 ring-1 ring-white/10" />
                </span>
                <div className="min-w-0">
                  <p className="truncate font-medium text-white">{l.device.name}</p>
                  <select
                    value={l.gb}
                    onChange={(e) => setGb(l.slug, Number(e.target.value))}
                    className="mt-0.5 rounded-md border border-white/10 bg-ink-900 px-1.5 py-0.5 text-xs text-white/60 focus:outline-none"
                  >
                    {l.device.storage.map((s) => (
                      <option key={s.gb} value={s.gb} className="bg-ink-900">
                        {s.gb}GB
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="flex w-fit items-center gap-1 rounded-full border border-white/10 bg-white/5 p-1">
                <button onClick={() => setQty(l.slug, l.qty - 5)} className="grid h-8 w-8 place-items-center rounded-full text-white/70 hover:bg-white/10">
                  <Minus className="h-3.5 w-3.5" />
                </button>
                <input
                  value={l.qty}
                  onChange={(e) => setQty(l.slug, Number(e.target.value.replace(/\D/g, "")) || MOQ)}
                  className="w-12 bg-transparent text-center text-sm font-semibold text-white focus:outline-none"
                />
                <button onClick={() => setQty(l.slug, l.qty + 5)} className="grid h-8 w-8 place-items-center rounded-full text-white/70 hover:bg-white/10">
                  <Plus className="h-3.5 w-3.5" />
                </button>
              </div>

              <span className="hidden text-sm md:block">
                <span className="rounded-full bg-brand-500/15 px-2.5 py-1 text-xs font-semibold text-brand-200">
                  {l.tier.label}
                </span>
              </span>

              <div className="text-right">
                <p className="font-semibold text-white">{formatPrice(l.subtotal)}</p>
                <p className="text-xs text-white/45">{formatPrice(l.unit)}/unit</p>
              </div>

              <button onClick={() => remove(l.slug)} className="hidden justify-self-end text-white/30 hover:text-rose-400 md:block" aria-label="Remove line">
                <Trash2 className="h-4 w-4" />
              </button>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {available.length > 0 && (
        <div className="border-t border-white/10 px-6 py-4">
          <select
            value=""
            onChange={(e) => addLine(e.target.value)}
            className="w-full rounded-2xl border border-dashed border-white/15 bg-transparent px-4 py-3 text-sm text-white/70 focus:border-brand-400/60 focus:outline-none"
          >
            <option value="" className="bg-ink-900">
              + Add another model…
            </option>
            {available.map((p) => (
              <option key={p.slug} value={p.slug} className="bg-ink-900">
                {p.name}
              </option>
            ))}
          </select>
        </div>
      )}

      <div className="flex flex-col gap-4 border-t border-white/10 bg-white/[0.02] px-6 py-5 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-wrap gap-x-8 gap-y-2">
          <div>
            <p className="text-xs text-white/45">Total units</p>
            <p className="font-display text-xl font-bold text-white">{totals.units.toLocaleString()}</p>
          </div>
          <div>
            <p className="text-xs text-white/45">You save vs retail</p>
            <p className="font-display text-xl font-bold text-mint-300">{formatPrice(totals.savings)}</p>
          </div>
          <div>
            <p className="text-xs text-white/45">Order total</p>
            <p className="font-display text-xl font-bold text-white">{formatPrice(totals.total)}</p>
          </div>
        </div>
        <button
          onClick={addOrderToCart}
          disabled={computed.length === 0}
          className={cn(
            "inline-flex h-12 items-center justify-center gap-2 rounded-full px-6 font-medium transition-all duration-300 disabled:opacity-40",
            added ? "bg-mint-500 text-ink-950" : "bg-gradient-to-r from-brand-500 to-glacier-400 text-white hover:-translate-y-0.5",
          )}
        >
          {added ? (
            <>
              <Check className="h-5 w-5" /> Added
            </>
          ) : (
            <>
              <ShoppingCart className="h-5 w-5" /> Add order to cart
            </>
          )}
        </button>
      </div>
    </div>
  );
}
