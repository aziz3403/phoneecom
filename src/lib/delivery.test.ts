import { describe, expect, it } from "vitest";
import { deliveryWindow, EXPRESS_FEE } from "./delivery";

// Wednesday 2026-07-01 12:00 UTC — a plain mid-week day
const WED = "2026-07-01T12:00:00.000Z";
// Friday — forces weekend skipping
const FRI = "2026-07-03T12:00:00.000Z";

describe("deliveryWindow()", () => {
  it("standard is free, express charges the fee", () => {
    expect(deliveryWindow(false, WED).fee).toBe(0);
    expect(deliveryWindow(true, WED).fee).toBe(EXPRESS_FEE);
  });

  it("express (1 handling + 2 transit business days) skips weekends", () => {
    const w = deliveryWindow(true, FRI);
    const min = new Date(w.minISO);
    // Fri → ship Mon → +2bd = Wednesday
    expect(min.getUTCDay()).toBe(3);
    expect(w.minISO).toBe(w.maxISO);
  });

  it("standard window is 5–7 business days after handling and never on a weekend", () => {
    const w = deliveryWindow(false, WED);
    const min = new Date(w.minISO);
    const max = new Date(w.maxISO);
    expect(max.getTime()).toBeGreaterThan(min.getTime());
    for (const d of [min, max]) {
      expect([0, 6]).not.toContain(d.getUTCDay());
    }
    expect(w.rangeLabel).toContain("–");
  });
});
