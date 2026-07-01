import type { Metadata } from "next";
import Link from "next/link";
import { ShieldCheck, Search, Ban, BadgeCheck } from "lucide-react";
import { ImeiChecker } from "@/components/imei/ImeiChecker";

export const metadata: Metadata = {
  title: "Free IMEI Check — reMint",
  description:
    "Check any phone's IMEI before you buy or sell it. Every reMint device is verified clean against the GSMA lost/stolen registry before it's listed.",
};

const STEPS = [
  { icon: Search, t: "Find the IMEI", b: "Dial *#06# on any phone, or check Settings → General → About (iPhone) / Settings → About phone (Android)." },
  { icon: ShieldCheck, t: "Validate it here", b: "We check the number's format and check digit instantly, then hand you to the CTIA's official registry lookup." },
  { icon: Ban, t: "Walk away from blacklisted devices", b: "A device reported lost or stolen can be blocked by every major US carrier — don't buy it at any price." },
];

export default function ImeiCheckPage() {
  return (
    <div className="mx-auto w-full max-w-[860px] px-[22px] pb-28 pt-14">
      <div className="text-center">
        <span className="inline-flex items-center gap-1.5 rounded-full bg-[#edf6f0] px-3.5 py-1.5 text-[12.5px] font-semibold text-[#0a7d61]">
          <BadgeCheck className="h-3.5 w-3.5" /> Every reMint device is IMEI-verified clean before listing
        </span>
        <h1 className="mt-4 text-[clamp(30px,5vw,46px)] font-bold leading-[1.05] tracking-[-.03em] text-[#1d1d1f]">
          Free IMEI check
        </h1>
        <p className="mx-auto mt-4 max-w-[560px] text-[16px] leading-relaxed text-[#6e6e73]">
          Buying a used phone anywhere — even not from us? Check its IMEI first. We validate the
          number here and point you to the industry&apos;s official stolen-device registry, the same
          one we run every reMint device through before it goes on sale.
        </p>
      </div>

      <div className="mx-auto mt-10 max-w-[560px]">
        <ImeiChecker />
      </div>

      <div className="mt-14 grid gap-5 sm:grid-cols-3">
        {STEPS.map((s) => (
          <div key={s.t} className="scard-bord">
            <div className="mb-3 grid h-10 w-10 place-items-center rounded-[11px] bg-[#edf6f0] text-[#0a8f6e]">
              <s.icon className="h-[19px] w-[19px]" />
            </div>
            <p className="text-[15px] font-semibold text-[#1d1d1f]">{s.t}</p>
            <p className="mt-1 text-[13px] leading-relaxed text-[#6e6e73]">{s.b}</p>
          </div>
        ))}
      </div>

      <div className="mt-12 rounded-[18px] bg-[#f5f5f7] px-7 py-6">
        <h2 className="text-[18px] font-bold tracking-[-.01em] text-[#1d1d1f]">How reMint uses IMEI checks</h2>
        <p className="mt-2 text-[14px] leading-relaxed text-[#6e6e73]">
          Every device we buy — retail trade-in or wholesale lot — is checked against the GSMA
          device registry via the CTIA&apos;s Stolen Phone Checker before it enters stock, and again
          before it ships to you. Blacklisted or activation-locked devices never make it to the
          storefront. A clean IMEI also can&apos;t guarantee a device isn&apos;t carrier-financed, so we
          verify financing status on trade-ins during inspection.
        </p>
        <p className="mt-3 text-[13px] text-[#86868b]">
          Ready to buy with that peace of mind built in?{" "}
          <Link href="/shop" className="text-[#0a8f6e] underline-offset-2 hover:underline">Browse certified devices</Link>{" "}
          or <Link href="/trade-in" className="text-[#0a8f6e] underline-offset-2 hover:underline">trade yours in</Link>.
        </p>
      </div>
    </div>
  );
}
