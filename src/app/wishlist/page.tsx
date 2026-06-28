import type { Metadata } from "next";
import Link from "next/link";
import { WishlistClient } from "./WishlistClient";

export const metadata: Metadata = {
  title: "Your wishlist",
  description: "Devices you've saved on reMint — certified pre-owned iPhone, Galaxy and iPad.",
};

export default function WishlistPage() {
  return (
    <>
      <div className="pagehead">
        <p className="crumb">
          <Link href="/">Home</Link> · Wishlist
        </p>
        <h1 className="ptitle">Saved for later</h1>
      </div>

      <section className="sec" style={{ paddingTop: 40 }}>
        <div className="shell">
          <WishlistClient />
        </div>
      </section>
    </>
  );
}
