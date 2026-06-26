"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface OrderLine {
  name: string;
  qty: number;
  gb: number;
  colorName: string;
  mode: "retail" | "wholesale";
  unit: number;
}

export interface Order {
  id: string;
  dateLabel: string;
  total: number;
  status: string;
  lines: OrderLine[];
}

interface User {
  name: string;
  email: string;
}

interface AccountState {
  user: User | null;
  orders: Order[];
  hydrated: boolean;
  signIn: (name: string, email: string) => void;
  signOut: () => void;
  addOrder: (order: Order) => void;
}

export const useAccount = create<AccountState>()(
  persist(
    (set) => ({
      user: null,
      orders: [],
      hydrated: false,
      signIn: (name, email) => set({ user: { name: name.trim() || "Guest", email: email.trim() } }),
      signOut: () => set({ user: null }),
      addOrder: (order) => set((s) => ({ orders: [order, ...s.orders] })),
    }),
    {
      name: "remint-account",
      partialize: (s) => ({ user: s.user, orders: s.orders }),
      onRehydrateStorage: () => (state) => {
        if (state) state.hydrated = true;
      },
    },
  ),
);
