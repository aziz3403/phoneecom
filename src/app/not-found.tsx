import Link from "next/link";
import { Leaf } from "@/components/ui/Leaf";

const DESTINATIONS = [
  { label: "Shop phones", href: "/shop" },
  { label: "Sell & trade-in", href: "/sell" },
  { label: "Compare devices", href: "/compare" },
  { label: "Our impact", href: "/sustainability" },
  { label: "Help Center", href: "/help" },
];

export default function NotFound() {
  return (
    <section
      className="sec"
      style={{
        position: "relative",
        overflow: "hidden",
        minHeight: "calc(100vh - 220px)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        textAlign: "center",
      }}
    >
      {/* ambient decoration */}
      <div
        className="orb"
        style={{
          width: 440,
          height: 440,
          background: "radial-gradient(circle,rgba(10,143,110,.16),transparent 67%)",
          top: -120,
          left: "50%",
          transform: "translateX(-60%)",
        }}
      />
      <div
        className="orb"
        style={{
          width: 320,
          height: 320,
          background: "radial-gradient(circle,rgba(38,165,168,.13),transparent 67%)",
          bottom: -120,
          right: "14%",
        }}
      />
      {/* faint decorative leaf */}
      <span
        aria-hidden
        style={{
          position: "absolute",
          top: 40,
          left: "8%",
          color: "var(--accent)",
          opacity: 0.06,
          transform: "rotate(20deg)",
          pointerEvents: "none",
          display: "inline-flex",
        }}
      >
        <Leaf size={120} vein="transparent" className="" />
      </span>

      <div className="shell-narrow" style={{ position: "relative", zIndex: 1 }}>
        <p
          className="ptitle"
          style={{
            fontSize: "clamp(80px,16vw,160px)",
            lineHeight: 0.95,
            display: "inline-flex",
            alignItems: "center",
            gap: 6,
          }}
        >
          4
          <span
            aria-hidden
            style={{
              width: "clamp(56px,11vw,112px)",
              height: "clamp(56px,11vw,112px)",
              borderRadius: "50%",
              border: "clamp(9px,2.2vw,20px) solid var(--accent)",
              display: "inline-block",
            }}
          />
          4
        </p>
        <h1 className="h2" style={{ marginTop: 8 }}>
          This page took a different upgrade path.
        </h1>
        <p className="psub" style={{ margin: "16px auto 0" }}>
          The link you followed is broken or the page has moved. But there&apos;s a whole store of
          certified phones waiting — let&apos;s get you back on track.
        </p>
        <div
          className="hlinks"
          style={{ marginTop: 30, justifyContent: "center", alignItems: "center" }}
        >
          <Link className="btn" href="/">
            Back to home
          </Link>
          <Link className="link" href="/shop">
            Browse all phones <span className="chev">&rsaquo;</span>
          </Link>
        </div>

        {/* popular destinations */}
        <div style={{ marginTop: 40, paddingTop: 26, borderTop: "1px solid var(--line)" }}>
          <div
            style={{
              fontSize: 13,
              fontWeight: 600,
              color: "var(--text3)",
              letterSpacing: ".04em",
              textTransform: "uppercase",
              marginBottom: 14,
            }}
          >
            Popular destinations
          </div>
          <div
            style={{ display: "flex", gap: 10, justifyContent: "center", flexWrap: "wrap" }}
          >
            {DESTINATIONS.map((d) => (
              <Link key={d.label} className="chip" href={d.href}>
                {d.label}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
