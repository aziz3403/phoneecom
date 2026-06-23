import { cn } from "@/lib/utils";

/**
 * Lightweight CSS phone (front view). Used in grids where spinning up a WebGL
 * canvas per card would be wasteful. Tilts in faux-3D on hover.
 */
export function PhoneMock({
  colorHex,
  accentHex,
  brand,
  className,
  tilt = true,
}: {
  colorHex: string;
  accentHex: string;
  brand: string;
  className?: string;
  tilt?: boolean;
}) {
  const isApple = brand === "Apple";
  return (
    <div className={cn("[perspective:1400px]", className)}>
      <div
        className={cn(
          "relative mx-auto aspect-[10/20] w-[52%] rounded-[1.7rem] transition-transform duration-700 ease-[cubic-bezier(.22,1,.36,1)] will-change-transform",
          tilt && "group-hover:[transform:rotateY(-18deg)_rotateX(8deg)_translateZ(20px)]",
        )}
        style={{
          background: `linear-gradient(150deg, color-mix(in oklab, ${colorHex} 80%, white 18%), ${colorHex} 55%, color-mix(in oklab, ${colorHex} 80%, black 30%))`,
          boxShadow: `0 30px 60px -25px rgba(0,0,0,.8), 0 0 0 1px ${accentHex}66, inset 0 1px 1px rgba(255,255,255,.25)`,
        }}
      >
        {/* screen */}
        <div className="absolute inset-[5px] overflow-hidden rounded-[1.4rem]">
          <div
            className="absolute inset-0"
            style={{
              background: `radial-gradient(120% 80% at 30% 10%, ${accentHex}cc, transparent 55%), radial-gradient(120% 90% at 80% 90%, #38d1ff66, transparent 50%), linear-gradient(160deg, #0b0b17, #04040a)`,
            }}
          />
          {/* glossy reflection */}
          <div className="absolute -left-1/4 top-0 h-full w-1/2 rotate-12 bg-gradient-to-r from-white/0 via-white/10 to-white/0" />
        </div>

        {/* notch / island */}
        {isApple ? (
          <div className="absolute left-1/2 top-2 h-[6%] w-[34%] -translate-x-1/2 rounded-full bg-black/90" />
        ) : (
          <div className="absolute left-1/2 top-[2.5%] h-[3.5%] w-[3.5%] -translate-x-1/2 rounded-full bg-black/90 ring-1 ring-white/10" />
        )}

        {/* side button */}
        <div
          className="absolute right-[-2px] top-[26%] h-[12%] w-[3px] rounded-full"
          style={{ background: accentHex }}
        />
      </div>
    </div>
  );
}
