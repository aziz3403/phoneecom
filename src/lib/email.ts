import "server-only";
import type { OrderLine } from "./orders";
import { formatPrice } from "./utils";
import { SITE_NAME } from "./site";

/**
 * Transactional email via Resend — the same provider the auth flows already
 * use. Everything here is best-effort and never throws: a missing key or a
 * network hiccup must never break checkout, trade-ins or the admin panel.
 * Set OWNER_NOTIFY_EMAIL to receive owner alerts (falls back to AUTH_EMAIL_FROM).
 */

export function isEmailConfigured(): boolean {
  return Boolean(process.env.RESEND_API_KEY && process.env.AUTH_EMAIL_FROM);
}

export async function sendEmail(opts: {
  to: string;
  subject: string;
  html: string;
}): Promise<boolean> {
  if (!isEmailConfigured()) return false;
  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: process.env.AUTH_EMAIL_FROM,
        to: opts.to,
        subject: opts.subject,
        html: opts.html,
      }),
    });
    return res.ok;
  } catch {
    return false;
  }
}

/** Alert the store owner (new order, trade-in, application…). */
export async function notifyOwner(subject: string, html: string): Promise<void> {
  const to = process.env.OWNER_NOTIFY_EMAIL ?? process.env.AUTH_EMAIL_FROM;
  if (!to) return;
  await sendEmail({ to, subject: `[${SITE_NAME}] ${subject}`, html });
}

/* ---------------------------------- layout ---------------------------------- */

