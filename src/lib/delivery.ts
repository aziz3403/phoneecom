/**
 * Delivery-date estimates. Pure business-day math — no carrier API.
 *
 * Standard is free and lands in 5–7 business days after a one-day handling
 * window; Express is a paid 2-business-day upgrade. The catalog/cart show the
 * resulting "Arrives <date> – <date>" range so customers see real timing
 * instead of a flat "2-day" claim.
 */

export const HANDLING_DAYS = 1;
export const EXPRESS_FEE = 20;

const STANDARD_MIN = 5;
const STANDARD_MAX = 7;
const EXPRESS_DAYS = 2;

/** Advance a date by N business days (skips Sat/Sun). */
function addBusinessDays(start: Date, days: number): Date {
  const d = new Date(start.getTime());
  let added = 0;
  while (added < days) {
    d.setDate(d.getDate() + 1);
    const dow = d.getDay();
    if (dow !== 0 && dow !== 6) added += 1;
  }
  return d;
}

function fmt(d: Date): string {
  return d.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" });
}

export interface DeliveryWindow {
  express: boolean;
  /** ISO of the earliest expected arrival */
  minISO: string;
  /** ISO of the latest expected arrival (used as the order ETA) */
  maxISO: string;
  /** "Tue, Jul 15" or "Tue, Jul 15 – Thu, Jul 17" */
  rangeLabel: string;
  /** "Free standard shipping" / "2-day express" */
  methodLabel: string;
  /** "5–7 business days" / "2 business days" */
  speedLabel: string;
  fee: number;
}

/**
 * Estimate the arrival window. `fromISO` defaults to now; pass a fixed date on
 * the server to keep renders deterministic, or compute on the client after
 * mount to reflect the visitor's current day.
 */
export function deliveryWindow(express: boolean, fromISO?: string): DeliveryWindow {
  const now = fromISO ? new Date(fromISO) : new Date();
  const ship = addBusinessDays(now, HANDLING_DAYS);
  const min = addBusinessDays(ship, express ? EXPRESS_DAYS : STANDARD_MIN);
  const max = addBusinessDays(ship, express ? EXPRESS_DAYS : STANDARD_MAX);
  const sameDay = min.toDateString() === max.toDateString();
  return {
    express,
    minISO: min.toISOString(),
    maxISO: max.toISOString(),
    rangeLabel: sameDay ? fmt(min) : `${fmt(min)} – ${fmt(max)}`,
    methodLabel: express ? "2-day express" : "Free standard shipping",
    speedLabel: express ? "2 business days" : `${STANDARD_MIN}–${STANDARD_MAX} business days`,
    fee: express ? EXPRESS_FEE : 0,
  };
}
