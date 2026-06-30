"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Plus, Check, Heart } from "lucide-react";
import { useState } from "react";
import { type Device, baseStorage, fromPrice } from "@/lib/products";
import { useCart } from "@/lib/cart-store";
import { useWishlist } from "@/lib/wishlist-store";
import { useStockFor } from "@/lib/stock-context";
import { formatPrice, cn } from "@/lib/utils";
import { PhImg } from "@/components/home/PhImg";

export function ProductCard({ device, index = 0 }: { device: Device; index?: number }) {
  const add = useCart((s) => s.add);
  const wished = useWishlist((s) => s.slugs.includes(device.slug));
  const toggleWish = useWishlist((s) => s.toggle);
  const [added, setAdded] = useState(false);

  const base = baseStorage(device);
  // One listing per model: show the lowest (Fair-grade) price; grade is chosen on the PDP.
  const price = fromPrice(device);
  const off = base.original > 0 ? Math.round((1 - price / base.original) * 100) : 0;
  const color = device.colors[0];
  const minGb = Math.min(...device.storage.map((s) => s.gb));
  const maxGb = Math.max(...device.storage.map((s) => s.gb));
  const stock = useStockFor(device.slug, device.stock);
  const outOfStock = stock <= 0;

  function handleAdd(e: React.MouseEvent) {
    e.preventDefault();
    add({
      slug: device.slug,
      name: device.name,
      brand: device.brand,
      type: device.type,
      colorName: color.name,
      colorHex: color.hex,
      accent: color.accent,
      gb: base.gb,
      grade: device.grade,
      mode: "retail",
      retailPrice: base.price,
      wholesaleBase: base.wholesale,
      original: base.original,
    });
    setAdded(true);
    setTimeout(() => setAdded(false), 1400);
  }

  function handleWish(e: React.MouseEvent) {
    e.preventDefault();
    toggleWish(device.slug);
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{ duration: 0.5, delay: (index % 4) * 0.06, ease: [0.22, 1, 0.36, 1] }}
      style={{ height: "100%" }}
    >
      <Link href={`/product/${device.slug}`} className="pcard" style={{ height: "100%" }}>
        <PhImg slug={device.slug} src={color.image ?? device.image} label={device.name} className="pimg">
          {off > 0 && <span className="pdisc">−{off}%</span>}
        </PhImg>
        <div className="pbody">
          <div className="pname">{device.name}</div>
          <div className="pcap">
            {minGb}
            {maxGb !== minGb ? `–${maxGb}` : ""}GB · 80%+ battery · ★{device.rating}
          </div>
          <div className="pdots">
            {device.colors.slice(0, 5).map((c) => (
              <span className="dot" key={c.name} title={c.name} style={{ background: c.hex }} />
            ))}
          </div>
          <div className="pfoot">
            <div className="pprice">
              {outOfStock ? (
                <span style={{ fontSize: 13.5, fontWeight: 600, color: "var(--text3)" }}>Restocking soon</span>
              ) : (
                <>
                  <small>from</small> {formatPrice(price)}
                </>
              )}
            </div>
            <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
              <button
                onClick={handleWish}
                aria-label="Save to wishlist"
                className={cn("iconbtn", wished && "wished")}
              >
                <Heart className="h-4 w-4" fill={wished ? "currentColor" : "none"} />
              </button>
              {!outOfStock && (
                <button onClick={handleAdd} aria-label={`Add ${device.name} to bag`} className={cn("addbtn", added && "added")}>
                  {added ? <Check className="h-5 w-5" /> : <Plus className="h-5 w-5" />}
                </button>
              )}
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}
