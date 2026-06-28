import type { Metadata } from "next";
import Link from "next/link";
import { Leaf } from "@/components/ui/Leaf";

export const metadata: Metadata = {
  title: "Our impact",
  description:
    "The greenest phone is the one that already exists. How every refurbished reMint device saves carbon, water and rare metals — and what we do beyond the sale.",
};

const COUNTERS = [
  { n: "189k t", l: "CO₂ kept out of the air", s: "≈ 41,000 cars off the road for a year" },
  { n: "3.1B L", l: "Fresh water saved vs. new", s: "≈ 1,240 Olympic pools" },
  { n: "250k+", l: "Devices given a second life", s: "Kept whole, not shredded" },
  { n: "38 t", l: "E-waste diverted from landfill", s: "Every board, screen & cell" },
];

const NEW_POINTS = [
  "Freshly mined cobalt, lithium & gold",
  "~12,000 L of water per device",
  "Global assembly & air freight",
  "New packaging & accessories",
];

const REFURB_POINTS = [
  "Reuses metals already in circulation",
  "Near-zero new water demand",
  "Local refurbishment, no new factory",
  "Plastic-free, recycled packaging",
];

const JOURNEY = [
  { n: "1", t: "Collect", d: "Trade-ins, returns & overstock are gathered before they're discarded." },
  { n: "2", t: "Restore", d: "50-point inspection, genuine-grade repairs & a full data wipe." },
  { n: "3", t: "Rehome", d: "Graded honestly and sent to a new owner who'll use it for years." },
  { n: "4", t: "Trade again", d: "When they're done, we buy it back and the loop repeats." },
  { n: "♻", t: "Recover", d: "Truly end-of-life devices are recycled to reclaim every usable metal." },
];

const PLEDGES = [
  {
    n: "01",
    t: "A tree for every order",
    d: "We fund a native tree through certified reforestation partners with every device sold — restoring habitats, not just offsetting numbers.",
    meta: "250,000+ trees funded",
  },
  {
    n: "02",
    t: "Carbon-neutral delivery",
    d: "Every shipment is measured and fully offset, sent in plastic-free, recycled packaging by low-emission couriers.",
    meta: "100% of orders offset",
  },
  {
    n: "03",
    t: "Zero device to landfill",
    d: "If a phone can't be restored, we harvest working parts and recycle the rest through certified e-waste recovery. Nothing is dumped.",
    meta: "Certified R2 recycling",
  },
];

