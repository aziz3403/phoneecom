"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Star, ShieldCheck, Truck, ScanLine, Check, Boxes, Heart } from "lucide-react";
import { type Device, baseStorage, storageFor, renderSrc } from "@/lib/products";
import { useCart } from "@/lib/cart-store";
import { useWishlist } from "@/lib/wishlist-store";
import { useRecent } from "@/lib/recent-store";
import { GRADES, GRADE_ORDER, type GradeId } from "@/lib/grades";
import { unitPrice, MOQ } from "@/lib/wholesale";
import { formatPrice, pct, cn } from "@/lib/utils";
import { GradeBadge } from "@/components/ui/Badge";
import { Button, ButtonLink } from "@/components/ui/Button";
import { PhImg } from "@/components/home/PhImg";
import { WearOverlay } from "@/components/ui/WearOverlay";

const scoreOf = (id: GradeId) => GRADES[id].score;

// Per-grade showcase content for the "see before you buy" condition panel.
// Meter widths/values and the contextual value pill mirror the approved design.
const SHOWCASE: Record<
  GradeId,
  { pill: string; meters: [string, string, string][]; desc: string }
> = {
  pristine: {
    pill: "Save up to 15% vs Excellent",
    desc: "No visible wear under any lighting. Screen and body are flawless to the naked eye — the closest thing to brand-new without the brand-new price.",
    meters: [
      ["Screen", "w0", "Flawless"],
      ["Back glass", "w0", "Flawless"],
      ["Frame", "w0", "Flawless"],
    ],
  },
  excellent: {
    pill: "Most popular",
    desc: "Only the faintest micro-marks, invisible during everyday use. You'd need to angle it under direct light to find anything at all.",
    meters: [
      ["Screen", "w1", "Faint"],
      ["Back glass", "w1", "Faint"],
      ["Frame", "w1", "Minimal"],
    ],
  },
  good: {
    pill: "Best value",
    desc: "Minor scratches visible up close and light frame wear at the corners. Nothing that affects the display or daily use — just a phone that's been lived with.",
    meters: [
      ["Screen", "w1", "Light"],
      ["Back glass", "w2", "Visible"],
      ["Frame", "w2", "Visible"],
    ],
  },
  fair: {
    pill: "Lowest price",
    desc: "Noticeable scratches and possible deeper marks or minor dents on the frame. The biggest savings for buyers who care about what a phone does, not how it looks.",
    meters: [
      ["Screen", "w2", "Visible"],
      ["Back glass", "w3", "Marked"],
      ["Frame", "w3", "Marked"],
    ],
  },
};

