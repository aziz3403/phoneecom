import type { Metadata } from "next";
import Link from "next/link";
import { CompareClient } from "@/components/compare/CompareClient";

export const metadata: Metadata = {
  title: "Compare devices",
  description: "Compare certified pre-owned phones and iPads side by side — price, chip, display, battery, cameras and condition.",
};

export default function ComparePage() {
  return (
    <div className="pt-12">
      <header className="pagehead">
        <p className="crumb">
          <Link href="/">Home</Link> · Compare
        </p>
        <h1 className="ptitle">Compare devices</h1>
        <p className="psub">
          Compare up to 3 devices side by side and see exactly how they stack up — the best value
          in each row is highlighted in green.
        </p>
      </header>

      <div className="shell pb-24 pt-6">
        <CompareClient />
      </div>
    </div>
  );
}
