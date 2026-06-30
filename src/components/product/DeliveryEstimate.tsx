"use client";

import { useEffect, useState } from "react";
import { Truck } from "lucide-react";
import { deliveryWindow, type DeliveryWindow } from "@/lib/delivery";

/**
 * Shows "Arrives <date range>" for free standard shipping. Computed on the
 * client after mount so the date reflects the visitor's current day (and never
 * mismatches the server-rendered HTML).
 */
export function DeliveryEstimate({ className, style }: { className?: string; style?: React.CSSProperties }) {
  const [win, setWin] = useState<DeliveryWindow | null>(null);
  useEffect(() => setWin(deliveryWindow(false)), []);

  return (
    <span
      className={className}
      style={{ display: "inline-flex", alignItems: "center", gap: 7, ...style }}
    >
      <Truck className="h-4 w-4 shrink-0" style={{ color: "var(--accent)" }} />
      {win ? (
        <span>
          Free shipping · arrives <b>{win.rangeLabel}</b>
        </span>
      ) : (
        <span>Free shipping · 5–7 business days</span>
      )}
    </span>
  );
}