export function ProductExperience({ device }: { device: Device }) {
  const router = useRouter();
  const add = useCart((s) => s.add);
  const setOpen = useCart((s) => s.setOpen);
  const wished = useWishlist((s) => s.slugs.includes(device.slug));
  const toggleWish = useWishlist((s) => s.toggle);
  const visit = useRecent((s) => s.visit);

  const [colorIdx, setColorIdx] = useState(0);
  const [gb, setGb] = useState(baseStorage(device).gb);
  const [gradeId, setGradeId] = useState<GradeId>(device.grade);
  const [qty, setQty] = useState(1);
  const [added, setAdded] = useState(false);

  useEffect(() => {
    visit(device.slug);
  }, [device.slug, visit]);

  const color = device.colors[colorIdx];
  const sOpt = storageFor(device, gb);
  const mult = 1 + (scoreOf(gradeId) - scoreOf(device.grade)) * 0.06;
  const priceFor = (base: number) => Math.round(base * mult);
  const price = priceFor(sOpt.price);
  const off = pct(price, sOpt.original);
  const bulkUnit = unitPrice(sOpt.wholesale, MOQ);
  const lowStock = device.stock <= 18;

  function buildItem() {
    return {
      slug: device.slug,
      name: device.name,
      brand: device.brand,
      type: device.type,
      colorName: color.name,
      colorHex: color.hex,
      accent: color.accent,
      gb,
      grade: gradeId,
      mode: "retail" as const,
      retailPrice: price,
      wholesaleBase: sOpt.wholesale,
      original: sOpt.original,
    };
  }

  function addToCart() {
    add(buildItem(), qty);
    setAdded(true);
    setTimeout(() => setAdded(false), 1500);
  }
  function buyNow() {
    add(buildItem(), qty);
    setOpen(false);
    router.push("/cart");
  }

  const show = SHOWCASE[gradeId];
  const grade = GRADES[gradeId];

  return (
    <>
    <div className="grid items-start gap-[60px] lg:grid-cols-[1.08fr_0.92fr]">
      {/* gallery */}
      <div className="lg:sticky lg:top-[74px]">
        <PhImg
          slug={device.slug}
          src={color.image ?? device.image ?? renderSrc(device.slug)}
          label={`${device.name} — ${color.name}`}
          className="!aspect-[4/5] !rounded-[26px]"
        >
          <span className="absolute left-[18px] top-[18px] rounded-full bg-white/80 px-[13px] py-1.5 text-xs font-semibold text-[#6e6e73] backdrop-blur">
            {color.name} · {GRADES[gradeId].label}
          </span>
        </PhImg>
      </div>

      {/* buy box */}
      <div>
        <div className="flex flex-wrap items-center gap-3">
          <GradeBadge grade={gradeId} />
          <span className="inline-flex items-center gap-1.5 text-sm text-[#6e6e73]">
            <Star className="h-4 w-4 fill-[#0a8f6e] text-[#0a8f6e]" />
            <b className="font-semibold text-[#1d1d1f]">{device.rating}</b> ·{" "}
            {device.reviews.toLocaleString()} verified ratings
          </span>
          {device.fiveG && <span className="tag accent">5G</span>}
        </div>

        <p className="mt-4 text-sm font-semibold text-[#0a8f6e]">{device.brand}</p>
        <h1 className="mt-1 text-[clamp(28px,3.4vw,40px)] font-bold leading-[1.07] tracking-[-.025em] text-[#1d1d1f]">
          {device.name}
        </h1>
        <p className="mt-1.5 text-[15px] text-[#6e6e73]">
          Certified pre-owned · fully unlocked · 80%+ battery
        </p>

        <div className="mt-[22px] flex flex-wrap items-baseline gap-3 border-b border-[#d2d2d7] pb-[22px]">
          <span className="text-[34px] font-bold tracking-[-.02em] text-[#1d1d1f]">
            {formatPrice(price)}
          </span>
          {off > 0 && (
            <>
              <span className="text-lg text-[#86868b] line-through">
                {formatPrice(sOpt.original)}
              </span>
              <span className="rounded-full bg-[rgba(10,143,110,.1)] px-3 py-1.5 text-[13px] font-semibold text-[#0a8f6e]">
                Save {formatPrice(sOpt.original - price)} ({off}%)
              </span>
            </>
          )}
        </div>
        <p className="mt-[9px] text-[13px] text-[#86868b]">
          or {formatPrice(Math.round(price / 12))}/mo. for 12 mo. at 0% APR · free 2-day shipping
        </p>

        {/* color */}
        <div className="mt-[26px]">
          <div className="mb-3 flex items-baseline justify-between text-[15px] font-semibold text-[#1d1d1f]">
            <span>Color</span>
            <span className="font-normal text-[#6e6e73]">{color.name}</span>
          </div>
          <div className="flex flex-wrap gap-3.5">
            {device.colors.map((c, i) => (
              <button
                key={c.name}
                onClick={() => setColorIdx(i)}
                title={c.name}
                aria-label={c.name}
                className={cn("swatch", i === colorIdx && "on")}
                style={{ background: c.hex }}
              />
            ))}
          </div>
        </div>

        {/* storage */}
        <div className="mt-[26px]">
          <div className="mb-3 flex items-baseline justify-between text-[15px] font-semibold text-[#1d1d1f]">
            <span>Capacity</span>
            <span className="font-normal text-[#6e6e73]">{gb}GB</span>
          </div>
          <div className="flex flex-wrap gap-2.5">
            {device.storage.map((s) => (
              <button
                key={s.gb}
                onClick={() => setGb(s.gb)}
                className={cn("chip", gb === s.gb && "on accent")}
              >
                <span className="font-semibold">{s.gb}GB</span>
                <span className={cn("text-xs", gb === s.gb ? "text-white/80" : "text-[#86868b]")}>
                  {formatPrice(priceFor(s.price))}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* condition */}
        <div className="mt-[26px]">
          <div className="mb-3 flex items-baseline justify-between text-[15px] font-semibold text-[#1d1d1f]">
            <span>Condition grade</span>
            <span className="font-normal text-[#6e6e73]">function guaranteed on all</span>
          </div>
          <div className="flex flex-col gap-2.5">
            {GRADE_ORDER.map((id) => {
              const g = GRADES[id];
              const p =
                priceFor(sOpt.price) +
                Math.round(sOpt.price * (scoreOf(id) - scoreOf(gradeId)) * 0.06);
              const save = sOpt.original > 0 ? Math.round((1 - p / sOpt.original) * 100) : 0;
              const active = id === gradeId;
              return (
                <button
                  key={id}
                  onClick={() => setGradeId(id)}
                  className={cn(
                    "flex items-center gap-3.5 rounded-[14px] border bg-white px-4 py-3.5 text-left transition-colors",
                    active ? "border-[#0a8f6e]" : "border-[#d2d2d7] hover:border-[#bfbfc7]",
                  )}
                >
                  <span
                    className={cn(
                      "grid h-[19px] w-[19px] flex-none place-items-center rounded-full border-[1.5px] transition-colors",
                      active ? "border-[#0a8f6e]" : "border-[#d2d2d7]",
                    )}
                  >
                    {active && <span className="h-[11px] w-[11px] rounded-full bg-[#0a8f6e]" />}
                  </span>
                  <span className="flex-1">
                    <span className="block text-[15px] font-semibold text-[#1d1d1f]">
                      {g.label}
                    </span>
                    <span className="mt-0.5 block text-[12.5px] text-[#86868b]">{g.cosmetic}</span>
                  </span>
                  <span className="text-right">
                    <span className="block text-[15px] font-semibold text-[#1d1d1f]">
                      {formatPrice(p)}
                    </span>
                    {save > 0 && (
                      <span className="block text-[11px] font-semibold text-[#0a8f6e]">
                        Save {save}%
                      </span>
                    )}
                  </span>
                </button>
              );
            })}
          </div>
          <button
            type="button"
            onClick={() =>
              document.getElementById("condition")?.scrollIntoView({ behavior: "smooth" })
            }
            className="mt-3 block w-full text-center text-[13px] text-[#86868b] transition-colors hover:text-[#6e6e73]"
          >
            See exactly what {GRADES[gradeId].label} looks like below ↓
          </button>
          <p className="mt-2 text-[13px] text-[#86868b]">
            Function is guaranteed regardless of grade.{" "}
            <Link href="/grades" className="link !text-[13px]">
              Grading explained <span className="chev">&rsaquo;</span>
            </Link>
          </p>
        </div>

        {/* qty + stock */}
        <div className="mt-[26px] flex items-center gap-3">
          <div className="qty">
            <button onClick={() => setQty((q) => Math.max(1, q - 1))} aria-label="Decrease quantity">
              −
            </button>
            <span>{qty}</span>
            <button onClick={() => setQty((q) => q + 1)} aria-label="Increase quantity">
              +
            </button>
          </div>
          <span className={cn("text-sm", lowStock ? "font-medium text-[#9a6a00]" : "text-[#86868b]")}>
            {lowStock ? `Only ${device.stock} left in stock` : `${device.stock} in stock`}
          </span>
        </div>

        {/* actions */}
        <div className="mt-[26px] flex flex-col gap-[11px]">
          <Button onClick={addToCart} size="lg" className="w-full">
            {added ? (
              <>
                <Check className="h-5 w-5" /> Added to bag
              </>
            ) : (
              <>Add to Bag — {formatPrice(price)}</>
            )}
          </Button>
          <div className="flex gap-[11px]">
            <Button onClick={buyNow} variant="outline" size="lg" className="flex-1">
              Buy now
            </Button>
            <Button
              onClick={() => toggleWish(device.slug)}
              variant="outline"
              size="lg"
              aria-label="Save to wishlist"
              className="!w-12 !px-0"
            >
              <Heart
                className={cn("h-5 w-5", wished && "fill-[#e0245e] text-[#e0245e]")}
              />
            </Button>
          </div>
        </div>

        {/* wholesale hint */}
        <ButtonLink
          href="/wholesale"
          variant="secondary"
          className="mt-[22px] w-full justify-between !rounded-[14px] !px-4 !py-3.5"
        >
          <span className="inline-flex items-center gap-2 text-sm font-normal text-[#1d1d1f]">
            <Boxes className="h-4 w-4 text-[#0a8f6e]" />
            Buying {MOQ}+? Trade price from{" "}
            <span className="font-semibold">{formatPrice(bulkUnit)}/unit</span>
          </span>
          <span className="chev text-[#0a8f6e]">&rsaquo;</span>
        </ButtonLink>

        {/* reassurance */}
        <div className="mt-[22px] flex flex-col gap-[11px]">
          {[
            { icon: ShieldCheck, label: "12-month warranty & 14-day free returns on every order" },
            { icon: ScanLine, label: "50-point inspection · data wiped to factory standard" },
            { icon: Truck, label: "Free carbon-neutral 2-day shipping" },
          ].map((r) => (
            <div key={r.label} className="flex items-start gap-[11px] text-[13.5px] leading-[1.4] text-[#6e6e73]">
              <r.icon className="h-[18px] w-[18px] flex-none text-[#0a8f6e]" />
              {r.label}
            </div>
          ))}
        </div>

        {/* battery guarantee */}
        <div className="scard mt-[22px] flex items-center gap-3 !p-4">
          <BatteryRing />
          <div>
            <p className="text-xs uppercase tracking-wider text-[#86868b]">
              Guaranteed on every device
            </p>
            <p className="mt-0.5 text-sm font-medium text-[#1d1d1f]">
              80%+ battery health · fully unlocked · fully functional
            </p>
          </div>
        </div>
      </div>
    </div>

      {/* condition showcase — reactive to the grade selected in the buy box */}
      <section id="condition" className="mt-20 border-t border-[#d2d2d7] pt-12 scroll-mt-[74px]">
        <h2 className="text-[clamp(24px,3vw,34px)] font-bold tracking-[-.02em] text-[#1d1d1f]">
          Your exact condition: see before you buy.
        </h2>
        <p className="mt-2 max-w-[600px] text-[16px] text-[#6e6e73]">
          A transparent wear breakdown for the grade you&apos;ve selected. Function is guaranteed
          regardless of grade — see all four side by side on the{" "}
          <Link href="/grades" className="link">grades page</Link>.
        </p>

        <div className="gpanel scard-bord mt-[30px]" style={{ boxShadow: "none", maxWidth: 900 }}>
          <div className="gphoto">
            <PhImg
              slug={device.slug}
              src={color.image ?? device.image ?? renderSrc(device.slug)}
              label={`${device.name} — ${grade.label} condition`}
            >
              <WearOverlay grade={gradeId} />
              <span className="absolute left-[16px] top-[16px] rounded-full bg-white/80 px-[13px] py-1.5 text-xs font-semibold text-[#6e6e73] backdrop-blur">
                {color.name} · {grade.label}
              </span>
            </PhImg>
          </div>
          <div className="gdetail">
            <div className="gname">
              {grade.label} <span className="tag accent !text-[13px]">{show.pill}</span>
            </div>
            <div className="mt-2.5 text-[18px] font-medium text-[#1d1d1f]">{grade.tagline}</div>
            <p className="gdesc">{show.desc}</p>
            <div className="meters">
              {show.meters.map(([label, w, val]) => (
                <div className="mrow" key={label}>
                  <span className="mlbl">{label}</span>
                  <div className="mtrack">
                    <div className={cn("mfill", w)} />
                  </div>
                  <span className="mval">{val}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    </>
  );
}

function BatteryRing() {
  const r = 26;
  const c = 2 * Math.PI * r;
  const fill = 0.86;
  return (
    <div className="relative h-16 w-16 shrink-0">
      <svg viewBox="0 0 64 64" className="h-16 w-16 -rotate-90">
        <circle cx="32" cy="32" r={r} fill="none" stroke="#e2e2e8" strokeWidth="6" />
        <circle
          cx="32"
          cy="32"
          r={r}
          fill="none"
          stroke="#0a8f6e"
          strokeWidth="6"
          strokeLinecap="round"
          strokeDasharray={c}
          strokeDashoffset={c - fill * c}
        />
      </svg>
      <span className="absolute inset-0 grid place-items-center text-xs font-bold text-[#1d1d1f]">
        80%+
      </span>
    </div>
  );
}
