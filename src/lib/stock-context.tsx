"use client";

import { createContext, useContext } from "react";

/**
 * Per-slug live stock resolved from the inventory sheet on the server and
 * provided once at the root layout. Any product card or detail page reads it
 * through `useStockFor`, so the whole storefront reflects warehouse availability
 * without threading props through every page.
 */
const StockContext = createContext<Record<string, number> | null>(null);

export function StockProvider({
  stock,
  children,
}: {
  stock: Record<string, number>;
  children: React.ReactNode;
}) {
  return <StockContext.Provider value={stock}>{children}</StockContext.Provider>;
}

/** Live stock for a slug; falls back to the catalog value when no map is present. */
export function useStockFor(slug: string, fallback: number): number {
  const map = useContext(StockContext);
  if (!map) return fallback;
  return slug in map ? map[slug] : fallback;
}

/** The whole slug → units map (null when no provider), for list filtering. */
export function useStockMap(): Record<string, number> | null {
  return useContext(StockContext);
}
