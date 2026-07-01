"use client";

import { FileSpreadsheet } from "lucide-react";
import type { OrderLine } from "@/lib/orders";
import { GRADES } from "@/lib/grades";

/**
 * Downloads the wholesale order manifest as CSV — one row per unit (model,
 * capacity, color, grade, unit price, IMEI). IMEIs are assigned at pick/pack,
 * so before dispatch the column reads "assigned at dispatch"; the final
 * manifest with real IMEIs is emailed with the shipment.
 */
export function ManifestDownload({
  orderId,
  lines,
  shipped,
}: {
  orderId: string;
  lines: OrderLine[];
  shipped: boolean;
}) {
  function download() {
    const rows: string[][] = [["Order", "Line", "Unit", "Model", "Capacity (GB)", "Color", "Grade", "Unit price (USD)", "IMEI"]];
    let n = 0;
    lines.forEach((l, li) => {
      for (let u = 0; u < l.qty; u++) {
        n += 1;
        rows.push([
          orderId,
          String(li + 1),
          String(n),
          l.name,
          String(l.gb),
          l.colorName,
          l.grade ? GRADES[l.grade].label : "—",
          String(l.unit),
          shipped ? "see dispatch email" : "assigned at dispatch",
        ]);
      }
    });
    const csv = rows
      .map((r) => r.map((c) => (/[",\n]/.test(c) ? `"${c.replace(/"/g, '""')}"` : c)).join(","))
      .join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `remint-manifest-${orderId}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <button
      onClick={download}
      className="link inline-flex items-center gap-1.5"
      style={{ fontSize: 13.5 }}
    >
      <FileSpreadsheet className="h-4 w-4" /> Download manifest (CSV)
    </button>
  );
}
