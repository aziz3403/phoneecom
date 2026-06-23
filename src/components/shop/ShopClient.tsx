"use client";

import { useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, SlidersHorizontal, X, Check, Zap } from "lucide-react";
import { PHONES, BRANDS, STORAGE_OPTIONS, type Brand } from "@/lib/products";
import { GRADES, GRADE_ORDER, type GradeId } from "@/lib/grades";
import { ProductCard } from "@/components/ui/ProductCard";
import { formatPrice, cn } from "@/lib/utils";

const PRICES = PHONES.map((p) => p.price);
const MIN_PRICE = Math.min(...PRICES);
const MAX_PRICE = Math.max(...PRICES);

const SORTS = [
  { id: "featured", label: "Featured" },
  { id: "price-asc", label: "Price: low to high" },
  { id: "price-desc", label: "Price: high to low" },
  { id: "battery", label: "Best battery" },
  { id: "newest", label: "Newest" },
] as const;

type SortId = (typeof SORTS)[number]["id"];

function toggle<T>(set: Set<T>, value: T): Set<T> {
  const next = new Set(set);
  if (next.has(value)) next.delete(value);
  else next.add(value);
  return next;
}

export function ShopClient({
  initialBrand,
  initialMax,
}: {
  initialBrand?: string;
  initialMax?: number;
}) {
  const [query, setQuery] = useState("");
  const [brands, setBrands] = useState<Set<Brand>>(
    new Set(initialBrand && BRANDS.includes(initialBrand as Brand) ? [initialBrand as Brand] : []),
  );
  const [grades, setGrades] = useState<Set<GradeId>>(new Set());
  const [storages, setStorages] = useState<Set<number>>(new Set());
  const [maxPrice, setMaxPrice] = useState<number>(
    initialMax && initialMax >= MIN_PRICE ? Math.min(initialMax, MAX_PRICE) : MAX_PRICE,
  );
  const [fiveG, setFiveG] = useState(false);
  const [sort, setSort] = useState<SortId>("featured");
  const [mobileFilters, setMobileFilters] = useState(false);

  const filtered = useMemo(() => {
    let list = PHONES.filter((p) => {
      if (brands.size && !brands.has(p.brand)) return false;
      if (grades.size && !grades.has(p.grade)) return false;
      if (storages.size && !storages.has(p.storage)) return false;
      if (p.price > maxPrice) return false;
      if (fiveG && !p.fiveG) return false;
      if (query) {
        const q = query.toLowerCase();
        if (!`${p.brand} ${p.name} ${p.color} ${p.chip}`.toLowerCase().includes(q)) return false;
      }
      return true;
    });

    list = [...list].sort((a, b) => {
      switch (sort) {
        case "price-asc":
          return a.price - b.price;
        case "price-desc":
          return b.price - a.price;
        case "battery":
          return b.batteryHealth - a.batteryHealth;
        case "newest":
          return b.releaseYear - a.releaseYear;
        default:
          return (b.popular ? 1 : 0) - (a.popular ? 1 : 0) || b.rating - a.rating;
      }
    });
    return list;
  }, [brands, grades, storages, maxPrice, fiveG, query, sort]);

  const activeCount =
    brands.size + grades.size + storages.size + (fiveG ? 1 : 0) + (maxPrice < MAX_PRICE ? 1 : 0);

  function clearAll() {
    setBrands(new Set());
    setGrades(new Set());
    setStorages(new Set());
    setMaxPrice(MAX_PRICE);
    setFiveG(false);
    setQuery("");
  }

  const filterPanel = (
    <div className="space-y-7">
      <FilterGroup title="Brand">
        <div className="space-y-1.5">
          {BRANDS.map((b) => (
            <CheckRow key={b} checked={brands.has(b)} onClick={() => setBrands(toggle(brands, b))} label={b} />
          ))}
        </div>
      </FilterGroup>

      <FilterGroup title="Condition">
        <div className="space-y-1.5">
          {GRADE_ORDER.map((id) => (
            <CheckRow
              key={id}
              checked={grades.has(id)}
              onClick={() => setGrades(toggle(grades, id))}
              label={GRADES[id].label}
              dot={GRADES[id].hex}
            />
          ))}
        </div>
      </FilterGroup>

      <FilterGroup title="Storage">
        <div className="flex flex-wrap gap-2">
          {STORAGE_OPTIONS.map((s) => (
            <button
              key={s}
              onClick={() => setStorages(toggle(storages, s))}
              className={cn(
                "rounded-full border px-3.5 py-1.5 text-sm transition",
                storages.has(s)
                  ? "border-brand-400/60 bg-brand-500/20 text-white"
                  : "border-white/10 text-white/55 hover:border-white/25",
              )}
            >
              {s}GB
            </button>
          ))}
        </div>
      </FilterGroup>

      <FilterGroup title="Max price">
        <input
          type="range"
          min={MIN_PRICE}
          max={MAX_PRICE}
          step={10}
          value={maxPrice}
          onChange={(e) => setMaxPrice(Number(e.target.value))}
          className="w-full accent-brand-500"
        />
        <div className="mt-1 flex justify-between text-xs text-white/45">
          <span>{formatPrice(MIN_PRICE)}</span>
          <span className="font-semibold text-white">Up to {formatPrice(maxPrice)}</span>
        </div>
      </FilterGroup>

      <button
        onClick={() => setFiveG((v) => !v)}
        className={cn(
          "flex w-full items-center justify-between rounded-2xl border px-4 py-3 text-sm transition",
          fiveG ? "border-brand-400/50 bg-brand-500/15 text-white" : "border-white/10 text-white/60",
        )}
      >
        <span className="inline-flex items-center gap-2">
          <Zap className="h-4 w-4 text-glacier-300" /> 5G ready only
        </span>
        <span className={cn("h-5 w-9 rounded-full p-0.5 transition", fiveG ? "bg-brand-500" : "bg-white/15")}>
          <span className={cn("block h-4 w-4 rounded-full bg-white transition", fiveG && "translate-x-4")} />
        </span>
      </button>
    </div>
  );

  return (
    <div className="mx-auto grid max-w-7xl gap-8 px-5 pb-24 sm:px-8 lg:grid-cols-[260px_1fr]">
      {/* desktop sidebar */}
      <aside className="hidden lg:block">
        <div className="sticky top-24 rounded-3xl border border-white/10 bg-ink-850/50 p-6">
          <div className="mb-5 flex items-center justify-between">
            <h2 className="font-display text-lg font-semibold text-white">Filters</h2>
            {activeCount > 0 && (
              <button onClick={clearAll} className="text-xs text-brand-300 hover:text-brand-200">
                Clear all
              </button>
            )}
          </div>
          {filterPanel}
        </div>
      </aside>

      <div>
        {/* search + sort bar */}
        <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center">
          <div className="flex flex-1 items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2.5">
            <Search className="h-4.5 w-4.5 text-white/40" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search iPhone, Galaxy, Pixel…"
              className="w-full bg-transparent text-sm text-white placeholder:text-white/35 focus:outline-none"
            />
            {query && (
              <button onClick={() => setQuery("")} className="text-white/40 hover:text-white">
                <X className="h-4 w-4" />
              </button>
            )}
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setMobileFilters(true)}
              className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2.5 text-sm text-white lg:hidden"
            >
              <SlidersHorizontal className="h-4 w-4" /> Filters
              {activeCount > 0 && (
                <span className="grid h-5 w-5 place-items-center rounded-full bg-brand-500 text-xs">{activeCount}</span>
              )}
            </button>
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value as SortId)}
              className="rounded-full border border-white/10 bg-ink-850 px-4 py-2.5 text-sm text-white focus:outline-none"
            >
              {SORTS.map((s) => (
                <option key={s.id} value={s.id} className="bg-ink-850">
                  {s.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        <p className="mb-5 text-sm text-white/45">
          <span className="font-semibold text-white">{filtered.length}</span> phones
          {brands.size === 1 ? ` · ${[...brands][0]}` : ""}
        </p>

        {filtered.length === 0 ? (
          <div className="grid place-items-center rounded-3xl border border-dashed border-white/15 py-24 text-center">
            <p className="text-white/60">No phones match those filters.</p>
            <button onClick={clearAll} className="mt-3 text-brand-300 hover:text-brand-200">
              Clear filters
            </button>
          </div>
        ) : (
          <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
            {filtered.map((p, i) => (
              <ProductCard key={p.id} phone={p} index={i} />
            ))}
          </div>
        )}
      </div>

      {/* mobile filter sheet */}
      <AnimatePresence>
        {mobileFilters && (
          <>
            <motion.div
              className="fixed inset-0 z-[60] bg-black/60 backdrop-blur-sm lg:hidden"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobileFilters(false)}
            />
            <motion.div
              className="fixed inset-x-0 bottom-0 z-[70] max-h-[85vh] overflow-y-auto rounded-t-3xl border-t border-white/10 bg-ink-900 p-6 lg:hidden"
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 30, stiffness: 280 }}
            >
              <div className="mb-5 flex items-center justify-between">
                <h2 className="font-display text-lg font-semibold text-white">Filters</h2>
                <button onClick={() => setMobileFilters(false)} className="text-white/60">
                  <X className="h-5 w-5" />
                </button>
              </div>
              {filterPanel}
              <button
                onClick={() => setMobileFilters(false)}
                className="mt-6 w-full rounded-full bg-gradient-to-r from-brand-500 to-glacier-400 py-3 font-medium text-white"
              >
                Show {filtered.length} results
              </button>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}

function FilterGroup({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <h3 className="mb-3 text-xs font-semibold uppercase tracking-[0.16em] text-white/40">{title}</h3>
      {children}
    </div>
  );
}

function CheckRow({
  checked,
  onClick,
  label,
  dot,
}: {
  checked: boolean;
  onClick: () => void;
  label: string;
  dot?: string;
}) {
  return (
    <button onClick={onClick} className="flex w-full items-center gap-2.5 py-1 text-left text-sm text-white/70 hover:text-white">
      <span
        className={cn(
          "grid h-4.5 w-4.5 place-items-center rounded-md border transition",
          checked ? "border-brand-400 bg-brand-500" : "border-white/20",
        )}
      >
        {checked && <Check className="h-3 w-3 text-white" />}
      </span>
      {dot && <span className="h-2 w-2 rounded-full" style={{ background: dot }} />}
      {label}
    </button>
  );
}
