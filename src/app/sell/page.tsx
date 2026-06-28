import type { Metadata } from "next";
import Link from "next/link";
import { Search, Tag, Truck, Banknote } from "lucide-react";
import { SellEstimator } from "@/components/sell/SellEstimator";

export const metadata: Metadata = {
  title: "Sell or trade in your phone",
  description:
    "Get an instant quote for your old iPhone, Galaxy or iPad. Free prepaid shipping, paid in 2 business days — or take 10% more in store credit.",
};

const STEPS = [
  { icon: Search, title: "Get your quote", body: "Pick your device and condition for an instant cash or credit offer." },
  { icon: Truck, title: "Ship it free", body: "We email a prepaid label. Box it up and drop it off — on us." },
  { icon: Tag, title: "We inspect it", body: "Our lab verifies the condition against your quote within a day." },
  { icon: Banknote, title: "Get paid fast", body: "Money hits your account in 2 business days, or credit instantly." },
];

export default function SellPage() {
  return (
    <div className="pt-12">
      <header className="pagehead">
        <p className="crumb">
          <Link href="/">Home</Link> · Sell &amp; trade-in
        </p>
        <h1 className="ptitle">Your old phone is worth something.</h1>
        <p className="psub">
          Answer a few quick questions for an instant offer. Ship it free, get paid in two days — or
          take 10% more as store credit toward your next upgrade.
        </p>
        <div className="mt-6 flex flex-wrap gap-x-7 gap-y-2 text-sm text-[#6e6e73]">
          {["Instant quote", "Free prepaid shipping", "Paid in 48 hours", "Price-lock 14 days"].map((t) => (
            <span key={t} className="inline-flex items-center gap-2">
              <span className="inline-block h-[5px] w-[5px] rounded-full bg-[#0a8f6e]" />
              {t}
            </span>
          ))}
        </div>
      </header>

      <div className="shell pt-10">
        <SellEstimator />
      </div>

      <section className="graysec mt-24">
        <div className="sechead ctr">
          <p className="eyebrow">How trade-in works</p>
          <h2 className="h2">Four steps, zero hassle.</h2>
        </div>
        <div className="shell grid gap-5 md:grid-cols-2 lg:grid-cols-4">
          {STEPS.map((s, i) => (
            <div key={s.title} className="scard-bord h-full">
              <div className="mb-4 grid h-11 w-11 place-items-center rounded-[12px] bg-[#edf6f0] text-[#0a8f6e]">
                <s.icon className="h-5 w-5" />
              </div>
              <h3 className="text-[17px] font-semibold tracking-[-.01em] text-[#1d1d1f]">
                {i + 1}. {s.title}
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-[#6e6e73]">{s.body}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
