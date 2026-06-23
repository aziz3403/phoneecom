import type { Metadata } from "next";
import { CartClient } from "@/components/cart/CartClient";

export const metadata: Metadata = {
  title: "Your bag & checkout",
  description: "Review your certified pre-owned phones and check out securely.",
};

export default function CartPage() {
  return (
    <div className="pt-28">
      <div className="mx-auto max-w-7xl px-5 pb-6 sm:px-8">
        <p className="text-sm text-white/40">Home · Cart</p>
        <h1 className="mt-2 font-display text-4xl font-extrabold tracking-tight text-white sm:text-5xl">
          Checkout
        </h1>
      </div>
      <CartClient />
    </div>
  );
}
