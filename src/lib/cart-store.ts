"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { GradeId } from "./grades";
import { unitPrice } from "./wholesale";

export type CartMode = "retail" | "wholesale";

export interface CartItem {
  slug: string;
  name: string;
  brand: string;
  color: string;
  colorHex: string;
  grade: GradeId;
  storage: number;
  mode: CartMode;
  qty: number;
  /** unit price for retail lines */
  retailPrice: number;
  /** tier-1 base price for wholesale lines (discount applied by quantity) */
  wholesaleBase: number;
}

interface CartState {
  items: CartItem[];
  open: boolean;
  hydrated: boolean;
  setOpen: (open: boolean) => void;
  add: (item: Omit<CartItem, "qty">, qty?: number) => void;
  remove: (slug: string, mode: CartMode) => void;
  setQty: (slug: string, mode: CartMode, qty: number) => void;
  clear: () => void;
}

const keyOf = (slug: string, mode: CartMode) => `${slug}::${mode}`;

export const useCart = create<CartState>()(
  persist(
    (set) => ({
      items: [],
      open: false,
      hydrated: false,
      setOpen: (open) => set({ open }),
      add: (item, qty = 1) =>
        set((state) => {
          const idx = state.items.findIndex(
            (i) => keyOf(i.slug, i.mode) === keyOf(item.slug, item.mode),
          );
          if (idx >= 0) {
            const items = [...state.items];
            items[idx] = { ...items[idx], qty: items[idx].qty + qty };
            return { items, open: true };
          }
          return { items: [...state.items, { ...item, qty }], open: true };
        }),
      remove: (slug, mode) =>
        set((state) => ({
          items: state.items.filter((i) => keyOf(i.slug, i.mode) !== keyOf(slug, mode)),
        })),
      setQty: (slug, mode, qty) =>
        set((state) => ({
          items: state.items
            .map((i) =>
              keyOf(i.slug, i.mode) === keyOf(slug, mode) ? { ...i, qty: Math.max(0, qty) } : i,
            )
            .filter((i) => i.qty > 0),
        })),
      clear: () => set({ items: [] }),
    }),
    {
      name: "remint-cart",
      partialize: (s) => ({ items: s.items }),
      onRehydrateStorage: () => (state) => {
        if (state) state.hydrated = true;
      },
    },
  ),
);

/** unit price for a line, honoring wholesale volume tiers */
export function lineUnitPrice(item: CartItem): number {
  return item.mode === "wholesale" ? unitPrice(item.wholesaleBase, item.qty) : item.retailPrice;
}

export function lineTotal(item: CartItem): number {
  return lineUnitPrice(item) * item.qty;
}

export function cartCount(items: CartItem[]): number {
  return items.reduce((n, i) => n + i.qty, 0);
}

export function cartSubtotal(items: CartItem[]): number {
  return items.reduce((sum, i) => sum + lineTotal(i), 0);
}
