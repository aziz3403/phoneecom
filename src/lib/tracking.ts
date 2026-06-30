/**
 * Derives a realistic shipment-tracking timeline for an order from its placed
 * date + delivery ETA. Pure + deterministic (pass `nowISO` on the server so
 * server/client renders agree).
 */

export type TrackKey = "placed" | "packed" | "shipped" | "out" | "delivered";

export interface TrackStep {
  key: TrackKey;
  label: string;
  desc: string;
  at: Date;
  done: boolean;
  current: boolean;
}

export interface Tracking {
  steps: TrackStep[];
  currentKey: TrackKey;
  statusLabel: string;
  percent: number;
  delivered: boolean;
  eta: Date;
  etaLabel: string;
}

const HOUR = 3600 * 1000;
const DAY = 24 * HOUR;

const META: Record<TrackKey, { label: string; desc: string; status: string }> = {
  placed: { label: "Order placed", desc: "Payment confirmed and receipt emailed.", status: "Order placed" },
  packed: { label: "Inspected & packed", desc: "Final 50-point check, factory wipe and plastic-free packaging.", status: "Preparing your order" },
  shipped: { label: "Shipped", desc: "Handed to the carrier — carbon-neutral courier.", status: "Shipped — on its way" },
  out: { label: "Out for delivery", desc: "On the vehicle for delivery today.", status: "Out for delivery" },
  delivered: { label: "Delivered", desc: "Enjoy — every phone arrives unlocked and ready.", status: "Delivered" },
};

const ORDER: TrackKey[] = ["placed", "packed", "shipped", "out", "delivered"];

export function fmtDay(d: Date): string {
  return d.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" });
}

export function computeTracking(opts: {
  placedAtISO: string;
  etaISO?: string;
  express?: boolean;
  nowISO?: string;
}): Tracking {
  const placedAt = new Date(opts.placedAtISO);
  const now = opts.nowISO ? new Date(opts.nowISO) : new Date();
  const transitDays = opts.express ? 1 : 2;
  const eta = opts.etaISO ? new Date(opts.etaISO) : new Date(placedAt.getTime() + transitDays * DAY);

  const at: Record<TrackKey, Date> = {
    placed: placedAt,
    packed: new Date(placedAt.getTime() + 4 * HOUR),
    shipped: new Date(placedAt.getTime() + (opts.express ? 8 * HOUR : DAY)),
    out: new Date(eta.getTime() - 9 * HOUR),
    delivered: eta,
  };

  let currentIdx = 0;
  ORDER.forEach((k, i) => {
    if (at[k].getTime() <= now.getTime()) currentIdx = i;
  });

  const steps: TrackStep[] = ORDER.map((key, i) => ({
    key,
    label: META[key].label,
    desc: META[key].desc,
    at: at[key],
    done: i < currentIdx,
    current: i === currentIdx,
  }));

  const currentKey = ORDER[currentIdx];
  const delivered = currentKey === "delivered";

  return {
    steps,
    currentKey,
    statusLabel: META[currentKey].status,
    percent: Math.round((currentIdx / (ORDER.length - 1)) * 100),
    delivered,
    eta,
    etaLabel: fmtDay(eta),
  };
}

/** Carrier + tracking number generated at checkout (stored on the order). */
export function makeShipment(express: boolean, seed: number): { carrier: string; trackingNumber: string } {
  const carrier = express ? "FedEx Priority Overnight" : "UPS Ground · carbon-neutral";
  const prefix = express ? "FX" : "1Z";
  const digits = String(100000000 + (seed % 900000000));
  return { carrier, trackingNumber: `${prefix}${digits}${(seed % 97).toString().padStart(2, "0")}` };
}
