import type { ReactNode } from "react";
import { cn } from "@/lib/utils";
import { GRADES, type GradeId } from "@/lib/grades";

export function Badge({
  children,
  className,
  tone = "neutral",
}: {
  children: ReactNode;
  className?: string;
  tone?: "neutral" | "brand" | "mint" | "glacier" | "amber";
}) {
  const tones = {
    neutral: "bg-white/5 text-white/70 border-white/10",
    brand: "bg-brand-500/15 text-brand-200 border-brand-400/30",
    mint: "bg-mint-500/15 text-mint-300 border-mint-400/30",
    glacier: "bg-glacier-500/15 text-glacier-300 border-glacier-400/30",
    amber: "bg-amber-500/15 text-amber-200 border-amber-400/30",
  } as const;
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-medium tracking-wide",
        tones[tone],
        className,
      )}
    >
      {children}
    </span>
  );
}

export function GradeBadge({
  grade,
  size = "md",
  showDot = true,
  className,
}: {
  grade: GradeId;
  size?: "sm" | "md";
  showDot?: boolean;
  className?: string;
}) {
  const g = GRADES[grade];
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border font-semibold tracking-wide",
        size === "sm" ? "px-2.5 py-0.5 text-[11px]" : "px-3 py-1 text-xs",
        className,
      )}
      style={{
        color: g.hexSoft,
        borderColor: `${g.hex}55`,
        background: `${g.hex}1f`,
      }}
    >
      {showDot && (
        <span
          className="inline-block h-1.5 w-1.5 rounded-full"
          style={{ background: g.hex, boxShadow: `0 0 8px ${g.hex}` }}
        />
      )}
      {g.label}
    </span>
  );
}
