import Link from "next/link";

/** Shared prose layout for legal / policy pages (warranty, returns, privacy…). */
export function PolicyPage({
  eyebrow,
  title,
  intro,
  updated,
  children,
}: {
  eyebrow: string;
  title: string;
  intro?: string;
  updated: string;
  children: React.ReactNode;
}) {
  return (
    <div className="mx-auto w-full max-w-[760px] px-[22px] pb-28 pt-14">
      <p className="text-[13px] font-semibold uppercase tracking-[.08em] text-[#0a8f6e]">{eyebrow}</p>
      <h1 className="mt-2 text-[clamp(30px,5vw,44px)] font-bold leading-[1.05] tracking-[-.03em] text-[#1d1d1f]">
        {title}
      </h1>
      {intro && <p className="mt-4 text-[16.5px] leading-relaxed text-[#6e6e73]">{intro}</p>}
      <p className="mt-3 text-[12.5px] text-[#b0b0b6]">Last updated: {updated}</p>
      <div className="policy-prose mt-10">{children}</div>
      <p className="mt-14 border-t border-[#e2e2e6] pt-6 text-[13px] text-[#86868b]">
        Questions about this policy? <Link href="/help" className="text-[#0a8f6e] underline-offset-2 hover:underline">Contact support</Link> — we answer within one business day.
      </p>
    </div>
  );
}

export function PolicySection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="mb-9">
      <h2 className="mb-3 text-[20px] font-bold tracking-[-.01em] text-[#1d1d1f]">{title}</h2>
      <div className="flex flex-col gap-3 text-[14.5px] leading-[1.65] text-[#494950]">{children}</div>
    </section>
  );
}

export function PolicyList({ items }: { items: React.ReactNode[] }) {
  return (
    <ul className="flex list-disc flex-col gap-2 pl-5">
      {items.map((it, i) => (
        <li key={i}>{it}</li>
      ))}
    </ul>
  );
}