export default function SustainabilityPage() {
  return (
    <>
      {/* hero — modeled on the homepage .planet section */}
      <section className="planet">
        <div className="orb orbP1" />
        <div className="planetin">
          <div>
            <div className="pleyebrow">
              <Leaf size={18} vein="#edf6f0" />
              Our impact
            </div>
            <h2 className="plhead">
              The greenest phone is the one
              <br />
              that already exists.
            </h2>
            <p className="pltext">
              Every device we give a second life saves the carbon, water and rare metals it would
              take to build a brand-new one. Here&apos;s exactly how much — and what we do beyond the
              sale.
            </p>
            <div className="plstats">
              <div className="plstat">
                <div className="pn">189k</div>
                <div className="pl">tonnes of CO₂ kept out of the air</div>
              </div>
              <div className="plstat">
                <div className="pn">3.1B L</div>
                <div className="pl">of fresh water saved vs new</div>
              </div>
              <div className="plstat">
                <div className="pn">250k+</div>
                <div className="pl">devices given a second life</div>
              </div>
            </div>
            <div className="plnote">
              <Leaf size={18} />
              We plant a tree with every order — 250,000 and counting.
            </div>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 13 }}>
            <Link className="btn" href="/shop">
              Shop certified phones
            </Link>
            <Link className="link" href="/sell" style={{ justifyContent: "center" }}>
              Trade in your old phone <span className="chev">&rsaquo;</span>
            </Link>
          </div>
        </div>
      </section>

      {/* counters */}
      <section className="sec">
        <div className="shell">
          <div className="grid-cards">
            {COUNTERS.map((c) => (
              <div className="scard-bord" key={c.l}>
                <div
                  style={{
                    fontSize: "clamp(28px,3.2vw,40px)",
                    fontWeight: 700,
                    letterSpacing: "-.03em",
                    color: "var(--accent)",
                    lineHeight: 1,
                  }}
                >
                  {c.n}
                </div>
                <div style={{ fontSize: 14, color: "var(--text2)", marginTop: 8, lineHeight: 1.35 }}>
                  {c.l}
                </div>
                <div style={{ fontSize: 12, color: "var(--text3)", marginTop: 5 }}>{c.s}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* new vs refurbished */}
      <section className="sec" style={{ paddingTop: 0 }}>
        <div className="shell">
          <div className="sechead ctr" style={{ marginBottom: 38, padding: 0 }}>
            <p className="eyebrow">New vs. refurbished</p>
            <h2 className="h2">One phone, a fraction of the footprint.</h2>
            <p className="hsub">
              Up to 80% of a smartphone&apos;s lifetime emissions come from manufacturing — mining
              metals, refining glass, assembling and shipping. Buying refurbished skips nearly all of
              it.
            </p>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 18 }}>
            <div className="scard">
              <div
                style={{
                  fontSize: 13,
                  fontWeight: 600,
                  letterSpacing: ".04em",
                  textTransform: "uppercase",
                  color: "var(--text3)",
                }}
              >
                Buying new
              </div>
              <div style={{ fontSize: "clamp(32px,4vw,48px)", fontWeight: 700, letterSpacing: "-.03em", marginTop: 10, lineHeight: 1 }}>
                ~85 kg{" "}
                <span style={{ fontSize: 15, color: "var(--text2)", fontWeight: 500 }}>CO₂e</span>
              </div>
              <div style={{ marginTop: 22, display: "flex", flexDirection: "column", gap: 13 }}>
                {NEW_POINTS.map((p) => (
                  <div
                    key={p}
                    style={{ display: "flex", alignItems: "center", gap: 11, fontSize: 15, color: "var(--text2)" }}
                  >
                    <span style={{ color: "#b25149", fontWeight: 700, flex: "none" }}>✕</span>
                    {p}
                  </div>
                ))}
              </div>
            </div>
            <div className="scard" style={{ background: "#edf6f0" }}>
              <div
                style={{
                  fontSize: 13,
                  fontWeight: 600,
                  letterSpacing: ".04em",
                  textTransform: "uppercase",
                  color: "var(--accent)",
                }}
              >
                Choosing reMint
              </div>
              <div style={{ fontSize: "clamp(32px,4vw,48px)", fontWeight: 700, letterSpacing: "-.03em", marginTop: 10, lineHeight: 1 }}>
                ~17 kg{" "}
                <span style={{ fontSize: 15, color: "var(--text2)", fontWeight: 500 }}>CO₂e</span>
              </div>
              <div style={{ marginTop: 22, display: "flex", flexDirection: "column", gap: 13 }}>
                {REFURB_POINTS.map((p) => (
                  <div
                    key={p}
                    style={{ display: "flex", alignItems: "center", gap: 11, fontSize: 15, color: "var(--text2)" }}
                  >
                    <span style={{ color: "var(--accent)", fontWeight: 700, flex: "none" }}>✓</span>
                    {p}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* circular journey */}
      <section className="graysec">
        <div className="shell">
          <div className="sechead ctr" style={{ marginBottom: 38, padding: 0 }}>
            <p className="eyebrow">The circular journey</p>
            <h2 className="h2">A loop, not a landfill.</h2>
            <p className="hsub">
              We keep devices whole and in use for as long as possible — and responsibly recover
              everything when they finally can&apos;t be.
            </p>
          </div>
          <div className="grid-cards">
            {JOURNEY.map((step) => (
              <div className="scard-bord" key={step.t} style={{ textAlign: "center" }}>
                <div
                  style={{
                    width: 56,
                    height: 56,
                    borderRadius: "50%",
                    background: "#edf6f0",
                    border: "2px solid var(--accent)",
                    color: "var(--accent)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: 22,
                    fontWeight: 700,
                    margin: "0 auto 16px",
                  }}
                >
                  {step.n}
                </div>
                <div style={{ fontSize: 16, fontWeight: 600 }}>{step.t}</div>
                <div style={{ fontSize: 13, color: "var(--text2)", marginTop: 6, lineHeight: 1.45 }}>
                  {step.d}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* commitments */}
      <section className="sec">
        <div className="shell">
          <div className="sechead ctr" style={{ marginBottom: 38, padding: 0 }}>
            <p className="eyebrow">Beyond the sale</p>
            <h2 className="h2">Our commitments.</h2>
          </div>
          <div className="grid-cards">
            {PLEDGES.map((p) => (
              <div className="scard-bord" key={p.t}>
                <div style={{ fontSize: 13, fontWeight: 700, color: "var(--accent)", letterSpacing: ".04em" }}>
                  {p.n}
                </div>
                <div style={{ fontSize: 20, fontWeight: 700, letterSpacing: "-.01em", margin: "8px 0 9px" }}>
                  {p.t}
                </div>
                <div style={{ fontSize: 15, color: "var(--text2)", lineHeight: 1.55 }}>{p.d}</div>
                <div
                  style={{
                    marginTop: 16,
                    fontSize: 13,
                    fontWeight: 600,
                    color: "var(--accent)",
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 7,
                    background: "#edf6f0",
                    padding: "6px 12px",
                    borderRadius: 980,
                  }}
                >
                  <Leaf size={14} vein="#edf6f0" />
                  {p.meta}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* tree-planting band */}
      <section className="sec" style={{ paddingTop: 0 }}>
        <div className="shell">
          <div className="wbox">
            <div className="wtop">
              <div>
                <div className="pleyebrow" style={{ color: "var(--accent)" }}>
                  <Leaf size={18} vein="#1d1d1f" />A forest, growing
                </div>
                <h2 className="h2" style={{ marginTop: 10 }}>
                  Every phone you rehome
                  <br />
                  plants a tree in the ground.
                </h2>
                <p className="tsub" style={{ margin: "16px 0 0", maxWidth: 460, fontSize: 17, textAlign: "left" }}>
                  We&apos;ve partnered with reforestation projects across three continents. Each
                  order adds a native sapling — and you can watch the total climb.
                </p>
                <div style={{ marginTop: 24 }}>
                  <Link className="btn" href="/shop">
                    Plant your tree — shop now
                  </Link>
                </div>
              </div>
              <div
                style={{
                  background: "rgba(255,255,255,.07)",
                  border: "1px solid rgba(255,255,255,.18)",
                  borderRadius: 20,
                  padding: "28px 30px",
                  textAlign: "center",
                }}
              >
                <div style={{ fontSize: "clamp(40px,5vw,60px)", fontWeight: 700, letterSpacing: "-.03em", lineHeight: 1 }}>
                  253,914
                </div>
                <div style={{ fontSize: 14, color: "#a1a1a6", marginTop: 8 }}>
                  trees funded and counting
                </div>
                <div
                  style={{
                    fontSize: 12.5,
                    color: "#a1a1a6",
                    marginTop: 14,
                    paddingTop: 14,
                    borderTop: "1px solid rgba(255,255,255,.18)",
                  }}
                >
                  Updated as every order ships · verified by our planting partners
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* final cta */}
      <section className="sec" style={{ paddingTop: 0 }}>
        <div className="shell" style={{ textAlign: "center" }}>
          <h2 className="h2">Do something good with your next upgrade.</h2>
          <p className="hsub" style={{ margin: "16px auto 0" }}>
            Same phones you want. A fraction of the footprint. A tree in the ground.
          </p>
          <div className="hlinks" style={{ marginTop: 26, justifyContent: "center" }}>
            <Link className="btn" href="/shop">
              Shop certified phones
            </Link>
            <Link className="link" href="/sell">
              Trade in &amp; get paid <span className="chev">&rsaquo;</span>
            </Link>
          </div>
          <div className="note2" style={{ marginTop: 30, textAlign: "left" }}>
            reMint is a demo storefront. Impact figures are illustrative estimates based on published
            lifecycle studies for smartphone manufacturing, shown to demonstrate the concept.
          </div>
        </div>
      </section>
    </>
  );
}
