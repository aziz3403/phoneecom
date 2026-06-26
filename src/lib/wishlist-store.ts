"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

interface WishlistState {
  slugs: string[];
  hydrated: boolean;
  toggle: (slug: string) => void;
  remove: (slug: string) => void;
  clear: () => void;
}

export const useWishlist = create<WishlistState>()(
  persist(
    (set) => ({
      slugs: [],
      hydrated: false,
      toggle: (slug) =>
        set((s) => ({
          slugs: s.slugs.includes(slug) ? s.slugs.filter((x) => x !== slug) : [slug, ...s.slugs],
        })),
      remove: (slug) => set((s) => ({ slugs: s.slugs.filter((x) => x !== slug) })),
      clear: () => set({ slugs: [] }),
    }),
    {
      name: "remint-wishlist",
      partialize: (s) => ({ slugs: s.slugs }),
      onRehydrateStorage: () => (state) => {
        if (state) state.hydrated = true;
      },
    },
  ),
);
