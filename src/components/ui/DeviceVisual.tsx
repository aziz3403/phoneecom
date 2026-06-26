"use client";

import { useState } from "react";
import type { Brand, CameraLayout, DeviceType } from "@/lib/products";
import { cn } from "@/lib/utils";

interface DeviceVisualProps {
  colorHex: string;
  accent: string;
  brand: Brand;
  type: DeviceType;
  cameraLayout?: CameraLayout;
  face?: "front" | "back";
  image?: string;
  alt?: string;
  tilt?: boolean;
  className?: string;
}

/**
 * Studio-style device render — phone or tablet, any colorway.
 * If `image` is supplied it renders that photo; if the photo fails to load it
 * gracefully falls back to the CSS render, so a visual always appears.
 */
export function DeviceVisual({
  colorHex,
  accent,
  brand,
  type,
  cameraLayout = "dual",
  face = "front",
  image,
  alt = "",
  tilt = true,
  className,
}: DeviceVisualProps) {
  const [failed, setFailed] = useState(false);

  if (image && !failed) {
    return (
      <div className={cn("relative h-full w-full", className)}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={image}
          alt={alt}
          loading="lazy"
          onError={() => setFailed(true)}
          className="h-full w-full object-contain drop-shadow-[0_18px_40px_rgba(0,0,0,0.55)]"
        />
      </div>
    );
  }

  const isTablet = type === "tablet";
  const isApple = brand === "Apple";
  const radius = isTablet ? "5% / 3.6%" : "13% / 6.2%";
  const aspect = isTablet ? "10 / 13.2" : "10 / 20.6";
  const bezel = isTablet ? 5 : 4;

  return (
    <div className={cn("grid h-full w-full place-items-center [perspective:1500px]", className)}>
      <div
        className={cn(
          "relative h-full transition-transform duration-700 ease-[cubic-bezier(.22,1,.36,1)] will-change-transform",
          tilt && "group-hover:[transform:rotateY(-16deg)_rotateX(7deg)_translateZ(18px)]",
        )}
        style={{
          aspectRatio: aspect,
          borderRadius: radius,
          background: `linear-gradient(150deg, color-mix(in oklab, ${colorHex} 82%, white 18%), ${colorHex} 52%, color-mix(in oklab, ${colorHex} 78%, black 32%))`,
          boxShadow: `0 28px 60px -26px rgba(0,0,0,.85), 0 0 0 1px ${accent}55, inset 0 1px 1px rgba(255,255,255,.28)`,
          padding: bezel,
        }}
      >
        {face === "front" ? (
          <FrontFace colorHex={colorHex} accent={accent} isApple={isApple} isTablet={isTablet} radius={radius} />
        ) : (
          <BackFace colorHex={colorHex} accent={accent} isTablet={isTablet} layout={cameraLayout} radius={radius} />
        )}

        {!isTablet && face === "front" && (
          <span
            className="absolute right-[-2px] top-[24%] h-[11%] w-[3px] rounded-full"
            style={{ background: accent }}
          />
        )}
      </div>
    </div>
  );
}

function FrontFace({
  colorHex,
  accent,
  isApple,
  isTablet,
  radius,
}: {
  colorHex: string;
  accent: string;
  isApple: boolean;
  isTablet: boolean;
  radius: string;
}) {
  return (
    <div
      className="relative h-full w-full overflow-hidden"
      style={{ borderRadius: `calc(${isTablet ? "0.7" : "0.82"} * (${radius}))` }}
    >
      <div
        className="absolute inset-0"
        style={{
          background: `radial-gradient(120% 75% at 28% 8%, ${accent}dd, transparent 55%), radial-gradient(120% 85% at 82% 92%, #38d1ff55, transparent 52%), radial-gradient(90% 60% at 60% 50%, ${colorHex}66, transparent 60%), linear-gradient(160deg, #0c0c1a, #050509)`,
        }}
      />
      <div className="absolute -left-1/3 top-0 h-full w-1/2 rotate-[14deg] bg-gradient-to-r from-white/0 via-white/12 to-white/0" />

      {isTablet ? (
        <span className="absolute left-1/2 top-[1.6%] h-[1.6%] w-[1.6%] -translate-x-1/2 rounded-full bg-black/80 ring-1 ring-white/10" />
      ) : isApple ? (
        <span className="absolute left-1/2 top-[2.2%] h-[5.2%] w-[33%] -translate-x-1/2 rounded-full bg-black/90" />
      ) : (
        <span className="absolute left-1/2 top-[2.4%] h-[3.2%] w-[3.2%] -translate-x-1/2 rounded-full bg-black/90 ring-1 ring-white/10" />
      )}
    </div>
  );
}

function BackFace({
  colorHex,
  accent,
  isTablet,
  layout,
  radius,
}: {
  colorHex: string;
  accent: string;
  isTablet: boolean;
  layout: CameraLayout;
  radius: string;
}) {
  const lens = (key: string, extra: string) => (
    <span
      key={key}
      className={cn("rounded-full ring-1 ring-white/15", extra)}
      style={{ background: "radial-gradient(circle at 35% 30%, #2b2f3a, #060708 70%)", boxShadow: `0 0 0 2px ${accent}` }}
    />
  );

  return (
    <div
      className="relative h-full w-full overflow-hidden"
      style={{
        borderRadius: `calc(0.82 * (${radius}))`,
        background: `linear-gradient(155deg, color-mix(in oklab, ${colorHex} 88%, white 10%), ${colorHex} 60%, color-mix(in oklab, ${colorHex} 80%, black 26%))`,
      }}
    >
      {isTablet ? (
        <div className="absolute left-[8%] top-[5%] grid h-[10%] w-[10%] place-items-center rounded-[26%] bg-black/40">
          {lens("t", "h-[55%] w-[55%]")}
        </div>
      ) : layout === "bar" ? (
        <div className="absolute left-[6%] right-[6%] top-[8%] flex h-[7%] items-center justify-start gap-[8%] rounded-full bg-black/45 px-[6%]">
          {lens("a", "h-[70%] aspect-square")}
          {lens("b", "h-[70%] aspect-square")}
        </div>
      ) : layout === "triple" || layout === "grid" ? (
        <div className="absolute left-[7%] top-[6%] grid h-[26%] w-[26%] grid-cols-2 grid-rows-2 gap-[10%] rounded-[22%] bg-black/35 p-[9%]">
          {lens("a", "")}
          {lens("b", "")}
          {lens("c", "")}
          <span className="rounded-full bg-amber-100/80" />
        </div>
      ) : layout === "vertical" ? (
        <div className="absolute left-[9%] top-[6%] flex flex-col gap-[8%]">
          {lens("a", "aspect-square w-[16%] min-w-3")}
          {lens("b", "aspect-square w-[16%] min-w-3")}
          {lens("c", "aspect-square w-[16%] min-w-3")}
        </div>
      ) : layout === "single" ? (
        <div className="absolute left-[8%] top-[6%] grid h-[11%] w-[11%] place-items-center rounded-[26%] bg-black/40">
          {lens("a", "h-[58%] w-[58%]")}
        </div>
      ) : (
        <div className="absolute left-[7%] top-[6%] grid h-[20%] w-[20%] grid-cols-1 grid-rows-2 place-items-center gap-[10%] rounded-[26%] bg-black/35 p-[10%]">
          {lens("a", "h-[80%] aspect-square")}
          {lens("b", "h-[80%] aspect-square")}
        </div>
      )}

      <div className="absolute left-1/2 top-1/2 h-[8%] w-[8%] -translate-x-1/2 -translate-y-1/2 rounded-full bg-white/5" />
    </div>
  );
}
