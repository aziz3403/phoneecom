import type { Metadata } from "next";
import { CartClient } from "@/components/cart/CartClient";

export const metadata: Metadata = {
  title: "Your bag & checkout",
  description: "Review your certified pre-owned phones and check out securely.",
};

export default function CartPage() {
  return (
    <div style={{ paddingTop: 30, paddingBottom: 24 }}>
      <div className="shell" style={{ maxWidth: 1080, padding: "0 22px" }}>
        <h1 style={{ fontSize: 27, fontWeight: 700, letterSpacing: "-.02em" }}>Checkout</h1>
      </div>
      <CartClient />
    </div>
  );
}
