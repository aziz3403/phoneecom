import type { Metadata } from "next";
import Link from "next/link";
import { CartClient } from "@/components/cart/CartClient";

export const metadata: Metadata = {
  title: "Your bag & checkout",
  description: "Review your certified pre-owned phones and check out securely.",
};

export default function CartPage() {
  return (
    <div className="pt-12">
      <header className="pagehead">
        <p className="crumb">
          <Link href="/">Home</Link> · Cart
        </p>
        <h1 className="ptitle">Checkout</h1>
        <p className="psub">
          Review your certified devices, then check out securely — free 2-day shipping and a
          12-month warranty on every order.
        </p>
      </header>
      <CartClient />
    </div>
  );
}
