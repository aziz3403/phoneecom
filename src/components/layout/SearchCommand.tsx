"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { create } from "zustand";
import { AnimatePresence, motion } from "framer-motion";
import { Search, X, CornerDownLeft } from "lucide-react";
import { DEVICES, startingPrice, popularDevices, renderSrc } from "@/lib/products";
import { formatPrice } from "@/lib/utils";

interface SearchUI {
  open: boolean;
  setOpen: (open: boolean) => void;
}

/** Shared so the navbar search icon (and ⌘K) can open the palette. */
export const useSearch = create<SearchUI>((set) => ({
  open: false,
  setOpen: (open) => set({ open }),
}));

export function SearchCommand() {
  const router = useRouter();
  const open = useSearch((s) => s.open);
  const setOpen = useSearch((s) => s.setOpen);
  const [query, setQuery] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setOpen(!useSearch.getState().open);
      }
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [setOpen]);

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

  function goSearch(q: string) {
    setOpen(false);
    router.push(`/search?q=${encodeURIComponent(q)}`);
  }

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            className="dc-overlay"
            style={{ position: "fixed", inset: 0, zIndex: 300, background: "rgba(10,20,16,.4)", backdropFilter: "blur(4px)" }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setOpen(false)}
          />
          <motion.div
            style={{ position: "fixed", insetInline: 0, top: "12vh", zIndex: 310, margin: "0 auto", width: "92%", maxWidth: 560 }}
            initial={{ opacity: 0, y: -16, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -16, scale: 0.98 }}
            transition={{ duration: 0.18 }}
          >
            <div style={{ overflow: "hidden", borderRadius: 20, background: "#fff", boxShadow: "0 40px 120px -30px rgba(0,0,0,.4)", border: "1px solid var(--line)" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 12, borderBottom: "1px solid var(--line)", padding: "0 16px" }}>
                <Search className="h-5 w-5" style={{ color: "var(--text3)" }} />
                <input
                  ref={inputRef}
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key !== "Enter") return;
                    const q = query.trim();
                    if (q) goSearch(q);
                    else if (results[0]) go(results[0].slug);
                  }}
                  placeholder="Search iPhone, Galaxy, iPad…"
                  style={{ height: 56, width: "100%", border: "none", outline: "none", background: "transparent", fontSize: 17, color: "var(--text)" }}
                />
                <button onClick={() => setOpen(false)} aria-label="Close" style={{ background: "none", border: "none", cursor: "pointer", color: "var(--text3)", display: "flex" }}>
                  <X className="h-5 w-5" />
                </button>
              </div>

              <div style={{ maxHeight: "55vh", overflowY: "auto", padding: 8 }}>
                {results.length === 0 ? (
                  <p style={{ padding: "40px 16px", textAlign: "center", fontSize: 14, color: "var(--text2)" }}>
                    No devices match &ldquo;{query}&rdquo;.
                  </p>
                ) : (
                  <>
                    <p style={{ padding: "8px 12px", fontSize: 11, fontWeight: 600, letterSpacing: ".06em", textTransform: "uppercase", color: "var(--text3)" }}>
                      {query ? "Results" : "Popular right now"}
                    </p>
                    {results.map((d) => (
                      <button
                        key={d.id}
                        onClick={() => go(d.slug)}
                        className="dc-searchrow"
                        style={{ display: "flex", width: "100%", alignItems: "center", gap: 12, borderRadius: 12, padding: "10px 12px", textAlign: "left", background: "none", border: "none", cursor: "pointer" }}
                      >
                        <span className="ph" style={{ height: 46, width: 36, borderRadius: 9, flex: "none" }}>
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img src={d.image ?? renderSrc(d.slug)} alt="" onError={(e) => ((e.target as HTMLImageElement).style.display = "none")} />
                        </span>
                        <span style={{ minWidth: 0, flex: 1 }}>
                          <span style={{ display: "block", fontWeight: 600, color: "var(--text)" }}>{d.name}</span>
                          <span style={{ display: "block", fontSize: 13, color: "var(--text3)" }}>
                            {d.brand} · from {formatPrice(startingPrice(d))}
                          </span>
                        </span>
                        <CornerDownLeft className="h-4 w-4" style={{ color: "var(--line)" }} />
                      </button>
                    ))}
                  </>
                )}
              </div>

              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", borderTop: "1px solid var(--line)", padding: "10px 16px", fontSize: 12, color: "var(--text3)" }}>
                <span>Press Enter to open</span>
                <span style={{ borderRadius: 6, border: "1px solid var(--line)", padding: "1px 6px" }}>esc</span>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
