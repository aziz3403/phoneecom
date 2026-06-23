import { Marquee } from "@/components/ui/Marquee";
import { BRANDS } from "@/lib/products";

export function TrustMarquee() {
  return (
    <div className="relative border-y border-white/10 bg-white/[0.02] py-7">
      <p className="mb-5 text-center text-xs uppercase tracking-[0.25em] text-white/35">
        Every major brand · unlocked · network-ready
      </p>
      <Marquee>
        {BRANDS.concat(BRANDS).map((b, i) => (
          <span
            key={`${b}-${i}`}
            className="font-display text-2xl font-semibold text-white/30 transition-colors hover:text-white/70 sm:text-3xl"
          >
            {b}
          </span>
        ))}
      </Marquee>
    </div>
  );
}
