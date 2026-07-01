import { describe, expect, it } from "vitest";
import {
  quote, findRow, tradeInModelsFromSnapshot, BATTERY_DEDUCTION,
  type PriceRow, type TradeInModel,
} from "./trade-in-pricing";

const row: PriceRow = {
  cat: "iphone",
  model: "iPhone Test",
  gb: 128,
  lock: "unlocked",
  swap: 500,
  new: null,
  a: 480,
  b: 440,
  c: 320,
  d: 200,
  doa: 90,
  crackedBack: 60,
  crackedLens: 40,
  faceId: "Parts",
};

describe("trade-in quote()", () => {
  it("prices the claimed grade with no deductions", () => {
    const q = quote(row, { grade: "a" });
    expect(q).toMatchObject({ hasPrice: true, grade: "a", base: 480, total: 480 });
    expect(q.deductions).toHaveLength(0);
  });

  it("stacks deductions for cracked back, lens and low battery", () => {
    const q = quote(row, { grade: "b", crackedBack: true, crackedLens: true, batteryLow: true });
    expect(q.total).toBe(440 - 60 - 40 - BATTERY_DEDUCTION);
    expect(q.deductions).toHaveLength(3);
  });

  it("never quotes below zero", () => {
    const q = quote(row, { grade: "doa", crackedBack: true, crackedLens: true, batteryLow: true });
    expect(q.total).toBeGreaterThanOrEqual(0);
  });

  it("clamps negative book prices (recycling-cost models) to a $0 payout", () => {
    // The Samsung book really carries negative DOA values — we must never pay
    // for those, and the wizard's $5 floor must not apply either.
    const q = quote({ ...row, doa: -110 }, { grade: "doa" });
    expect(q.hasPrice).toBe(true);
    expect(q.total).toBe(0);
  });

  it("regrades a Face ID fault to the parts (DOA) rate when the book says Parts", () => {
    const q = quote(row, { grade: "a", badFaceId: true });
    expect(q.grade).toBe("doa");
    expect(q.base).toBe(90);
  });

  it("regrades a Face ID fault to D when the book says D", () => {
    const q = quote({ ...row, faceId: "D" }, { grade: "a", badFaceId: true });
    expect(q.grade).toBe("d");
    expect(q.base).toBe(200);
  });

  it("reports no price when the grade column is empty", () => {
    const q = quote({ ...row, b: null }, { grade: "b" });
    expect(q.hasPrice).toBe(false);
    expect(q.total).toBe(0);
  });

  it("adds a note (not a silent change) for repair messages", () => {
    const q = quote(row, { grade: "a", repairMessage: true });
    expect(q.total).toBe(480);
    expect(q.notes.some((n) => n.toLowerCase().includes("repair"))).toBe(true);
  });
});

describe("findRow()", () => {
  const model: TradeInModel = {
    key: "iphone-test",
    name: "iPhone Test",
    group: "iPhone",
    storages: [128, 256],
    locks: ["unlocked", "locked", "att"],
    colors: [],
    rows: [
      row,
      { ...row, gb: 256, a: 520 },
      { ...row, lock: "locked", a: 430 },
      { ...row, lock: "att", a: 410 },
    ],
  } as unknown as TradeInModel;

  it("matches exact storage + lock", () => {
    expect(findRow(model, 256, "unlocked")!.a).toBe(520);
  });

  it("prefers the AT&T book price for AT&T-locked devices", () => {
    expect(findRow(model, 128, "att")!.a).toBe(410);
  });

  it("falls back to the nearest storage when the exact one is missing", () => {
    expect(findRow(model, 512, "unlocked")!.gb).toBe(256);
  });
});

describe("price book snapshot", () => {
  it("parses into a sane model list", () => {
    const models = tradeInModelsFromSnapshot();
    expect(models.length).toBeGreaterThan(30);
    for (const m of models) {
      expect(m.name).toBeTruthy();
      expect(m.rows.length).toBeGreaterThan(0);
    }
    // Raw rows may carry negative values (dead Samsungs cost money to take),
    // but a quote must never come out below $0 for any grade of any model.
    for (const m of models) {
      for (const r of m.rows) {
        for (const g of ["swap", "new", "a", "b", "c", "d", "doa"] as const) {
          if (r[g] == null) continue;
          expect(quote(r, { grade: g }).total, `${m.name} ${r.gb}GB ${r.lock} ${g}`).toBeGreaterThanOrEqual(0);
        }
      }
    }
  });
});
