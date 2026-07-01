import Link from "next/link";
import { ShieldCheck, BadgeDollarSign, Truck } from "lucide-react";

/**
 * Slim site-wide strip above the nav: the three things every visitor should
 * absorb before anything else — you save money, you're protected, shipping's
 * free. Static (no JS), one line, quieter than the nav.
 */
export function TopBar() {
  return (
    <div className="bg-[#1d1d1f] text-white">
      <div className="mx-auto flex w-full max-w-[1280px] items-center justify-center gap-6 px-[22px] py-[7px] text-[12px] font-medium tracking-[.01em]">
        <span className="inline-flex items-center gap-1.5 opacity-90">
          <BadgeDollarSign className="h-3.5 w-3.5 text-[#41d6a0]" />
          Save up to 40% vs new
        </span>
        <span className="hidden items-center gap-1.5 opacity-90 sm:inline-flex">
          <ShieldCheck className="h-3.5 w-3.5 text-[#41d6a0]" />
          12-month warranty · 30-day returns
        </span>
        <span className="hidden items-center gap-1.5 opacity-90 md:inline-flex">
          <Truck className="h-3.5 w-3.5 text-[#41d6a0]" />
          Free US shipping
        </span>
        <Link
          href="/trade-in"
          className="hidden items-center gap-1.5 opacity-90 underline-offset-2 hover:underline lg:inline-flex"
        >
          Selling? We pay among the highest in the US ›
        </Link>
      </div>
    </div>
  );
}
