"use client";

import { useState } from "react";
import { PhImg } from "./PhImg";
import { GRADE_PHOTOS, GRADE_ORDER } from "@/lib/grades";

interface Panel {
  name: string;
  save: string;
  tag: string;
  desc: string;
  meters: [string, string, string][]; // [label, widthClass, value]
}

const PANELS: Panel[] = [
  {
    name: "New",
    save: "SEALED IN BOX",
    tag: "Brand new, factory sealed",
    desc: "Brand-new condition with no marks anywhere — sealed, unused and identical to a phone straight off the shelf, just without the brand-new price.",
    meters: [
      ["Screen", "w0", "Flawless"],
      ["Body", "w0", "Flawless"],
      ["Frame", "w0", "Flawless"],
    ],
  },
  {
    name: "Excellent",
    save: "SAVE UP TO 30%",
    tag: "Looks new from a foot away",
    desc: "No screen scratches and no cosmetic damage visible when held 12 inches away. Our most popular grade — looks new in everyday use.",
    meters: [
      ["Screen", "w0", "Flawless"],
      ["Body", "w1", "Faint"],
      ["Frame", "w1", "Minimal"],
    ],
  },
  {
    name: "Good",
    save: "SAVE UP TO 45%",
    tag: "Light, barely-visible wear",
    desc: "No screen scratches; light body scratches barely visible at 12 inches and imperceptible to touch. Nothing that affects daily use.",
    meters: [
      ["Screen", "w0", "Clean"],
      ["Body", "w2", "Light"],
      ["Frame", "w2", "Light"],
    ],
  },
  {
    name: "Fair",
    save: "SAVE UP TO 60%",
    tag: "Honest wear, biggest savings",
    desc: "A few shallow screen scratches that vanish when the screen is on, plus light body scratches clearly visible at 12 inches. The biggest savings of all.",
    meters: [
      ["Screen", "w1", "Shallow"],
      ["Body", "w3", "Visible"],
      ["Frame", "w3", "Visible"],
    ],
  },
];

const GUARANTEES = [
  "100% functional — every button & sensor",
  "Genuine battery at 80%+ health",
  "Data wiped to factory standard",
  "Free charger, any grade",
];

export function GradeExplorer() {
  const [active, setActive] = useState(1);
  const p = PANELS[active];

  return (
    <div className="expl">
      <div className="seg">
        {PANELS.map((panel, i) => (
          <button
            key={panel.name}
            className={`segbtn${i === active ? " on" : ""}`}
            onClick={() => setActive(i)}
          >
            {panel.name}
          </button>
        ))}
      </div>

      <div className="gpanel">
        <div className="gphotos">
          {GRADE_PHOTOS[GRADE_ORDER[active]].map((src) => (
            <PhImg key={src} src={src} label={`${p.name} condition`} />
          ))}
        </div>
        <div className="gdetail">
          <div className="gname">
            {p.name} <span className="gsave">{p.save}</span>
          </div>
          <div className="gtag">{p.tag}</div>
          <p className="gdesc">{p.desc}</p>
          <div className="meters">
            {p.meters.map(([label, w, val]) => (
              <div className="mrow" key={label}>
                <span className="mlbl">{label}</span>
                <div className="mtrack">
                  <div className={`mfill ${w}`} />
                </div>
                <span className="mval">{val}</span>
              </div>
            ))}
          </div>
          <div className="guar">
            {GUARANTEES.map((g) => (
              <div className="gitem" key={g}>
                <span className="gck">✓</span>
                {g}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
