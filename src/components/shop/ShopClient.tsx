"use client";

import { useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, SlidersHorizontal, X, Zap } from "lucide-react";
import {
  DEVICES,
  BRANDS,
  COLOR_FAMILIES,
  startingPrice,
  type Brand,
  type DeviceType,
  type ColorFamily,
} from "@/lib/products";
import { GRADES, GRADE_ORDER, type GradeId } from "@/lib/grades";
import { ProductCard } from "@/components/ui/ProductCard";
import { formatPrice, cn } from "@/lib/utils";

const PRICES = DEVICES.map(startingPrice);
const MIN_PRICE = Math.min(...PRICES);
const MAX_PRICE = Math.max(...PRICES);
const ALL_STORAGES = Array.from(new Set(DEVICES.flatMap((d) => d.storage.map((s) => s.gb)))).sort(
  (a, b) => a - b,
);
const PRESENT_FAMILIES = COLOR_FAMILIES.filter((f) =>
  DEVICES.some((d) => d.colors.some((c) => c.family === f)),
);

const TYPE_LABEL: Record<DeviceType, string> = { phone: "Phones", tablet: "iPads" };

const SORTS = [
  { id: "featured", label: "Featured" },
  { id: "price-asc", label: "Price: low to high" },
  { id: "price-desc", label: "Price: high to low" },
  { id: "battery", label: "Best battery" },
  { id: "newest", label: "Newest" },
] as const;
type SortId = (typeof SORTS)[number]["id"];

interface Filters {
  query: string;
  types: Set<DeviceType>;
  brands: Set<Brand>;
  grades: Set<GradeId>;
  storages: Set<number>;
  colors: Set<ColorFamily>;
  maxPrice: number;
  fiveG: boolean;
}

type Dim = "type" | "brand" | "grade" | "storage" | "color" | "price" | "fiveg" | "query";

function passes(d: (typeof DEVICES)[number], f: Filters, skip?: Dim): boolean {
  if (skip !== "type" && f.types.size && !f.types.has(d.type)) return false;
  if (skip !== "brand" && f.brands.size && !f.brands.has(d.brand)) return false;
  if (skip !== "grade" && f.grades.size && !f.grades.has(d.grade)) return false;
  if (skip !== "storage" && f.storages.size && !d.storage.some((s) => f.storages.has(s.gb))) return false;
  if (skip !== "color" && f.colors.size && !d.colors.some((c) => f.colors.has(c.family))) return false;
  if (skip !== "price" && startingPrice(d) > f.maxPrice) return false;
  if (skip !== "fiveg" && f.fiveG && !d.fiveG) return false;
  if (skip !== "query" && f.query) {
    const q = f.query.toLowerCase();
    const hay = `${d.brand} ${d.name} ${d.line} ${d.chip} ${d.colors.map((c) => c.name).join(" ")}`.toLowerCase();
    if (!hay.includes(q)) return false;
  }
  return true;
}

function toggle<T>(set: Set<T>, value: T): Set<T> {
  const next = new Set(set);
  if (next.has(value)) next.delete(value);
  else next.add(value);
  return next;
}

