"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

export type WholesaleStatus = "none" | "approved";

interface WholesaleAccountState {
  status: WholesaleStatus;
  company: string;
  hydrated: boolean;
  /** Approve the trade account (demo: instant on application). */
  approve: (company: string) => void;
  /** Sign out of the wholesale portal. */
  reset: () => void;
}

export const useWholesaleAccount = create<WholesaleAccountState>()(
  persist(
    (set) => ({
      status: "none",
      company: "",
      hydrated: false,
      approve: (company) => set({ status: "approved", company: company.trim() }),
      reset: () => set({ status: "none", company: "" }),
    }),
    {
      name: "remint-wholesale",
      partialize: (s) => ({ status: s.status, company: s.company }),
      onRehydrateStorage: () => (state) => {
        if (state) state.hydrated = true;
      },
    },
  ),
);
