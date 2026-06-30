"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { GradeId } from "./grades";

export interface OrderLine {
  name: string;
  qty: number;
  gb: number;
  colorName: string;
  mode: "retail" | "wholesale";
  unit: number;
  /** optional snapshot fields for the confirmation page */
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
  /** optional checkout snapshot used by the confirmation page */
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

interface User {
  name: string;
  email: string;
}

interface Cred {
  name: string;
  password: string;
}

export type AuthResult = { ok: true } | { ok: false; error: string };

interface AccountState {
  user: User | null;
  orders: Order[];
  /** demo-only local credential registry, keyed by lowercased email */
  credentials: Record<string, Cred>;
  hydrated: boolean;
  signUp: (name: string, email: string, password: string) => AuthResult;
  logIn: (email: string, password: string) => AuthResult;
  signOut: () => void;
  addOrder: (order: Order) => void;
}

export const useAccount = create<AccountState>()(
  persist(
    (set, get) => ({
      user: null,
      orders: [],
      credentials: {},
      hydrated: false,
      signUp: (name, email, password) => {
        const key = email.trim().toLowerCase();
        if (!key || !/\S+@\S+\.\S+/.test(key)) return { ok: false, error: "Enter a valid email address." };
        if (password.length < 6) return { ok: false, error: "Password must be at least 6 characters." };
        if (get().credentials[key]) return { ok: false, error: "An account with this email already exists — try signing in." };
        const cred: Cred = { name: name.trim() || "there", password };
        set((s) => ({
          credentials: { ...s.credentials, [key]: cred },
          user: { name: cred.name, email: key },
        }));
        return { ok: true };
      },
      logIn: (email, password) => {
        const key = email.trim().toLowerCase();
        const cred = get().credentials[key];
        if (!cred) return { ok: false, error: "No account found for that email — create one instead." };
        if (cred.password !== password) return { ok: false, error: "Incorrect password. Please try again." };
        set({ user: { name: cred.name, email: key } });
        return { ok: true };
      },
      signOut: () => set({ user: null }),
      addOrder: (order) => set((s) => ({ orders: [order, ...s.orders] })),
    }),
    {
      name: "remint-account",
      partialize: (s) => ({ user: s.user, orders: s.orders, credentials: s.credentials }),
      onRehydrateStorage: () => (state) => {
        if (state) state.hydrated = true;
      },
    },
  ),
);
