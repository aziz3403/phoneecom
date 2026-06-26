"use client";

import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Search, Plus, Check, Boxes } from "lucide-react";
import type { InventoryItem } from "@/lib/inventory";
import { useCart } from "@/lib/cart-store";
import { GRADES } from "@/lib/grades";
import { formatPrice, cn } from "@/lib/utils";
import { DeviceVisual } from "@/components/ui/DeviceVisual";

const PAGE = 36;

export function InventoryClient({ items }: { items: InventoryItem[] }) {
  const add = useCart((s) => s.add);
  const [query, setQuery] = useState("");
  const [man, setMan] = useState<string>("all");
  const [limit, setLimit] = useState(PAGE);
  const [added, setAdded] = useState<string | null>(null);

  const manufacturers = useMemo(
    () => ["all", ...Array.from(new Set(items.map((i) => i.manufacturer)))],
    [items],
  );

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return items.filter((i) => {
      if (man !== "all" && i.manufacturer !== man) return false;
      if (q && !`${i.model} ${i.color} ${i.storageLabel}`.toLowerCase().includes(q)) return false;
      return true;
    });
  }, [items, query, man]);

  const shown = filtered.slice(0, limit);

  function addToCart(it: InventoryItem) {
    add({
      slug: it.slug,
      name: it.model,
      brand: it.brand,
      type: it.type,
      colorName: it.color,
      colorHex: it.colorHex,
      accent: it.accent,
      gb: it.gb,
      grade: it.topGrade,
      mode: "retail",
      retailPrice: it.price,
      wholesaleBase: Math.round(it.price * 0.9),
    });
    setAdded(it.slug);
    setTimeout(() => setAdded(null), 1300);
  }

  return (
    <div>
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="flex flex-1 items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2.5">
          <Search className="h-4.5 w-4.5 text-white/40" />
          <input
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setLimit(PAGE);
            }}
            placeholder="Search the live inventory…"
            className="w-full bg-transparent text-sm text-white placeholder:text-white/35 focus:outline-none"
          />
        </div>
        <div className="flex flex-wrap gap-2">
          {manufacturers.map((m) => (
            <button
              key={m}
              onClick={() => {
                setMan(m);
                setLimit(PAGE);
              }}
              className={cn(
                "rounded-full border px-3.5 py-1.5 text-sm capitalize transition",
                man === m ? "border-brand-400/60 bg-brand-500/20 text-white" : "border-white/10 text-white/55 hover:border-white/25",
              )}
            >
              {m === "all" ? "All brands" : m.toLowerCase()}
            </button>
          ))}
        </div>
      </div>

      <p className="mb-5 text-sm text-white/45">
        <span className="font-semibold text-white">{filtered.length}</span> listings
      </p>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {shown.map((it, idx) => (
          <motion.div
            key={it.id}
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-30px" }}
            transition={{ duration: 0.4, delay: (idx % 4) * 0.04 }}
            className="flex flex-col rounded-3xl border border-white/10 bg-ink-850/60 p-4"
          >
            <div className="mb-2 flex items-center justify-between text-xs text-white/40">
              <span>{it.manufacturer}</span>
              <span>{it.storageLabel}</span>
            </div>
            <div className="grid h-32 place-items-center">
              <DeviceVisual
                colorHex={it.colorHex}
                accent={it.accent}
                brand={it.brand}
                type={it.type}
                cameraLayout={it.cameraLayout}
                tilt={false}
                className="h-full"
              />
            </div>
            <h3 className="mt-2 line-clamp-1 font-display text-sm font-semibold text-white" title={it.model}>
              {it.model}
            </h3>
            <p className="text-xs text-white/45">{it.color}</p>

            <div className="mt-2 flex flex-wrap gap-1">
              {it.chips.map((c) => {
                const g = GRADES[c.gradeId];
                return (
                  <span
                    key={c.code}
                    className="rounded-md px-1.5 py-0.5 text-[10px] font-semibold"
                    style={{ background: `${g.hex}1f`, color: g.hexSoft }}
                    title={`${g.label} grade`}
                  >
                    {c.code} ×{c.count}
                  </span>
                );
              })}
            </div>

            <div className="mt-auto flex items-end justify-between pt-3">
              <div>
                <span className="text-[11px] text-white/40">{it.stock} in stock · from</span>
                <div className="font-display text-lg font-bold text-white">{formatPrice(it.price)}</div>
              </div>
              <button
                onClick={() => addToCart(it)}
                aria-label={`Add ${it.model}`}
                className={cn(
                  "grid h-10 w-10 shrink-0 place-items-center rounded-full transition-all",
                  added === it.slug ? "bg-mint-500 text-ink-950" : "bg-white/10 text-white hover:bg-gradient-to-r hover:from-brand-500 hover:to-glacier-400",
                )}
              >
                {added === it.slug ? <Check className="h-5 w-5" /> : <Plus className="h-5 w-5" />}
              </button>
            </div>
          </motion.div>
        ))}
      </div>

      {limit < filtered.length && (
        <div className="mt-10 flex justify-center">
          <button
            onClick={() => setLimit((l) => l + PAGE)}
            className="inline-flex items-center gap-2 rounded-full border border-white/15 px-6 py-3 text-sm font-medium text-white transition hover:bg-white/5"
          >
            <Boxes className="h-4 w-4" /> Load more ({filtered.length - limit} left)
          </button>
        </div>
      )}
    </div>
  );
}
