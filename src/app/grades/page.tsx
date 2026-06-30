import type { Metadata } from "next";
import Link from "next/link";
import { GRADES, GRADE_ORDER, GRADE_PHOTOS } from "@/lib/grades";
import { GradeBadge } from "@/components/ui/Badge";
import { PhImg } from "@/components/home/PhImg";

export const metadata: Metadata = {
  title: "Condition grades, defined",
  description:
    "How reMint grades certified pre-owned devices: New, Excellent, Good and Fair — Amazon-Renewed-style screen, body and battery standards. Every grade works like new with 80%+ battery.",
};

const GUARANTEES = [
  "100% functional — every button, sensor & radio tested",
  "Genuine battery at 80%+ health (most far higher)",
  "Data wiped & sanitized to factory standard",
  "Free charging cable & adapter in every box",
  "Fully unlocked to all carriers",
  "30-day returns — a deduction may apply if not returned as sold",
];

const FAQ = [
  {
    q: "Does the grade affect how the phone works?",
    a: "No. Grades describe cosmetic appearance only. Every device — New to Fair — passes the same 50-point functional inspection, works like new, and ships with a free charger and 30-day returns.",
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


export default function GradesPage() {
  return (
    <>
      <div className="pagehead">
        <p className="crumb">
          <Link href="/">Home</Link> · Grades
        </p>
        <h1 className="ptitle">Every grade, clearly defined.</h1>
        <p className="psub">
          Four honest grades — New, Excellent, Good and Fair — describe a device&apos;s cosmetic
          condition only. Every grade is fully functional, works like new, and ships with a battery
          above 80% of its original capacity.
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
                    {GRADE_PHOTOS[id].map((src) => (
                      <PhImg key={src} src={src} label={`${g.label} condition example`} />
                    ))}
                  </div>
                  <div className="gdetail">
                    <div className="gname">
                      {g.label} <span className="gsave">{g.savings}</span>
                      <GradeBadge grade={id} />
                    </div>
                    <div className="gtag">{g.tagline}</div>
                    <p className="gradesheet">
                      Warehouse grade <strong>{g.sheet}</strong>
                    </p>
                    <div className="stds">
                      <div className="stdrow">
                        <span className="stdk">Screen</span>
                        <span className="stdv">{g.screen}</span>
                      </div>
                      <div className="stdrow">
                        <span className="stdk">Body</span>
                        <span className="stdv">{g.body}</span>
                      </div>
                      <div className="stdrow">
                        <span className="stdk">Battery</span>
                        <span className="stdv">{g.battery}</span>
                      </div>
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
            Every device is certified, graded honestly, and ships with a free charger and 30-day returns.
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
