"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Heart } from "lucide-react";
import { useWishlist } from "@/lib/wishlist-store";
import { getDevice } from "@/lib/products";
import { ProductCard } from "@/components/ui/ProductCard";

export function WishlistClient() {
  const slugs = useWishlist((s) => s.slugs);
  const clear = useWishlist((s) => s.clear);
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  if (!mounted) {
    return (
      <div className="grid-cards">
        {[0, 1, 2, 3].map((i) => (
          <div
            key={i}
            className="scard"
            style={{ height: 320, animation: "pulse 1.6s ease-in-out infinite" }}
          />
        ))}
      </div>
    );
  }

  const devices = slugs.map(getDevice).filter((d): d is NonNullable<typeof d> => Boolean(d));

  if (devices.length === 0) {
    return (
      <div className="shell-narrow" style={{ textAlign: "center", padding: "60px 22px" }}>
        <div
          style={{
            width: 80,
            height: 80,
            borderRadius: "50%",
            background: "var(--gray)",
            display: "grid",
            placeItems: "center",
            margin: "0 auto",
            color: "var(--text3)",
          }}
        >
          <Heart className="h-9 w-9" />
        </div>
        <h2 className="h2" style={{ marginTop: 24, fontSize: "clamp(26px,3.4vw,38px)" }}>
          No saved devices yet
        </h2>
        <p className="psub" style={{ margin: "10px auto 0" }}>
          Tap the heart on any device to save it here for later.
        </p>
        <div style={{ marginTop: 28 }}>
          <Link className="btn" href="/shop">
            Browse the collection
          </Link>
        </div>
      </div>
    );
  }

  return (
    <>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: 24,
        }}
      >
        <p style={{ fontSize: 15, color: "var(--text2)" }}>
          <span style={{ fontWeight: 600, color: "var(--text)" }}>{devices.length}</span> saved
        </p>
        <button className="link" onClick={clear} style={{ fontSize: 15 }}>
          Clear all
        </button>
      </div>
      <div className="grid-cards">
        {devices.map((d, i) => (
          <ProductCard key={d.id} device={d} index={i} />
        ))}
      </div>
    </>
  );
}
