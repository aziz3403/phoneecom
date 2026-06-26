"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { GradeId } from "./grades";
import type { Brand, DeviceType } from "./products";
import { unitPrice } from "./wholesale";

export type CartMode = "retail" | "wholesale";

export interface CartItem {
  slug: string;
  name: string;
  brand: Brand;
  type: DeviceType;
  colorName: string;
  colorHex: string;
  accent: string;
  gb: number;
  grade: GradeId;
  mode: CartMode;
  qty: number;
  /** unit price for retail lines (for the chosen storage) */
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
  remove: (key: string) => void;
  setQty: (key: string, qty: number) => void;
  clear: () => void;
}

export const itemKey = (i: Pick<CartItem, "slug" | "gb" | "colorName" | "mode">) =>
  `${i.slug}::${i.gb}::${i.colorName}::${i.mode}`;

export const useCart = create<CartState>()(
  persist(
    (set) => ({
      items: [],
      open: false,
      hydrated: false,
      setOpen: (open) => set({ open }),
      add: (item, qty = 1) =>
        set((state) => {
          const k = itemKey(item);
          const idx = state.items.findIndex((i) => itemKey(i) === k);
          if (idx >= 0) {
            const items = [...state.items];
            items[idx] = { ...items[idx], qty: items[idx].qty + qty };
            return { items, open: true };
          }
          return { items: [...state.items, { ...item, qty }], open: true };
        }),
      remove: (key) =>
        set((state) => ({ items: state.items.filter((i) => itemKey(i) !== key) })),
      setQty: (key, qty) =>
        set((state) => ({
          items: state.items
            .map((i) => (itemKey(i) === key ? { ...i, qty: Math.max(0, qty) } : i))
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
