"use client";

import { useState } from "react";
import { PhImg } from "./PhImg";

interface Panel {
  name: string;
  save: string;
  tag: string;
  desc: string;
  meters: [string, string, string][]; // [label, widthClass, value]
}

const PANELS: Panel[] = [
  {
    name: "Pristine",
    save: "SAVE UP TO 15%",
    tag: "Indistinguishable from new",
    desc: "No visible wear under any lighting. Screen and body are flawless to the naked eye — the closest thing to brand-new without the brand-new price.",
    meters: [
      ["Screen", "w0", "Flawless"],
      ["Back glass", "w0", "Flawless"],
      ["Frame", "w0", "Flawless"],
    ],
  },
  {
    name: "Excellent",
    save: "SAVE UP TO 30%",
    tag: "Looks new from arm's length",
    desc: "Only the faintest micro-marks, invisible during everyday use. You'd need to angle it under direct light to find anything. Our most popular grade.",
    meters: [
      ["Screen", "w1", "Faint"],
      ["Back glass", "w1", "Faint"],
      ["Frame", "w1", "Minimal"],
    ],
  },
  {
    name: "Good",
    save: "SAVE UP TO 45%",
    tag: "Light, honest signs of life",
    desc: "Minor scratches visible up close and light frame wear at the corners. Nothing that affects the display or daily use — just a phone that's been lived with.",
    meters: [
      ["Screen", "w1", "Light"],
      ["Back glass", "w2", "Visible"],
      ["Frame", "w2", "Visible"],
    ],
  },
  {
    name: "Fair",
    save: "SAVE UP TO 60%",
    tag: "Well-loved, fully functional",
    desc: "Noticeable scratches and possible deeper marks or minor dents on the frame. The biggest savings for buyers who care about what a phone does, not how it looks.",
    meters: [
      ["Screen", "w2", "Visible"],
      ["Back glass", "w3", "Marked"],
      ["Frame", "w3", "Marked"],
    ],
  },
];

const GUARANTEES = [
  "100% functional — every button & sensor",
  "Genuine battery at 80%+ health",
  "Data wiped to factory standard",
  "12-month warranty, any grade",
];

const RENDER = ["iphone-16-pro-max", "iphone-15", "iphone-13", "iphone-11"];

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
        <div className="gphoto">
          <PhImg slug={RENDER[active]} label={`macro · ${p.name}`} />
          <div className="gmacros">
            <div className="ph gmacro">
              <span className="phlbl" style={{ fontSize: 10 }}>screen</span>
            </div>
            <div className="ph gmacro">
              <span className="phlbl" style={{ fontSize: 10 }}>back</span>
            </div>
            <div className="ph gmacro">
              <span className="phlbl" style={{ fontSize: 10 }}>corner</span>
            </div>
          </div>
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
