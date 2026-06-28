"use client";

import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Search, Plus, Check, Boxes } from "lucide-react";
import type { InventoryItem } from "@/lib/inventory";
import { useCart } from "@/lib/cart-store";
import { GRADES } from "@/lib/grades";
import { formatPrice, cn } from "@/lib/utils";
import { PhImg } from "@/components/home/PhImg";

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
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-[14px] top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-[#86868b]" />
          <input
            aria-label="Search live inventory"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setLimit(PAGE);
            }}
            placeholder="Search the live inventory…"
            className="inpt pl-[42px]"
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
              className={cn("chip capitalize", man === m && "on accent")}
            >
              {m === "all" ? "All brands" : m.toLowerCase()}
            </button>
          ))}
        </div>
      </div>

      <p className="mb-5 inline-flex items-center gap-1.5 text-sm text-[#6e6e73]">
        <span className="livedot" />
        <span className="font-semibold text-[#1d1d1f]">{filtered.length}</span> listings live · synced daily
      </p>

      <div className="grid-cards">
        {shown.map((it, idx) => (
          <motion.div
            key={it.id}
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-30px" }}
            transition={{ duration: 0.4, delay: (idx % 4) * 0.04 }}
            className="flex h-full flex-col overflow-hidden rounded-[22px] bg-[#f5f5f7]"
          >
            <PhImg slug={it.renderSlug} src={it.image} label={it.model} className="pimg">
              <span className="pbadge">{GRADES[it.topGrade].label}</span>
            </PhImg>
            <div className="flex flex-1 flex-col gap-1.5 p-5">
              <div className="flex items-center justify-between text-xs text-[#86868b]">
                <span>{it.manufacturer}</span>
                <span>{it.storageLabel}</span>
              </div>
              <h3 className="line-clamp-1 text-[17px] font-semibold tracking-[-.015em] text-[#1d1d1f]" title={it.model}>
                {it.model}
              </h3>
              <p className="text-[13px] text-[#86868b]">{it.color}</p>

              <div className="mt-1 flex flex-wrap gap-1.5">
                {it.chips.map((c) => {
                  const g = GRADES[c.gradeId];
                  return (
                    <span key={c.code} className="tag" title={`${g.label} grade`}>
                      <span
                        className="inline-block h-1.5 w-1.5 rounded-full"
                        style={{ background: g.hex }}
                      />
                      {c.code} ×{c.count}
                    </span>
                  );
                })}
              </div>

              <div className="mt-auto flex items-end justify-between pt-3">
                <div>
                  <span className="inline-flex items-center gap-1 text-[11px] text-[#86868b]">
                    <span className="livedot" />
                    {it.stock} in stock · from
                  </span>
                  <div className="text-lg font-bold text-[#1d1d1f]">{formatPrice(it.price)}</div>
                </div>
                <button
                  onClick={() => addToCart(it)}
                  aria-label={`Add ${it.model}`}
                  className={cn("addbtn", added === it.slug && "added")}
                >
                  {added === it.slug ? <Check className="h-5 w-5" /> : <Plus className="h-5 w-5" />}
                </button>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {limit < filtered.length && (
        <div className="mt-10 flex justify-center">
          <button onClick={() => setLimit((l) => l + PAGE)} className="btn btn-lt">
            <Boxes className="h-4 w-4" /> Load more ({filtered.length - limit} left)
          </button>
        </div>
      )}
    </div>
  );
}
