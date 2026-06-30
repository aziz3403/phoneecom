import type { Metadata } from "next";
import { CartClient } from "@/components/cart/CartClient";
import { getProfile } from "@/lib/profile-actions";

export const metadata: Metadata = {
  title: "Your bag & checkout",
  description: "Review your certified pre-owned phones and check out securely.",
};

export default async function CartPage() {
  const profile = await getProfile();
  const initialProfile = profile
    ? { fullName: profile.fullName, line1: profile.line1, city: profile.city, state: profile.state, zip: profile.zip }
    : null;
  return (
    <div style={{ paddingTop: 30, paddingBottom: 24 }}>
      <div className="shell" style={{ maxWidth: 1080, padding: "0 22px" }}>
        <h1 style={{ fontSize: 27, fontWeight: 700, letterSpacing: "-.02em" }}>Checkout</h1>
      </div>
      <CartClient initialProfile={initialProfile} />
    </div>
  );
}
