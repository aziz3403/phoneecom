import { Star, BadgeCheck, ThumbsUp } from "lucide-react";

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

export function Reviews({ rating, count, slug }: { rating: number; count: number; slug: string }) {
  const dist = distribution(rating);
  const start = hash(slug) % POOL.length;
  const picks = [POOL[start], POOL[(start + 2) % POOL.length], POOL[(start + 4) % POOL.length]];

  return (
    <div className="grid gap-8 lg:grid-cols-[320px_1fr]">
      {/* summary */}
      <div className="rounded-3xl border border-white/10 bg-ink-850/50 p-6">
        <div className="flex items-end gap-3">
          <span className="font-display text-5xl font-extrabold text-white">{rating.toFixed(1)}</span>
          <div className="pb-1">
            <div className="flex">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star
                  key={i}
                  className={
                    i < Math.round(rating) ? "h-4 w-4 fill-amber-400 text-amber-400" : "h-4 w-4 text-white/20"
                  }
                />
              ))}
            </div>
            <p className="mt-1 text-xs text-white/45">{count.toLocaleString()} verified reviews</p>
          </div>
        </div>

        <div className="mt-5 space-y-1.5">
          {dist.map((p, i) => (
            <div key={i} className="flex items-center gap-2 text-xs text-white/50">
              <span className="w-3">{5 - i}</span>
              <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
              <span className="h-2 flex-1 overflow-hidden rounded-full bg-white/10">
                <span className="block h-full rounded-full bg-amber-400/70" style={{ width: `${p}%` }} />
              </span>
              <span className="w-8 text-right">{p}%</span>
            </div>
          ))}
        </div>

        <button className="mt-6 w-full rounded-full border border-white/15 py-2.5 text-sm font-medium text-white transition hover:bg-white/5">
          Write a review
        </button>
      </div>

      {/* list */}
      <div className="space-y-4">
        {picks.map((r, i) => (
          <div key={i} className="rounded-3xl border border-white/10 bg-ink-850/40 p-5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="flex">
                  {Array.from({ length: 5 }).map((_, s) => (
                    <Star
                      key={s}
                      className={s < r.stars ? "h-3.5 w-3.5 fill-amber-400 text-amber-400" : "h-3.5 w-3.5 text-white/20"}
                    />
                  ))}
                </div>
                <span className="font-medium text-white">{r.title}</span>
              </div>
              <span className="text-xs text-white/35">{r.days}d ago</span>
            </div>
            <p className="mt-2 text-sm text-white/65">{r.body}</p>
            <div className="mt-3 flex items-center gap-3 text-xs text-white/40">
              <span className="inline-flex items-center gap-1 text-mint-300">
                <BadgeCheck className="h-3.5 w-3.5" /> Verified buyer
              </span>
              <span>· {r.author}</span>
              <span className="ml-auto inline-flex items-center gap-1">
                <ThumbsUp className="h-3.5 w-3.5" /> Helpful
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
