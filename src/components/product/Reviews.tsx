"use client";

import { useState } from "react";
import { BadgeCheck, ThumbsUp } from "lucide-react";
import { cn } from "@/lib/utils";

type ReviewFilter = "all" | "5" | "4" | "3";

const FILTERS: { value: ReviewFilter; label: string }[] = [
  { value: "all", label: "All reviews" },
  { value: "5", label: "5 star" },
  { value: "4", label: "4 star" },
  { value: "3", label: "3 star & below" },
];

const POOL = [
  {
    stars: 5,
    author: "Marcus T.",
    days: 4,
    title: "Genuinely like new",
    body: "Graded honestly — I cannot find a single mark. Battery has been excellent and it shipped next day.",
  },
  {
    stars: 5,
    author: "Elena R.",
    days: 9,
    title: "Saved a fortune",
    body: "Same phone my coworker paid full price for, for hundreds less. The 12-month warranty made it a no-brainer.",
  },
  {
    stars: 4,
    author: "Devon P.",
    days: 13,
    title: "Great value, tiny scuff",
    body: "There's one faint mark on the frame exactly as the grade described. Screen is flawless. No complaints for the price.",
  },
  {
    stars: 5,
    author: "Aisha K.",
    days: 21,
    title: "Setup was painless",
    body: "Factory reset and clean. Popped my SIM in and was running in five minutes. Would buy again.",
  },
  {
    stars: 3,
    author: "Jordan M.",
    days: 27,
    title: "Good device, slow delivery",
    body: "The phone itself is solid and accurately graded. Shipping took a day longer than estimated, hence 3 stars.",
  },
  {
    stars: 5,
    author: "Priya S.",
    days: 33,
    title: "Battery better than expected",
    body: "Listed health was conservative — mine reads higher. Lasts all day easily. Impressed with the whole process.",
  },
];

function hash(s: string): number {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) >>> 0;
  return h;
}

function distribution(rating: number): number[] {
  // returns [5★%,4★%,3★%,2★%,1★%], sums to 100, avg ≈ rating
  const p5 = Math.round(Math.pow(rating / 5, 4) * 100);
  const rest = 100 - p5;
  const p4 = Math.round(rest * 0.62);
  const p3 = Math.round(rest * 0.24);
  const p2 = Math.round(rest * 0.09);
  const p1 = Math.max(0, 100 - p5 - p4 - p3 - p2);
  return [p5, p4, p3, p2, p1];
}

const starStr = (n: number) => "★★★★★".slice(0, n) + "☆☆☆☆☆".slice(0, 5 - n);

export function Reviews({ rating, count, slug }: { rating: number; count: number; slug: string }) {
  const dist = distribution(rating);
  const start = hash(slug) % POOL.length;
  const picks = [POOL[start], POOL[(start + 2) % POOL.length], POOL[(start + 4) % POOL.length]];
  const recommend = Math.round(Math.min(99, (rating / 5) * 100 + 4));

  const [filter, setFilter] = useState<ReviewFilter>("all");
  const visible = picks.filter((r) => {
    if (filter === "all") return true;
    if (filter === "3") return r.stars <= 3;
    return r.stars === Number(filter);
  });

  return (
    <div className="grid items-start gap-11 lg:grid-cols-[300px_1fr]">
      {/* summary */}
      <div className="scard-bord text-center">
        <div className="text-[54px] font-bold leading-none tracking-[-.03em] text-[#1d1d1f]">
          {rating.toFixed(1)}
        </div>
        <div className="mt-2 text-[18px] tracking-[2px] text-[#0a8f6e]">
          {starStr(Math.round(rating))}
        </div>
        <div className="mt-2 text-[13.5px] text-[#6e6e73]">
          {count.toLocaleString()} verified ratings
        </div>
        <div className="mt-4 border-t border-[#d2d2d7] pt-4 text-[13.5px] text-[#6e6e73]">
          <b className="font-semibold text-[#1d1d1f]">{recommend}%</b> would recommend
          <br />
          to a friend
        </div>
      </div>

      {/* bars + list */}
      <div>
        <div className="flex flex-col gap-[9px]">
          {dist.map((p, i) => (
            <div key={i} className="flex items-center gap-[11px] text-[13px] text-[#6e6e73]">
              <span className="flex w-[30px] flex-none items-center gap-0.5 text-[#86868b]">
                {5 - i}★
              </span>
              <span className="h-[7px] flex-1 overflow-hidden rounded-md bg-[#f5f5f7]">
                <span
                  className="block h-full rounded-md bg-[#0a8f6e]"
                  style={{ width: `${p}%` }}
                />
              </span>
              <span className="w-[34px] flex-none text-right text-[12.5px] text-[#86868b]">
                {p}%
              </span>
            </div>
          ))}
        </div>

        {/* filter chips */}
        <div className="mb-[22px] mt-[22px] flex flex-wrap gap-2.5">
          {FILTERS.map((f) => (
            <button
              key={f.value}
              onClick={() => setFilter(f.value)}
              className={cn(
                "rounded-full border bg-white px-4 py-2 text-[13.5px] font-medium transition-colors",
                filter === f.value
                  ? "border-[#0a8f6e] text-[#1d1d1f]"
                  : "border-[#d2d2d7] text-[#6e6e73] hover:border-[#bfbfc7]",
              )}
            >
              {f.label}
            </button>
          ))}
        </div>

        <div className="flex flex-col">
          {visible.length === 0 && (
            <p className="py-9 text-center text-sm text-[#86868b]">
              No reviews match this filter yet.
            </p>
          )}
          {visible.map((r, i) => (
            <div
              key={i}
              className={cn("py-[22px]", i === 0 ? "pt-0" : "border-t border-[#d2d2d7]")}
            >
              <div className="flex items-center gap-[13px]">
                <div className="grid h-[42px] w-[42px] flex-none place-items-center rounded-full bg-[#f5f5f7] text-[15px] font-semibold text-[#0a8f6e]">
                  {initials(r.author)}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-[9px] text-[15px] font-semibold text-[#1d1d1f]">
                    {r.author}
                    <span className="inline-flex items-center gap-1 rounded-full bg-[rgba(10,143,110,.1)] px-[9px] py-0.5 text-[11px] font-semibold text-[#0a8f6e]">
                      <BadgeCheck className="h-3 w-3" /> Verified buyer
                    </span>
                  </div>
                  <div className="mt-0.5 text-[12.5px] text-[#86868b]">{r.days}d ago</div>
                </div>
                <div className="flex-none text-[13px] tracking-[1.5px] text-[#0a8f6e]">
                  {starStr(r.stars)}
                </div>
              </div>
              <div className="mb-1.5 mt-[13px] text-[15px] font-semibold text-[#1d1d1f]">
                {r.title}
              </div>
              <p className="text-[14.5px] leading-[1.6] text-[#6e6e73]">{r.body}</p>
              <div className="mt-3.5 flex items-center gap-[18px] text-[13px] text-[#86868b]">
                <span className="inline-flex cursor-pointer items-center gap-1.5 hover:text-[#6e6e73]">
                  <ThumbsUp className="h-3.5 w-3.5" /> Helpful
                </span>
                <span>Report</span>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-6 text-center">
          <button className="rounded-full border border-[#d2d2d7] bg-white px-[26px] py-3 text-[15px] font-semibold text-[#1d1d1f] transition-colors hover:bg-[#f5f5f7]">
            Show all {count.toLocaleString()} reviews
          </button>
        </div>
      </div>
    </div>
  );
}

function initials(name: string): string {
  return name
    .split(" ")
    .map((w) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}
