"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { Search, X, CornerDownLeft } from "lucide-react";
import { DEVICES, startingPrice, popularDevices } from "@/lib/products";
import { DeviceVisual } from "@/components/ui/DeviceVisual";
import { formatPrice } from "@/lib/utils";

export function SearchCommand() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setOpen((v) => !v);
      }
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  useEffect(() => {
    if (!open) {
      setQuery("");
    } else {
      const t = setTimeout(() => inputRef.current?.focus(), 50);
      return () => clearTimeout(t);
    }
  }, [open]);

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return popularDevices().slice(0, 6);
    return DEVICES.filter((d) =>
      `${d.brand} ${d.name} ${d.line} ${d.chip} ${d.colors.map((c) => c.name).join(" ")}`
        .toLowerCase()
        .includes(q),
    ).slice(0, 7);
  }, [query]);

  function go(slug: string) {
    setOpen(false);
    router.push(`/product/${slug}`);
  }

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        aria-label="Search"
        className="grid h-10 w-10 place-items-center rounded-full bg-white/5 text-white ring-1 ring-white/10 transition hover:bg-white/10"
      >
        <Search className="h-5 w-5" />
      </button>

      <AnimatePresence>
        {open && (
          <>
            <motion.div
              className="fixed inset-0 z-[80] bg-black/70 backdrop-blur-sm"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setOpen(false)}
            />
            <motion.div
              className="fixed inset-x-0 top-[12vh] z-[90] mx-auto w-[92%] max-w-xl"
              initial={{ opacity: 0, y: -16, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -16, scale: 0.98 }}
              transition={{ duration: 0.18 }}
            >
              <div className="overflow-hidden rounded-2xl border border-white/10 bg-ink-900/95 shadow-[0_40px_120px_-30px_rgba(0,0,0,.9)] backdrop-blur-xl">
                <div className="flex items-center gap-3 border-b border-white/10 px-4">
                  <Search className="h-5 w-5 text-white/40" />
                  <input
                    ref={inputRef}
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && results[0]) go(results[0].slug);
                    }}
                    placeholder="Search iPhone, Galaxy, iPad…"
                    className="h-14 w-full bg-transparent text-white placeholder:text-white/35 focus:outline-none"
                  />
                  <button onClick={() => setOpen(false)} className="text-white/40 hover:text-white">
                    <X className="h-5 w-5" />
                  </button>
                </div>

                <div className="max-h-[55vh] overflow-y-auto p-2">
                  {results.length === 0 ? (
                    <p className="px-4 py-10 text-center text-sm text-white/45">
                      No devices match &ldquo;{query}&rdquo;.
                    </p>
                  ) : (
                    <>
                      <p className="px-3 py-2 text-xs font-semibold uppercase tracking-wider text-white/35">
                        {query ? "Results" : "Popular right now"}
                      </p>
                      {results.map((d) => (
                        <button
                          key={d.id}
                          onClick={() => go(d.slug)}
                          className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left transition hover:bg-white/5"
                        >
                          <span className="grid h-12 w-9 shrink-0 place-items-center">
                            <DeviceVisual
                              colorHex={d.colors[0].hex}
                              accent={d.colors[0].accent}
                              brand={d.brand}
                              type={d.type}
                              cameraLayout={d.cameraLayout}
                              tilt={false}
                              className="h-full"
                            />
                          </span>
                          <span className="min-w-0 flex-1">
                            <span className="block truncate font-medium text-white">{d.name}</span>
                            <span className="block text-xs text-white/45">
                              {d.brand} · from {formatPrice(startingPrice(d))}
                            </span>
                          </span>
                          <CornerDownLeft className="h-4 w-4 text-white/20" />
                        </button>
                      ))}
                    </>
                  )}
                </div>

                <div className="flex items-center justify-between border-t border-white/10 px-4 py-2.5 text-xs text-white/35">
                  <span>Press Enter to open</span>
                  <span className="rounded-md border border-white/15 px-1.5 py-0.5">esc</span>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
