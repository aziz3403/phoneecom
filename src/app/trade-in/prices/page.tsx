import type { Metadata } from "next";
import Link from "next/link";
import { Trophy } from "lucide-react";
import { getTradeInModels } from "@/lib/trade-in-pricing";
import { PriceList } from "@/components/trade-in/PriceList";
import { BulkQuote } from "@/components/trade-in/BulkQuote";

export const metadata: Metadata = {
  title: "Buyback price list — what we pay for your phone",
  description:
    "See what reMint pays for 110+ iPhone, Galaxy and iPad models across every grade. Sell one or a whole batch — bulk bonus pricing, free shipping at 5+, fast payment.",
};

export default async function PricesPage() {
  const { models, live } = await getTradeInModels();

  return (
    <div className="pt-12">
      <header className="pagehead">
        <p className="crumb">
          <Link href="/">Home</Link> · <Link href="/trade-in">Trade-in</Link> · Price list
        </p>
        <span className="mb-3 mr-2 inline-flex items-center gap-1.5 rounded-full bg-[#edf6f0] px-3.5 py-1.5 text-[12.5px] font-semibold text-[#0a7d61]">
          <Trophy className="h-3.5 w-3.5" /> The prices we pay — matched &amp; beaten
        </span>
        <span className="mb-3 inline-flex items-center gap-1.5 rounded-full bg-[#eef2fb] px-3.5 py-1.5 text-[12.5px] font-semibold text-[#3b5bb8]">
          <span className="inline-block h-1.5 w-1.5 rounded-full bg-[#3b5bb8]" />
          {live ? "Synced live with our price book — refreshed hourly" : "From our current price book"}
        </span>
        <h1 className="ptitle">Our buyback price list.</h1>
        <p className="psub">
          Exactly what we pay for {models.length}+ iPhone, Galaxy and iPad models, by grade. Sell a
          single device in the{" "}
          <Link href="/trade-in" className="link">instant estimator</Link>, or send a whole batch below.
        </p>
      </header>

      <div className="shell pt-8">
        <PriceList models={models} />
      </div>

      <section id="bulk" className="graysec mt-20 scroll-mt-[74px]">
        <div className="shell">
          <BulkQuote />
        </div>
      </section>
    </div>
  );
}
