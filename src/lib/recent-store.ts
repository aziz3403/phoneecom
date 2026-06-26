"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

const MAX = 8;

interface RecentState {
  slugs: string[];
  hydrated: boolean;
  visit: (slug: string) => void;
}

export const useRecent = create<RecentState>()(
  persist(
    (set) => ({
      slugs: [],
      hydrated: false,
      visit: (slug) =>
        set((s) => ({ slugs: [slug, ...s.slugs.filter((x) => x !== slug)].slice(0, MAX) })),
    }),
    {
      name: "remint-recent",
      partialize: (s) => ({ slugs: s.slugs }),
      onRehydrateStorage: () => (state) => {
        if (state) state.hydrated = true;
      },
    },
  ),
);
