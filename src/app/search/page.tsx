import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { SearchPageClient, SearchHeader } from "./SearchPageClient";

export const metadata: Metadata = {
  title: "Search phones",
  description:
    "Search certified pre-owned iPhone, Samsung Galaxy, Google Pixel and more by model, brand, capacity or colour.",
};

export default function SearchPage() {
  return (
    <div className="pt-12">
      <header className="pagehead">
        <p className="crumb">
          <Link href="/">Home</Link> · Search
        </p>
        <h1 className="ptitle">Search</h1>
        <div className="mt-6 max-w-[560px]">
          <Suspense fallback={<div className="h-[44px] rounded-xl bg-[#f5f5f7]" />}>
            <SearchHeader />
          </Suspense>
        </div>
      </header>

      <Suspense fallback={<div className="shell pb-24" />}>
        <SearchPageClient />
      </Suspense>
    </div>
  );
}
