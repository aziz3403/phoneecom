"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { GradeId } from "./grades";

/**
 * Client-side order log. Real accounts + persistence now live in the database
 * (see src/lib/orders.ts); this store keeps a local copy so the order-confirmed
 * receipt works for guests and instantly after checkout.
 */

export interface OrderLine {
  name: string;
  qty: number;
  gb: number;
  colorName: string;
  mode: "retail" | "wholesale";
  unit: number;
  slug?: string;
  colorHex?: string;
  grade?: GradeId;
  original?: number;
}

export interface Order {
  id: string;
  dateLabel: string;
  total: number;
  status: string;
  lines: OrderLine[];
  email?: string;
  shipTo?: string;
  deliveryLabel?: string;
  deliveryEta?: string;
  paymentLabel?: string;
  subtotal?: number;
  savings?: number;
  tax?: number;
  co2kg?: number;
}

interface AccountState {
  orders: Order[];
  hydrated: boolean;
  addOrder: (order: Order) => void;
}

export const useAccount = create<AccountState>()(
  persist(
    (set) => ({
      orders: [],
      hydrated: false,
      addOrder: (order) => set((s) => ({ orders: [order, ...s.orders] })),
    }),
    {
      name: "remint-account",
      partialize: (s) => ({ orders: s.orders }),
      onRehydrateStorage: () => (state) => {
        if (state) state.hydrated = true;
      },
    },
  ),
);
