"use client";

import { useEffect, useRef, useState } from "react";
import { renderSrc } from "@/lib/products";

interface PhImgProps {
  /** device slug → /renders/<slug>.png */
  slug?: string;
  /** explicit image url (overrides slug) */
  src?: string;
  /** placeholder label shown when no image / image fails */
  label: string;
  /** extra classes appended after `ph` (e.g. "pimg", "timg", "phscreen") */
  className?: string;
  style?: React.CSSProperties;
  children?: React.ReactNode;
}

/**
 * Renders the design's neutral `.ph` tile. If a real product render exists it
 * fills the tile; otherwise it falls back to the small placeholder label — so a
 * tile is never broken. Badges/overlays can be passed as `children`.
 *
 * Note: the image can 404 (e.g. live-inventory models with no render) before
 * React hydrates and attaches onError, so we also re-check `complete &&
 * naturalWidth===0` on mount to swap in the placeholder.
 */
export function PhImg({ slug, src, label, className, style, children }: PhImgProps) {
  const [ok, setOk] = useState(true);
  const ref = useRef<HTMLImageElement>(null);
  const url = src && src.length > 0 ? src : slug ? renderSrc(slug) : undefined;

  useEffect(() => {
    setOk(true);
    const img = ref.current;
    if (img && img.complete && img.naturalWidth === 0) setOk(false);
  }, [url]);

  return (
    <div className={className ? `ph ${className}` : "ph"} style={style}>
      {url && ok ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img ref={ref} src={url} alt={label} loading="lazy" onError={() => setOk(false)} />
      ) : (
        <span className="phlbl">{label}</span>
      )}
      {children}
    </div>
  );
}
