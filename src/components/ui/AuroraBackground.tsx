import { cn } from "@/lib/utils";

/** Decorative soft accent orbs for light-theme heroes. Pure CSS, sits behind content. */
export function AuroraBackground({ className }: { className?: string }) {
  return (
    <div className={cn("pointer-events-none absolute inset-0 -z-10 overflow-hidden", className)}>
      <div
        className="absolute -left-32 top-[-12%] h-[40rem] w-[40rem] rounded-full blur-[90px]"
        style={{ background: "radial-gradient(circle, rgba(10,143,110,.14), transparent 67%)" }}
      />
      <div
        className="absolute right-[-12%] top-[6%] h-[34rem] w-[34rem] rounded-full blur-[90px]"
        style={{ background: "radial-gradient(circle, rgba(38,165,168,.12), transparent 67%)" }}
      />
    </div>
  );
}