function esc(s: string): string {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

function shell(title: string, body: string): string {
  return `<div style="font-family:-apple-system,Segoe UI,Roboto,Helvetica,Arial,sans-serif;max-width:560px;margin:0 auto;color:#1d1d1f">
  <div style="padding:22px 0 14px;font-size:20px;font-weight:700">re<span style="color:#0a8f6e">Mint</span></div>
  <h1 style="font-size:22px;margin:0 0 12px">${title}</h1>
  ${body}
  <p style="color:#86868b;font-size:12px;margin-top:28px">${SITE_NAME} · certified pre-owned devices. Questions? Just reply to this email.</p>
</div>`;
}

function linesTable(lines: OrderLine[]): string {
  const rows = lines
    .map(
      (l) => `<tr>
      <td style="padding:7px 0;border-bottom:1px solid #eee">${esc(l.name)} · ${l.gb >= 1024 ? `${l.gb / 1024}TB` : `${l.gb}GB`} · ${esc(l.colorName)}${l.qty > 1 ? ` × ${l.qty}` : ""}</td>
      <td style="padding:7px 0;border-bottom:1px solid #eee;text-align:right;white-space:nowrap">${formatPrice(l.unit * l.qty)}</td>
    </tr>`,
    )
    .join("");
  return `<table style="width:100%;border-collapse:collapse;font-size:14px">${rows}</table>`;
}

/* --------------------------------- templates --------------------------------- */

export function orderConfirmationEmail(o: {
  id: string;
  lines: OrderLine[];
  total: number;
  shipTo?: string;
  deliveryEta?: string;
}): { subject: string; html: string } {
  return {
    subject: `Order ${o.id} confirmed — thanks for shopping refurbished`,
    html: shell(
      "Your order is confirmed ✓",
      `<p style="font-size:15px;line-height:1.5">Order <b>${esc(o.id)}</b> is paid and heading to inspection &amp; packing.${o.deliveryEta ? ` Estimated delivery: <b>${esc(o.deliveryEta)}</b>.` : ""}</p>
      ${linesTable(o.lines)}
      <p style="font-size:15px;margin-top:10px;text-align:right"><b>Total ${formatPrice(o.total)}</b></p>
      ${o.shipTo ? `<p style="font-size:13.5px;color:#6e6e73;white-space:pre-line"><b style="color:#1d1d1f">Shipping to</b><br/>${esc(o.shipTo)}</p>` : ""}
      <p style="font-size:13.5px;color:#6e6e73">We'll email your tracking number the moment it ships. Every device is covered by our 12-month functional warranty and 30-day returns.</p>
      <p style="font-size:13.5px;color:#6e6e73">Check this order anytime — no account needed — with reference <b style="font-family:ui-monospace,monospace">${esc(o.id)}</b> and this email address on our <b>Track</b> page.</p>`,
    ),
  };
}

export function orderShippedEmail(o: {
  id: string;
  carrier: string;
  trackingNumber: string;
  deliveryEta?: string;
}): { subject: string; html: string } {
  return {
    subject: `Order ${o.id} has shipped 📦`,
    html: shell(
      "It's on the way",
      `<p style="font-size:15px;line-height:1.5">Order <b>${esc(o.id)}</b> is with the carrier.</p>
      <p style="font-size:15px;line-height:1.6"><b>${esc(o.carrier)}</b><br/>Tracking number: <b style="font-family:ui-monospace,monospace">${esc(o.trackingNumber)}</b>${o.deliveryEta ? `<br/>Estimated delivery: <b>${esc(o.deliveryEta)}</b>` : ""}</p>`,
    ),
  };
}

export function tradeInReceivedEmail(t: {
  id: string;
  firstName: string;
  total: number;
  deviceCount: number;
  payoutLabel: string;
  freeShip: boolean;
  shipToName: string;
  shipToLines: string[];
}): { subject: string; html: string } {
  return {
    subject: `Trade-in ${t.id} — your ${formatPrice(t.total)} offer is locked for 7 days`,
    html: shell(
      `${esc(t.firstName)}, your offer is locked: ${formatPrice(t.total)}`,
      `<p style="font-size:15px;line-height:1.5">Reference <b>${esc(t.id)}</b> · ${t.deviceCount} device${t.deviceCount === 1 ? "" : "s"} · paid ${esc(t.payoutLabel)} after inspection.</p>
      <p style="font-size:15px;line-height:1.6"><b>Next step — ship it to us:</b><br/>${esc(t.shipToName)}<br/>${t.shipToLines.map(esc).join("<br/>")}</p>
      <p style="font-size:13.5px;color:#6e6e73;line-height:1.6">${
        t.freeShip
          ? "Your batch qualifies for a free prepaid label — it's attached to a follow-up email within one business day."
          : "Batches under 5 devices are shipped at your cost (any tracked service works). Inspection is always free."
      }<br/>Your price is locked for <b>7 days</b>. If our inspection finds a different condition we'll email a revised offer with photos — accept it, or we return the device (return postage at your cost).<br/><br/>Track this trade-in anytime with reference <b style="font-family:ui-monospace,monospace">${esc(t.id)}</b> and this email address on our <b>Track</b> page — no account needed.</p>`,
    ),
  };
}

export function tradeInStatusEmail(t: {
  id: string;
  firstName: string;
  status: string;
  total: number;
  note?: string;
}): { subject: string; html: string } {
  const bodyByStatus: Record<string, string> = {
    Received: "Your devices arrived and are queued for inspection — usually done within 2 business days.",
    Inspected: "Inspection is complete and your payout has been approved at the quoted value.",
    Paid: `Your payout of ${formatPrice(t.total)} has been sent. Thanks for trading with reMint!`,
    Requoted: "Our inspection found a different condition than described, so your offer was revised — see the note below. Reply within 7 days to accept, or we'll return the device (return postage at your cost).",
  };
  return {
    subject: `Trade-in ${t.id}: ${t.status}`,
    html: shell(
      `Trade-in update — ${esc(t.status)}`,
      `<p style="font-size:15px;line-height:1.5">Hi ${esc(t.firstName)}, reference <b>${esc(t.id)}</b>:</p>
      <p style="font-size:15px;line-height:1.5">${esc(bodyByStatus[t.status] ?? `Status changed to ${t.status}.`)}</p>
      ${t.note ? `<p style="font-size:14px;color:#6e6e73;border-left:3px solid #0a8f6e;padding-left:10px;white-space:pre-line">${esc(t.note)}</p>` : ""}`,
    ),
  };
}

export function wholesaleDecisionEmail(a: {
  name: string;
  company: string;
  approved: boolean;
}): { subject: string; html: string } {
  return a.approved
    ? {
        subject: "Your reMint trade account is approved 🎉",
        html: shell(
          "Welcome aboard",
          `<p style="font-size:15px;line-height:1.6">Hi ${esc(a.name)}, the trade account for <b>${esc(a.company)}</b> is approved. Sign in and open the wholesale portal — volume pricing, the savings quote, live inventory and bulk ordering are now unlocked.</p>`,
        ),
      }
    : {
        subject: "About your reMint trade account application",
        html: shell(
          "Application update",
          `<p style="font-size:15px;line-height:1.6">Hi ${esc(a.name)}, we couldn't approve the trade account for <b>${esc(a.company)}</b> right now. Reply to this email if you'd like to share more about your business and we'll take another look.</p>`,
        ),
      };
}
