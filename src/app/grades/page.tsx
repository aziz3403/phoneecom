import type { Metadata } from "next";
import Link from "next/link";
import { GRADES, GRADE_ORDER } from "@/lib/grades";
import { GradeBadge } from "@/components/ui/Badge";
import { PhImg } from "@/components/home/PhImg";
import { WearOverlay } from "@/components/ui/WearOverlay";

export const metadata: Metadata = {
  title: "Condition grades, defined",
  description:
    "How reMint grades certified pre-owned devices: Pristine, Excellent, Good and Fair. Cosmetic condition only — function is guaranteed on every grade.",
};

const GUARANTEES = [
  "100% functional — every button, sensor & radio tested",
  "Genuine battery at 80%+ health (most far higher)",
  "Data wiped & sanitized to factory standard",
  "12-month warranty regardless of cosmetic grade",
  "Fully unlocked to all carriers",
  "14-day RMA — return it if you're not satisfied",
];

const FAQ = [
  {
    q: "Does the grade affect how the phone works?",
    a: "No. Grades describe cosmetic appearance only. Every device — Pristine to Fair — passes the same 50-point functional inspection and ships with a 12-month warranty.",
  },
  {
    q: "Will I get the exact unit in the photos?",
    a: "Photos are representative of the grade. Your device will match the cosmetic standard described for its grade, or better.",
  },
  {
    q: "What battery health can I expect?",
    a: "Every device is guaranteed at 80%+ battery health with a genuine cell — most come in well above the minimum. Every phone is also fully unlocked and fully functional.",
  },
];

// Four example devices per grade (real photos). Each gets the grade's wear
// overlay, so a grade reads as a small gallery of representative units.
const EXAMPLES: Record<string, string[]> = {
  pristine: [
    "/photos/iphone-16-pro-max__natural-titanium.jpg",
    "/photos/iphone-15__blue.jpg",
    "/photos/iphone-14-pro__deep-purple.jpg",
    "/photos/iphone-13__midnight.jpg",
  ],
  excellent: [
    "/photos/iphone-15-pro__natural-titanium.jpg",
    "/photos/iphone-14__blue.jpg",
    "/photos/iphone-16__teal.jpg",
    "/photos/iphone-12__purple.jpg",
  ],
  good: [
    "/photos/iphone-13-pro__sierra-blue.jpg",
    "/photos/iphone-12-pro__pacific-blue.jpg",
    "/photos/iphone-11__purple.jpg",
    "/photos/iphone-14-plus__starlight.jpg",
  ],
  fair: [
    "/photos/iphone-11__black.jpg",
    "/photos/iphone-12-mini__green.jpg",
    "/photos/iphone-13-mini__pink.jpg",
    "/photos/iphone-xr__coral.jpg",
  ],
};

const METERS: Record<string, [string, string, string][]> = {
  pristine: [
    ["Screen", "w0", "Flawless"],
    ["Back glass", "w0", "Flawless"],
    ["Frame", "w0", "Flawless"],
  ],
  excellent: [
    ["Screen", "w1", "Faint"],
    ["Back glass", "w1", "Faint"],
    ["Frame", "w1", "Minimal"],
  ],
  good: [
    ["Screen", "w1", "Light"],
    ["Back glass", "w2", "Visible"],
    ["Frame", "w2", "Visible"],
  ],
  fair: [
    ["Screen", "w2", "Visible"],
    ["Back glass", "w3", "Marked"],
    ["Frame", "w3", "Marked"],
  ],
};

export default function GradesPage() {
  return (
    <>
      <div className="pagehead">
        <p className="crumb">
          <Link href="/">Home</Link> · Grades
        </p>
        <h1 className="ptitle">Every grade, clearly defined.</h1>
        <p className="psub">
          No vague A/B/C codes. Four honest grades describe a device&apos;s cosmetic condition — and
          nothing else. Function is guaranteed across the board.
        </p>

        {/* condition scale */}
        <div style={{ maxWidth: 640, marginTop: 30 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            {GRADE_ORDER.map((id) => {
              const g = GRADES[id];
              return (
                <div key={id} style={{ flex: 1 }}>
                  <div style={{ height: 8, borderRadius: 980, background: g.hex }} />
                  <p
                    style={{
                      marginTop: 8,
                      textAlign: "center",
                      fontSize: 12,
                      fontWeight: 600,
                      color: "var(--text2)",
                    }}
                  >
                    {g.label}
                  </p>
                </div>
              );
            })}
          </div>
          <div
            style={{
              marginTop: 2,
              display: "flex",
              justifyContent: "space-between",
              fontSize: 12,
              color: "var(--text3)",
            }}
          >
            <span>Flawless</span>
            <span>More character · biggest savings</span>
          </div>
        </div>
      </div>

      {/* per-grade detail cards */}
      <section className="sec" style={{ paddingTop: 64 }}>
        <div className="shell">
          <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
            {GRADE_ORDER.map((id) => {
              const g = GRADES[id];
              return (
                <div className="gpanel scard-bord" key={id} style={{ boxShadow: "none" }}>
                  <div className="gphotos">
                    {EXAMPLES[id].map((src, i) => (
                      <PhImg key={src} src={src} label={`${g.label} condition example`}>
                        <WearOverlay grade={id} seed={(GRADE_ORDER.indexOf(id) + 1) * 17 + i * 5} />
                      </PhImg>
                    ))}
                  </div>
                  <div className="gdetail">
                    <div className="gname">
                      {g.label} <span className="gsave">{g.savings}</span>
                      <GradeBadge grade={id} />
                    </div>
                    <div className="gtag">{g.tagline}</div>
                    <p className="gdesc">{g.cosmetic}</p>
                    <div className="meters">
                      {METERS[id].map(([label, w, val]) => (
                        <div className="mrow" key={label}>
                          <span className="mlbl">{label}</span>
                          <div className="mtrack">
                            <div className={`mfill ${w}`} />
                          </div>
                          <span className="mval">{val}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* guarantees */}
      <section className="graysec">
        <div className="shell">
          <div className="sechead ctr" style={{ marginBottom: 32, padding: 0 }}>
            <p className="eyebrow">On every grade</p>
            <h2 className="h2">Guaranteed, whatever the cosmetics.</h2>
          </div>
          <div className="scard-bord">
            <div className="guar" style={{ marginTop: 0, paddingTop: 0, borderTop: "none" }}>
              {GUARANTEES.map((item) => (
                <div className="gitem" key={item}>
                  <span className="gck">✓</span>
                  {item}
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* faq */}
      <section className="sec">
        <div className="shell">
          <div className="sechead ctr" style={{ marginBottom: 32, padding: 0 }}>
            <p className="eyebrow">Good to know</p>
            <h2 className="h2">Grading FAQ</h2>
          </div>
          <div className="cards-3">
            {FAQ.map((f) => (
              <div className="scard-bord" key={f.q}>
                <h3 style={{ fontSize: 17, fontWeight: 600 }}>{f.q}</h3>
                <p style={{ fontSize: 15, color: "var(--text2)", marginTop: 8, lineHeight: 1.55 }}>
                  {f.a}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* cta */}
      <section className="sec" style={{ paddingTop: 0 }}>
        <div className="shell" style={{ textAlign: "center" }}>
          <h2 className="h2">Shop with total confidence.</h2>
          <p className="hsub" style={{ margin: "16px auto 0" }}>
            Every device is certified, graded honestly, and backed by a 12-month warranty.
          </p>
          <div style={{ marginTop: 26 }}>
            <Link className="btn" href="/shop">
              Browse the collection
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
