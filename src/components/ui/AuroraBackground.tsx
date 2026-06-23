import { cn } from "@/lib/utils";

/** Decorative animated gradient orbs. Pure CSS, sits behind content. */
export function AuroraBackground({ className }: { className?: string }) {
  return (
    <div className={cn("pointer-events-none absolute inset-0 -z-10 overflow-hidden", className)}>
      <div className="absolute -left-32 top-[-10%] h-[42rem] w-[42rem] animate-aurora rounded-full bg-brand-600/30 blur-[120px]" />
      <div
        className="absolute right-[-12%] top-[8%] h-[34rem] w-[34rem] animate-aurora rounded-full bg-glacier-500/25 blur-[120px]"
        style={{ animationDelay: "-6s" }}
      />
      <div
        className="absolute bottom-[-18%] left-1/3 h-[36rem] w-[36rem] animate-aurora rounded-full bg-mint-600/20 blur-[130px]"
        style={{ animationDelay: "-11s" }}
      />
    </div>
  );
}
