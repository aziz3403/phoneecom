import "server-only";
import { getDevice } from "./products";
import { GRADES, type GradeId } from "./grades";
import { unitPrice } from "./wholesale";
import { EXPRESS_FEE } from "./delivery";
import { catalogStock } from "./inventory";
import type { OrderLine } from "./orders";

/**
 * Server-side re-pricing of an order. The cart lives in localStorage, so
 * nothing the client sends about money can be trusted — every line is
 * re-derived from the catalog (same math as the product page: storage price ×
 * grade multiplier, or the wholesale tier price for the quantity) and the
 * charged amount comes from here, never from the request.
 */

export const TAX_RATE = 0.0825;

export interface PricedOrder {
  lines: OrderLine[];
  subtotal: number;
  deliveryCost: number;
  tax: number;
  total: number;
}

function serverUnit(line: OrderLine): number | undefined {
  if (!line.slug) return undefined;
  const device = getDevice(line.slug);
  if (!device) return undefined;
  const storage = device.storage.find((s) => s.gb === line.gb);
  if (!storage) return undefined;
  if (line.mode === "wholesale") return unitPrice(storage.wholesale, line.qty);
  const gradeId: GradeId = line.grade && GRADES[line.grade] ? line.grade : device.grade;
  const mult = 1 + (GRADES[gradeId].score - GRADES[device.grade].score) * 0.06;
  return Math.round(storage.price * mult);
}

/**
 * Re-price the submitted lines from the catalog. Returns undefined when any
 * line references a device/storage we don't sell — that's a tampered or stale
 * cart and the order must not proceed.
 */
export function priceOrder(lines: OrderLine[], express: boolean): PricedOrder | undefined {
  if (lines.length === 0) return undefined;
  const priced: OrderLine[] = [];
  for (const line of lines) {
    const qty = Math.floor(line.qty);
    if (!Number.isFinite(qty) || qty < 1 || qty > 999) return undefined;
    const unit = serverUnit({ ...line, qty });
    if (unit === undefined) return undefined;
    priced.push({ ...line, qty, unit });
  }
  const subtotal = priced.reduce((sum, l) => sum + l.unit * l.qty, 0);
  const deliveryCost = express ? EXPRESS_FEE : 0;
  const tax = Math.round((subtotal + deliveryCost) * TAX_RATE);
  return { lines: priced, subtotal, deliveryCost, tax, total: subtotal + deliveryCost + tax };
}

/**
 * Check requested quantities against live warehouse stock (per catalog slug —
 * the finest grain the inventory sheet tracks). Returns the names of devices
 * we can't cover; empty array means the order is coverable. Fails open when
 * the stock feed itself is unreachable (never blocks checkout on our outage).
 */
export async function stockShortfalls(lines: OrderLine[]): Promise<string[]> {
  try {
    const stock = await catalogStock();
    const wanted = new Map<string, { name: string; qty: number }>();
    for (const l of lines) {
      if (!l.slug) continue;
      const cur = wanted.get(l.slug);
      wanted.set(l.slug, { name: l.name, qty: (cur?.qty ?? 0) + l.qty });
    }
    const short: string[] = [];
    for (const [slug, w] of wanted) {
      const have = stock[slug];
      if (have !== undefined && have < w.qty) short.push(w.name);
    }
    return short;
  } catch {
    return [];
  }
}
