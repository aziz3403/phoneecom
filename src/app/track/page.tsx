import type { Metadata } from "next";
import { PackageSearch } from "lucide-react";
import { TrackClient } from "@/components/track/TrackClient";

export const metadata: Metadata = {
  title: "Track your order or trade-in — reMint",
  description:
    "Check the status of any reMint order or trade-in with your reference number and email — no account needed.",
};

export default function TrackPage() {
  return (
    <div className="mx-auto w-full max-w-[640px] px-[22px] pb-28 pt-14">
      <div className="text-center">
        <div className="mx-auto grid h-14 w-14 place-items-center rounded-full bg-[#edf6f0] text-[#0a8f6e]">
          <PackageSearch className="h-7 w-7" />
        </div>
        <h1 className="mt-4 text-[clamp(30px,5vw,44px)] font-bold leading-[1.05] tracking-[-.03em] text-[#1d1d1f]">
          Track anything, no account needed
        </h1>
        <p className="mx-auto mt-4 max-w-[460px] text-[16px] leading-relaxed text-[#6e6e73]">
          Orders (<b className="font-semibold text-[#1d1d1f]">RM-123456</b>) and trade-ins
          (<b className="font-semibold text-[#1d1d1f]">TI-123456</b>) can both be checked here —
          just use the reference from your confirmation email and the email you used.
        </p>
      </div>
      <div className="mt-9">
        <TrackClient />
      </div>
      <p className="mt-8 text-center text-[13px] leading-relaxed text-[#86868b]">
        Have an account? Everything you&apos;ve bought or traded with this email shows up
        automatically in <a href="/account" className="text-[#0a8f6e] underline-offset-2 hover:underline">your dashboard</a> —
        including anything you did as a guest before signing up.
      </p>
    </div>
  );
}
