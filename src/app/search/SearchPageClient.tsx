"use client";

import { useMemo } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Search } from "lucide-react";
import { DEVICES, startingPrice, type Device } from "@/lib/products";
import { ProductCard } from "@/components/ui/ProductCard";
import { ButtonLink } from "@/components/ui/Button";

const POPULAR_SEARCHES = [
  "iPhone 13",
  "Galaxy S24",
  "Pixel",
  "Under $300",
  "Pro Max",
  "256GB",
] as const;

const TRENDING: { label: string; query: string; slug: string }[] = [
  { label: "iPhone 12 — from $299", query: "iPhone 12", slug: "iphone-12" },
  { label: "Galaxy S24 — Pristine, from $469", query: "Galaxy S24", slug: "galaxy-s24" },
  { label: "iPhone 13 — from $389", query: "iPhone 13", slug: "iphone-13" },
  { label: "iPhone 11 — best value, from $219", query: "iPhone 11", slug: "iphone-11" },
];

function matches(d: Device, q: string): boolean {
  const hay =
    `${d.brand} ${d.name} ${d.line} ${d.chip} ${d.colors.map((c) => c.name).join(" ")}`.toLowerCase();
  return hay.includes(q);
}

export function SearchPageClient() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const raw = searchParams.get("q") ?? "";
  const q = raw.trim().toLowerCase();

  const results = useMemo(() => {
    if (!q) return [];
    return DEVICES.filter((d) => matches(d, q)).sort(
      (a, b) => startingPrice(a) - startingPrice(b),
    );
  }, [q]);

  function setQuery(next: string) {
    router.push(`/search?q=${encodeURIComponent(next)}`);
  }

  // ---- Idle: no query ------------------------------------------------------
  if (!q) {
    return (
      <div className="shell pb-24 pt-2">
        <p className="mb-3.5 mt-6 text-[13px] font-semibold uppercase tracking-[0.04em] text-[#86868b]">
          Popular searches
        </p>
        <div className="flex flex-wrap gap-2.5">
          {POPULAR_SEARCHES.map((s) => (
            <button key={s} onClick={() => setQuery(s)} className="chip" type="button">
              {s}
            </button>
          ))}
        </div>

        <p className="mb-2 mt-7 text-[13px] font-semibold uppercase tracking-[0.04em] text-[#86868b]">
          Trending this week
        </p>
        <div>
          {TRENDING.map((t) => (
            <Link
              key={t.label}
              href={`/product/${t.slug}`}
              className="group flex items-center gap-2.5 border-b border-[#d2d2d7] py-3.5 text-[15px]"
            >
              <span className="flex-none text-sm text-[#86868b]">↗</span>
              <span className="flex-1 transition-colors group-hover:text-[#0a8f6e]">{t.label}</span>
              <span className="text-sm text-[#86868b]">›</span>
            </Link>
          ))}
        </div>
      </div>
    );
  }

  // ---- No results ----------------------------------------------------------
  if (results.length === 0) {
    return (
      <div className="shell pb-24">
        <div className="py-14 text-center">
          <div className="mb-3.5 text-[40px] leading-none text-[#86868b]/60" aria-hidden>
            ⌕
          </div>
          <p className="mb-1.5 text-xl font-semibold text-[#1d1d1f]">
            No matches for &ldquo;{raw}&rdquo;
          </p>
          <p className="mx-auto max-w-md text-[#6e6e73]">
            Try a brand (Apple, Samsung), a model, or a capacity — or browse everything.
          </p>
          <div className="mt-5">
            <ButtonLink href="/shop">Browse all phones</ButtonLink>
          </div>
        </div>
      </div>
    );
  }

  // ---- Results -------------------------------------------------------------
  return (
    <div className="shell pb-24">
      <div className="mb-1.5 mt-2 flex flex-wrap items-baseline gap-3">
        <span className="text-[clamp(24px,3vw,32px)] font-bold tracking-[-0.02em] text-[#1d1d1f]">
          Results for &ldquo;{raw}&rdquo;
        </span>
        <span className="text-[15px] text-[#6e6e73]">
          {results.length} {results.length === 1 ? "device" : "devices"}
        </span>
      </div>
      <p className="mb-6 text-sm text-[#86868b]">
        Certified, unlocked and warrantied. Tap any device for full details.
      </p>
      <div className="grid-cards">
        {results.map((d, i) => (
          <ProductCard key={d.id} device={d} index={i} />
        ))}
      </div>
    </div>
  );
}

/** Search field shown in the page header — controlled directly by the URL `?q=`. */
export function SearchHeader() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const value = searchParams.get("q") ?? "";

  function update(next: string) {
    if (next.trim()) router.replace(`/search?q=${encodeURIComponent(next)}`);
    else router.replace("/search");
  }

  return (
    <form
      role="search"
      onSubmit={(e) => e.preventDefault()}
      className="flex items-center gap-2.5 rounded-xl border border-transparent bg-[#f5f5f7] px-4 py-2.5 transition focus-within:border-[#0a8f6e] focus-within:bg-white"
    >
      <Search className="h-[18px] w-[18px] flex-none text-[#86868b]" />
      <input
        autoFocus
        value={value}
        onChange={(e) => update(e.target.value)}
        placeholder="Search phones, brands, capacity…"
        aria-label="Search devices"
        className="w-full bg-transparent text-[15px] text-[#1d1d1f] placeholder:text-[#86868b] focus:outline-none"
      />
      {value && (
        <button
          type="button"
          onClick={() => update("")}
          aria-label="Clear search"
          className="px-0.5 text-base text-[#86868b] hover:text-[#1d1d1f]"
        >
          ✕
        </button>
      )}
    </form>
  );
}
