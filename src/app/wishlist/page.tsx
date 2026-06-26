import type { Metadata } from "next";
import { WishlistClient } from "@/components/wishlist/WishlistClient";

export const metadata: Metadata = {
  title: "Your wishlist",
  description: "Devices you've saved for later.",
};

export default function WishlistPage() {
  return (
    <div className="pt-28">
      <div className="mx-auto max-w-7xl px-5 pb-6 sm:px-8">
        <p className="text-sm text-white/40">Home · Wishlist</p>
        <h1 className="mt-2 font-display text-4xl font-extrabold tracking-tight text-white sm:text-5xl">
          Saved for later
        </h1>
      </div>
      <WishlistClient />
    </div>
  );
}
