"use client";

import { useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Plus, Minus, Trash2, ShoppingCart, Check } from "lucide-react";
import { DEVICES, getDevice, baseStorage, storageFor } from "@/lib/products";
import { tierForQty, unitPrice, MOQ } from "@/lib/wholesale";
import { useCart } from "@/lib/cart-store";
import { PhImg } from "@/components/home/PhImg";
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
    <div className="overflow-hidden rounded-[22px] border border-[#d2d2d7] bg-white">
      <div className="hidden grid-cols-[1.7fr_1fr_0.7fr_1fr_auto] gap-4 border-b border-[#d2d2d7] bg-[#f5f5f7] px-6 py-4 text-xs font-semibold uppercase tracking-wider text-[#86868b] md:grid">
        <span>Model</span>
        <span>Quantity</span>
        <span>Tier</span>
        <span className="text-right">Unit / Subtotal</span>
        <span />
      </div>

      <div className="divide-y divide-[#ececef]">
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
                <PhImg
                  slug={l.device.slug}
                  src={l.device.image}
                  label={l.device.name}
                  className="h-14 w-11 shrink-0 rounded-xl"
                />
                <div className="min-w-0">
                  <p className="truncate font-medium text-[#1d1d1f]">{l.device.name}</p>
                  <select
                    aria-label={`Storage for ${l.device.name}`}
                    value={l.gb}
                    onChange={(e) => setGb(l.slug, Number(e.target.value))}
                    className="mt-1 rounded-md border border-[#d2d2d7] bg-white px-1.5 py-0.5 text-xs text-[#6e6e73] focus:border-[#0a8f6e] focus:outline-none"
                  >
                    {l.device.storage.map((s) => (
                      <option key={s.gb} value={s.gb}>
                        {s.gb}GB
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="qty w-fit">
                <button onClick={() => setQty(l.slug, l.qty - 5)} aria-label="Decrease quantity">
                  <Minus className="h-3.5 w-3.5" />
                </button>
                <input
                  value={l.qty}
                  onChange={(e) => setQty(l.slug, Number(e.target.value.replace(/\D/g, "")) || MOQ)}
                  className="w-12 bg-transparent text-center text-sm font-semibold text-[#1d1d1f] focus:outline-none"
                  aria-label={`Quantity for ${l.device.name}`}
                />
                <button onClick={() => setQty(l.slug, l.qty + 5)} aria-label="Increase quantity">
                  <Plus className="h-3.5 w-3.5" />
                </button>
              </div>

              <span className="hidden text-sm md:block">
                <span className="tag accent">{l.tier.label}</span>
              </span>

              <div className="text-right">
                <p className="font-semibold text-[#1d1d1f]">{formatPrice(l.subtotal)}</p>
                <p className="text-xs text-[#86868b]">{formatPrice(l.unit)}/unit</p>
              </div>

              <button
                onClick={() => remove(l.slug)}
                className="hidden justify-self-end text-[#86868b] transition-colors hover:text-[#e0245e] md:block"
                aria-label="Remove line"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {available.length > 0 && (
        <div className="border-t border-[#d2d2d7] px-6 py-4">
          <select
            aria-label="Add a model to the order"
            value=""
            onChange={(e) => addLine(e.target.value)}
            className="w-full rounded-2xl border border-dashed border-[#d2d2d7] bg-transparent px-4 py-3 text-sm text-[#6e6e73] focus:border-[#0a8f6e] focus:outline-none"
          >
            <option value="">+ Add another model…</option>
            {available.map((p) => (
              <option key={p.slug} value={p.slug}>
                {p.name}
              </option>
            ))}
          </select>
        </div>
      )}

      <div className="flex flex-col gap-4 border-t border-[#d2d2d7] bg-[#f5f5f7] px-6 py-5 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-wrap gap-x-8 gap-y-2">
          <div>
            <p className="text-xs text-[#86868b]">Total units</p>
            <p className="text-xl font-bold tracking-tight text-[#1d1d1f]">{totals.units.toLocaleString()}</p>
          </div>
          <div>
            <p className="text-xs text-[#86868b]">You save vs retail</p>
            <p className="text-xl font-bold tracking-tight text-[#0a8f6e]">{formatPrice(totals.savings)}</p>
          </div>
          <div>
            <p className="text-xs text-[#86868b]">Order total</p>
            <p className="text-xl font-bold tracking-tight text-[#1d1d1f]">{formatPrice(totals.total)}</p>
          </div>
        </div>
        <button
          onClick={addOrderToCart}
          disabled={computed.length === 0}
          className={cn(
            "inline-flex h-12 items-center justify-center gap-2 rounded-full px-6 text-[17px] text-white transition-all duration-200 disabled:cursor-not-allowed disabled:opacity-40",
            added ? "bg-[#0a8f6e]" : "bg-[#0a8f6e] hover:bg-[#0a7d61] active:scale-[.98]",
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