export function ShopClient({
  initialBrand,
  initialType,
  initialMax,
}: {
  initialBrand?: string;
  initialType?: string;
  initialMax?: number;
}) {
  const [query, setQuery] = useState("");
  const [types, setTypes] = useState<Set<DeviceType>>(
    new Set(initialType === "tablet" || initialType === "phone" ? [initialType as DeviceType] : []),
  );
  const [brands, setBrands] = useState<Set<Brand>>(
    new Set(initialBrand && BRANDS.includes(initialBrand as Brand) ? [initialBrand as Brand] : []),
  );
  const [grades, setGrades] = useState<Set<GradeId>>(new Set());
  const [storages, setStorages] = useState<Set<number>>(new Set());
  const [colors, setColors] = useState<Set<ColorFamily>>(new Set());
  const [maxPrice, setMaxPrice] = useState<number>(
    initialMax && initialMax >= MIN_PRICE ? Math.min(initialMax, MAX_PRICE) : MAX_PRICE,
  );
  const [fiveG, setFiveG] = useState(false);
  const [sort, setSort] = useState<SortId>("featured");
  const [mobileFilters, setMobileFilters] = useState(false);

  const filters: Filters = { query, types, brands, grades, storages, colors, maxPrice, fiveG };

  const filtered = useMemo(() => {
    const list = DEVICES.filter((d) => passes(d, filters));
    return [...list].sort((a, b) => {
      switch (sort) {
        case "price-asc":
          return startingPrice(a) - startingPrice(b);
        case "price-desc":
          return startingPrice(b) - startingPrice(a);
        case "battery":
          return b.batteryHealth - a.batteryHealth;
        case "newest":
          return b.releaseYear - a.releaseYear;
        default:
          return (b.popular ? 1 : 0) - (a.popular ? 1 : 0) || b.rating - a.rating;
      }
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query, types, brands, grades, storages, colors, maxPrice, fiveG, sort]);

  const count = (dim: Dim, pred: (d: (typeof DEVICES)[number]) => boolean) =>
    DEVICES.filter((d) => passes(d, filters, dim) && pred(d)).length;

  const activeCount =
    types.size + brands.size + grades.size + storages.size + colors.size + (fiveG ? 1 : 0) + (maxPrice < MAX_PRICE ? 1 : 0);

  function clearAll() {
    setTypes(new Set());
    setBrands(new Set());
    setGrades(new Set());
    setStorages(new Set());
    setColors(new Set());
    setMaxPrice(MAX_PRICE);
    setFiveG(false);
    setQuery("");
  }

  const filterPanel = (
    <div className="space-y-7">
      <FilterGroup title="Type">
        <div className="flex flex-wrap gap-2">
          {(["phone", "tablet"] as DeviceType[]).map((t) => (
            <FacetChip
              key={t}
              active={types.has(t)}
              onClick={() => setTypes(toggle(types, t))}
              label={TYPE_LABEL[t]}
              count={count("type", (d) => d.type === t)}
            />
          ))}
        </div>
      </FilterGroup>

      <FilterGroup title="Brand">
        <div className="flex flex-wrap gap-2">
          {BRANDS.map((b) => (
            <FacetChip
              key={b}
              active={brands.has(b)}
              onClick={() => setBrands(toggle(brands, b))}
              label={b}
              count={count("brand", (d) => d.brand === b)}
            />
          ))}
        </div>
      </FilterGroup>

      <FilterGroup title="Condition">
        <div className="flex flex-wrap gap-2">
          {GRADE_ORDER.map((id) => (
            <FacetChip
              key={id}
              active={grades.has(id)}
              onClick={() => setGrades(toggle(grades, id))}
              label={GRADES[id].label}
              dot={GRADES[id].hex}
              count={count("grade", (d) => d.grade === id)}
            />
          ))}
        </div>
      </FilterGroup>

      <FilterGroup title="Storage">
        <div className="flex flex-wrap gap-2">
          {ALL_STORAGES.map((s) => (
            <FacetChip
              key={s}
              active={storages.has(s)}
              onClick={() => setStorages(toggle(storages, s))}
              label={s >= 1024 ? "1TB" : `${s}GB`}
            />
          ))}
        </div>
      </FilterGroup>

      <FilterGroup title="Color">
        <div className="flex flex-wrap gap-2">
          {PRESENT_FAMILIES.map((f) => (
            <FacetChip
              key={f}
              active={colors.has(f)}
              onClick={() => setColors(toggle(colors, f))}
              label={f}
              count={count("color", (d) => d.colors.some((cl) => cl.family === f))}
            />
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
          className="w-full accent-[#0a8f6e]"
        />
        <div className="mt-1 flex justify-between text-xs text-[#86868b]">
          <span>{formatPrice(MIN_PRICE)}</span>
          <span className="font-semibold text-[#1d1d1f]">Up to {formatPrice(maxPrice)}</span>
        </div>
      </FilterGroup>

      <button
        onClick={() => setFiveG((v) => !v)}
        className={cn(
          "flex w-full items-center justify-between rounded-2xl border px-4 py-3 text-sm transition",
          fiveG
            ? "border-[#0a8f6e] bg-[rgba(10,143,110,0.08)] text-[#1d1d1f]"
            : "border-[#d2d2d7] text-[#6e6e73] hover:border-[#86868b]",
        )}
      >
        <span className="inline-flex items-center gap-2">
          <Zap className="h-4 w-4 text-[#0a8f6e]" /> 5G only
        </span>
        <span
          className={cn(
            "h-5 w-9 rounded-full p-0.5 transition",
            fiveG ? "bg-[#0a8f6e]" : "bg-[#d2d2d7]",
          )}
        >
          <span className={cn("block h-4 w-4 rounded-full bg-white transition", fiveG && "translate-x-4")} />
        </span>
      </button>
    </div>
  );

  return (
    <div className="mx-auto grid max-w-[1280px] gap-10 px-[22px] pb-24 pt-10 lg:grid-cols-[260px_1fr]">
      <aside className="hidden lg:block">
        <div className="scard-bord sticky top-24 max-h-[calc(100vh-7rem)] overflow-y-auto [scrollbar-width:thin]">
          <div className="mb-5 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-[#1d1d1f]">Filters</h2>
            {activeCount > 0 && (
              <button onClick={clearAll} className="link" style={{ fontSize: 13 }}>
                Clear all
              </button>
            )}
          </div>
          {filterPanel}
        </div>
      </aside>

      <div>
        <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center">
          <div className="flex flex-1 items-center gap-2 rounded-full border border-[#d2d2d7] bg-white px-4 py-2.5">
            <Search className="h-4 w-4 text-[#86868b]" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search iPhone, Galaxy, iPad…"
              className="w-full bg-transparent text-sm text-[#1d1d1f] placeholder:text-[#86868b] focus:outline-none"
            />
            {query && (
              <button onClick={() => setQuery("")} className="text-[#86868b] hover:text-[#1d1d1f]" aria-label="Clear search">
                <X className="h-4 w-4" />
              </button>
            )}
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setMobileFilters(true)}
              className="inline-flex items-center gap-2 rounded-full border border-[#d2d2d7] bg-white px-4 py-2.5 text-sm text-[#1d1d1f] lg:hidden"
            >
              <SlidersHorizontal className="h-4 w-4" /> Filters
              {activeCount > 0 && (
                <span className="grid h-5 w-5 place-items-center rounded-full bg-[#0a8f6e] text-xs text-white">
                  {activeCount}
                </span>
              )}
            </button>
            <div className="relative">
              <select
                value={sort}
                onChange={(e) => setSort(e.target.value as SortId)}
                className="cursor-pointer appearance-none rounded-full border border-[#d2d2d7] bg-white py-2.5 pl-4 pr-9 text-sm text-[#1d1d1f] focus:outline-none"
              >
                {SORTS.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.label}
                  </option>
                ))}
              </select>
              <span className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 text-[11px] text-[#86868b]">
                ▾
              </span>
            </div>
          </div>
        </div>

        <p className="mb-5 text-sm text-[#6e6e73]">
          <span className="font-semibold text-[#1d1d1f]">{filtered.length}</span>{" "}
          {filtered.length === 1 ? "device" : "devices"}
        </p>

        {filtered.length === 0 ? (
          <div className="grid place-items-center rounded-[22px] border border-dashed border-[#d2d2d7] py-24 text-center">
            <p className="text-[#6e6e73]">No devices match those filters.</p>
            <button onClick={clearAll} className="link mt-3" style={{ fontSize: 15 }}>
              Clear filters
            </button>
          </div>
        ) : (
          <div className="grid-cards">
            {filtered.map((d, i) => (
              <ProductCard key={d.id} device={d} index={i} />
            ))}
          </div>
        )}
      </div>

      <AnimatePresence>
        {mobileFilters && (
          <>
            <motion.div
              className="fixed inset-0 z-[60] bg-black/40 backdrop-blur-sm lg:hidden"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobileFilters(false)}
            />
            <motion.div
              className="fixed inset-x-0 bottom-0 z-[70] max-h-[88vh] overflow-y-auto rounded-t-3xl border-t border-[#d2d2d7] bg-white p-6 lg:hidden"
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 30, stiffness: 280 }}
            >
              <div className="mb-5 flex items-center justify-between">
                <h2 className="text-lg font-semibold text-[#1d1d1f]">Filters</h2>
                <button onClick={() => setMobileFilters(false)} className="text-[#6e6e73]" aria-label="Close filters">
                  <X className="h-5 w-5" />
                </button>
              </div>
              {filterPanel}
              <button
                onClick={() => setMobileFilters(false)}
                className="btn mt-6 w-full"
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
      <h3 className="mb-3 text-xs font-semibold uppercase tracking-[0.16em] text-[#86868b]">{title}</h3>
      {children}
    </div>
  );
}

function FacetChip({
  active,
  onClick,
  label,
  dot,
  count,
}: {
  active: boolean;
  onClick: () => void;
  label: string;
  dot?: string;
  count?: number;
}) {
  return (
    <button onClick={onClick} className={cn("chip", active && "on accent")} type="button">
      {dot && <span className="h-2 w-2 rounded-full" style={{ background: dot }} />}
      <span>{label}</span>
      {count !== undefined && (
        <span className={active ? "text-white/70" : "text-[#86868b]"}>{count}</span>
      )}
    </button>
  );
}
