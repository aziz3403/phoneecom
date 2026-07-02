import { cn } from "@/lib/utils";

const MARKS = ["Visa", "Mastercard", "Amex", "Discover", "Apple Pay", "Google Pay", "Klarna", "Affirm"];

/** Accepted-payment marks — quiet text chips (no third-party brand art to
 * license), used in the footer and near the pay button. */
export function PaymentMarks({ className, compact = false }: { className?: string; compact?: boolean }) {
  const list = compact ? MARKS.slice(0, 6) : MARKS;
  return (
    <div className={cn("flex flex-wrap items-center gap-1.5", className)}>
      {list.map((m) => (
        <span
          key={m}
          className="inline-flex h-[22px] items-center rounded-[5px] border border-[#dcdce0] bg-white px-[7px] text-[10.5px] font-semibold tracking-[.02em] text-[#4b4b50]"
        >
          {m}
        </span>
      ))}
    </div>
  );
}
