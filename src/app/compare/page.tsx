import type { Metadata } from "next";
import { CompareClient } from "@/components/compare/CompareClient";
import { AuroraBackground } from "@/components/ui/AuroraBackground";

export const metadata: Metadata = {
  title: "Compare devices",
  description: "Compare certified pre-owned phones and iPads side by side — price, chip, display, battery, cameras and condition.",
};

export default function ComparePage() {
  return (
    <div className="pt-24">
      <section className="relative overflow-hidden">
        <AuroraBackground />
        <div className="mx-auto max-w-7xl px-5 py-12 sm:px-8">
          <p className="text-sm text-white/40">Home · Compare</p>
          <h1 className="mt-2 font-display text-4xl font-extrabold tracking-tight text-white sm:text-5xl">
            Compare devices
          </h1>
          <p className="mt-3 max-w-xl text-white/55">
            Line up to three devices side by side and see exactly how they stack up.
          </p>
        </div>
      </section>

      <div className="mx-auto max-w-7xl px-5 pb-24 sm:px-8">
        <CompareClient />
      </div>
    </div>
  );
}
