import Link from "next/link";
import { getInventory } from "@/lib/inventory";
import { popularDevices, startingPrice, bestDiscount } from "@/lib/products";
import { GRADES } from "@/lib/grades";
import { WHOLESALE_TIERS } from "@/lib/wholesale";
import { PhImg } from "@/components/home/PhImg";
import { GradeExplorer } from "@/components/home/GradeExplorer";
import { Leaf } from "@/components/ui/Leaf";
import { JsonLd } from "@/components/seo/JsonLd";
import { SITE_URL } from "@/lib/site";

export default async function HomePage() {
  const { items, units } = await getInventory();
  const listings = items.length;
  const rail = popularDevices();

  const orgLd = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "reMint",
    url: SITE_URL,
    logo: `${SITE_URL}/favicon.ico`,
    description:
      "Certified pre-owned iPhone, Samsung Galaxy and iPad — retail and wholesale. Every device fully unlocked, 80%+ battery, 12-month warranty.",
  };
  const websiteLd = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: "reMint",
    url: SITE_URL,
  };

  const tierSave = (d: number) => (d === 0 ? "Base" : `−${Math.round(d * 100)}%`);
  const tierQty = (min: number, max: number | null) => (max ? `${min}–${max} units` : `${min}+ units`);

  return (
    <>
      <JsonLd data={[orgLd, websiteLd]} />
      {/* ───────── hero ───────── */}
      <section className="hero">
        <div className="orb orbH1" />
        <div className="orb orbH2" />
        <p className="eyebrow">Certified Pre-Owned</p>
        <h1 className="htitle">
          Premium phones.
          <br />
          Half the price.
        </h1>
        <p className="hsub">
          Inspected on 50 points, graded honestly, and backed by a 12-month warranty. Buy one — or
          buy a thousand.
        </p>
        <div className="hlinks">
          <Link className="link" href="/shop">
            Shop phones <span className="chev">&rsaquo;</span>
          </Link>
          <Link className="link" href="/grades">
            How grading works <span className="chev">&rsaquo;</span>
          </Link>
        </div>
        <div className="hstage">
          <div className="phone phSide phL">
            <PhImg slug="galaxy-s24-ultra" label="Galaxy" className="phscreen" />
          </div>
          <div className="phone phMain">
            <span className="notch" />
            <PhImg slug="iphone-16-pro-max" label="hero device" className="phscreen" />
          </div>
          <div className="phone phSide phR">
            <PhImg slug="iphone-15" label="iPhone" className="phscreen" />
          </div>
        </div>
        <div className="reassure">
          <span><span className="gd" />Free 2-day shipping</span>
          <span><span className="gd" />12-month warranty</span>
          <span><span className="gd" />14-day returns</span>
          <span><span className="gd" />Fully unlocked</span>
        </div>
      </section>

      {/* ───────── bento ───────── */}
      <section className="sec">
        <div className="sechead">
          <h2 className="h2">
            The latest drops. <span className="mut">Freshly graded, ready to ship.</span>
          </h2>
        </div>
        <div className="bento">
          <div className="tile tile-light">
            <div className="thead">
              <p className="teyebrow">iPhone</p>
              <h3 className="ttitle">iPhone 11 to 16.</h3>
              <p className="tsub">The full lineup — certified, unlocked and network-ready.</p>
              <div className="tlinks">
                <Link className="link" href="/shop?brand=Apple&type=phone">Shop <span className="chev">&rsaquo;</span></Link>
                <Link className="link" href="/compare">Compare <span className="chev">&rsaquo;</span></Link>
              </div>
            </div>
            <PhImg slug="iphone-16-pro-max" label="iPhone lineup" className="timg" />
          </div>

          <div className="tile tile-dark">
            <div className="thead">
              <p className="teyebrow">Galaxy</p>
              <h3 className="ttitle">The Samsung lineup.</h3>
              <p className="tsub">S-series, Z foldables and more — every grade.</p>
              <div className="tlinks">
                <Link className="link" href="/shop?brand=Samsung">Shop <span className="chev">&rsaquo;</span></Link>
                <Link className="link" href="/shop?brand=Samsung">Foldables <span className="chev">&rsaquo;</span></Link>
              </div>
            </div>
            <PhImg slug="galaxy-s24-ultra" label="Galaxy lineup" className="timg" />
          </div>

          <div className="tile tile-dark wide live">
            <div className="livegrid" />
            <p className="teyebrow" style={{ position: "relative" }}>Synced daily</p>
            <div className="bignum">
              {units.toLocaleString()}+{" "}
              <span style={{ fontWeight: 600, fontSize: ".42em", color: "var(--text2)", letterSpacing: "-.01em" }}>
                devices in live stock
              </span>
            </div>
            <p className="tsub">
              Browse our real warehouse inventory across Apple, Samsung and more — refreshed every
              day.{" "}
              <span style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
                <span className="livedot" />
                {listings} listings live now.
              </span>
            </p>
            <div className="tlinks" style={{ position: "relative", marginTop: 20 }}>
              <Link className="link" href="/inventory">View live inventory <span className="chev">&rsaquo;</span></Link>
            </div>
          </div>

          <div className="tile tile-light">
            <div className="thead">
              <p className="teyebrow">iPad</p>
              <h3 className="ttitle">iPad, Air &amp; Pro.</h3>
              <p className="tsub">From everyday to M4 powerhouses. From $199.</p>
              <div className="tlinks">
                <Link className="link" href="/shop?type=tablet">Shop iPad <span className="chev">&rsaquo;</span></Link>
              </div>
            </div>
            <PhImg slug="ipad-pro-13-m4" label="iPad lineup" className="timg" />
          </div>

          <div className="tile tile-light">
            <div className="thead">
              <p className="teyebrow">Trade in</p>
              <h3 className="ttitle">Turn your old phone into credit.</h3>
              <p className="tsub">Get an instant quote and ship it free. Apply it to your next device.</p>
              <div className="tlinks">
                <Link className="link" href="/sell">Get a quote <span className="chev">&rsaquo;</span></Link>
              </div>
            </div>
            <PhImg slug="iphone-13" label="trade-in" className="timg" />
          </div>
        </div>
      </section>

      {/* ───────── feature strip ───────── */}
      <section className="sec" style={{ paddingTop: 0 }}>
        <div className="feats">
          <div className="feat">
            <div className="featt">50-point inspection</div>
            <p className="featd">Battery, board, cameras, biometrics and radios — checked on every device.</p>
          </div>
          <div className="feat">
            <div className="featt">12-month warranty</div>
            <p className="featd">Every order, every grade. Plus a no-questions 14-day return window.</p>
          </div>
          <div className="feat">
            <div className="featt">Carbon-neutral shipping</div>
            <p className="featd">Free 2-day delivery that&apos;s offset end to end. Better for the planet.</p>
          </div>
          <div className="feat">
            <div className="featt">Honest grading</div>
            <p className="featd">Real photos and a transparent cosmetic grade. No vague A/B/C codes.</p>
          </div>
        </div>
      </section>

      {/* ───────── grade explorer ───────── */}
      <section className="graysec">
        <div className="sechead ctr">
          <p className="eyebrow">Transparent grading</p>
          <h2 className="h2">Know exactly what you&apos;re getting.</h2>
          <p className="hsub">
            Four honest grades describe cosmetic condition only — function is guaranteed across the
            board. Choose a grade to see what to expect.
          </p>
        </div>
        <GradeExplorer />
      </section>

      {/* ───────── product rail ───────── */}
      <section className="sec">
        <div className="sechead">
          <h2 className="h2">Most-wanted this week.</h2>
          <p className="hsub">Hand-picked, freshly graded, and priced to move.</p>
        </div>
        <div className="rail">
          {rail.map((d) => {
            const minGb = Math.min(...d.storage.map((s) => s.gb));
            const maxGb = Math.max(...d.storage.map((s) => s.gb));
            return (
              <Link className="pcard" href={`/product/${d.slug}`} key={d.id}>
                <PhImg slug={d.slug} label={d.name} className="pimg">
                  <span className="pbadge">{GRADES[d.grade].label}</span>
                  <span className="pdisc">−{bestDiscount(d)}%</span>
                </PhImg>
                <div className="pbody">
                  <div className="pname">{d.name}</div>
                  <div className="pcap">
                    {minGb}–{maxGb}GB · 80%+ battery · ★{d.rating}
                  </div>
                  <div className="pdots">
                    {d.colors.slice(0, 4).map((c) => (
                      <span className="dot" key={c.name} style={{ background: c.hex }} />
                    ))}
                  </div>
                  <div className="pfoot">
                    <div className="pprice">
                      <small>from</small> ${startingPrice(d)}
                    </div>
                    <span className="link" style={{ fontSize: 15 }}>
                      Buy <span className="chev">&rsaquo;</span>
                    </span>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </section>

      {/* ───────── wholesale ───────── */}
      <section className="sec" style={{ paddingTop: 0 }}>
        <div className="whole">
          <div className="wbox">
            <div className="wtop">
              <div>
                <p className="eyebrow">For resellers &amp; businesses</p>
                <h2 className="h2" style={{ marginTop: 6 }}>
                  Buy by the box.
                  <br />
                  Save up to 24%.
                </h2>
                <p className="tsub" style={{ margin: "16px 0 0", maxWidth: 440, fontSize: 18, textAlign: "left" }}>
                  Mix any models, unlock volume pricing from just 5 units, and pay on net-7 to
                  net-30 terms.
                </p>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                <Link className="btn" href="/wholesale">Explore wholesale</Link>
                <Link className="link" style={{ textAlign: "center" }} href="/wholesale#apply">
                  Apply for an account <span className="chev">&rsaquo;</span>
                </Link>
              </div>
            </div>
            <div className="tiers">
              {WHOLESALE_TIERS.map((t) => (
                <div className="tier" key={t.id}>
                  <div className="tname">{t.label}</div>
                  <div className="tqty">{tierQty(t.min, t.max)}</div>
                  <div className={`tsave${t.discount === 0 ? " base" : ""}`}>{tierSave(t.discount)}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ───────── sustainability ───────── */}
      <section className="planet">
        <svg className="wavetop" viewBox="0 0 1440 62" preserveAspectRatio="none">
          <path d="M0,0 L1440,0 L1440,30 C1180,58 940,40 700,22 C470,5 235,46 0,24 Z" fill="#ffffff" />
        </svg>
        <div className="orb orbP1" />
        <div className="planetin">
          <div>
            <div className="pleyebrow">
              <Leaf size={18} vein="#edf6f0" />
              Our promise to the planet
            </div>
            <h2 className="plhead">
              For every phone rehomed,
              <br />
              the planet breathes easier.
            </h2>
            <p className="pltext">
              A refurbished phone reuses everything already mined, refined and assembled for it —
              keeping rare-earth metals in circulation and e-waste out of landfill. Choosing reMint
              is the easiest climate decision you&apos;ll make today.
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
          <div className="plvis">
            <PhImg src="" label="old-growth forest photography" />
            <div className="plbadge">
              <span className="pbn">−80%</span>
              <span className="pbl">lower carbon footprint than buying the same phone brand-new</span>
            </div>
          </div>
        </div>
      </section>

      {/* ───────── final cta ───────── */}
      <section className="final">
        <div className="orb orbF1" />
        <p className="eyebrow">Upgrade for less · waste nothing</p>
        <h2 className="htitle">
          Better for your wallet.
          <br />
          Better for the planet.
        </h2>
        <div className="hlinks">
          <Link className="link" href="/shop">Start shopping <span className="chev">&rsaquo;</span></Link>
          <Link className="link" href="/wholesale">I&apos;m a business <span className="chev">&rsaquo;</span></Link>
        </div>
      </section>
    </>
  );
}
