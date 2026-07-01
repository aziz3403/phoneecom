"use client";

import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  Package, Recycle, Boxes, BadgeCheck, Check, X, Truck, RefreshCw,
} from "lucide-react";
import {
  shipOrderAction, updateTradeInStatusAction, decideWholesaleAction,
  closeBulkQuoteAction, type TradeInStatus,
} from "@/lib/admin-actions";
import type { AdminTradeIn, AdminBulkQuote, AdminApplication } from "@/lib/admin";
import type { FullOrder } from "@/lib/orders";
import { formatPrice, cn } from "@/lib/utils";

type Tab = "orders" | "tradeins" | "bulk" | "wholesale";

const TABS: Array<{ id: Tab; label: string; icon: typeof Package }> = [
  { id: "orders", label: "Orders", icon: Package },
  { id: "tradeins", label: "Trade-ins", icon: Recycle },
  { id: "bulk", label: "Bulk quotes", icon: Boxes },
  { id: "wholesale", label: "Wholesale", icon: BadgeCheck },
];

const TRADE_IN_STATUSES: TradeInStatus[] = [
  "Submitted", "Received", "Inspected", "Requoted", "Paid", "Returned", "Cancelled",
];

function fmtDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

function StatusPill({ status }: { status: string }) {
  const tone =
    ["Confirmed", "Paid", "Approved", "Quoted"].includes(status) ? "bg-[#edf6f0] text-[#0a7d61]"
    : ["Shipped", "Received", "Inspected"].includes(status) ? "bg-[#eef2fb] text-[#3b5bb8]"
    : ["Rejected", "Cancelled", "Returned"].includes(status) ? "bg-[#fbeaea] text-[#b23b3b]"
    : "bg-[#f2f2f4] text-[#6e6e73]";
  return <span className={cn("rounded-full px-2.5 py-0.5 text-[11.5px] font-semibold", tone)}>{status}</span>;
}

export function AdminDashboard({
  orders, tradeIns, bulkQuotes, applications, stockUnits,
}: {
  orders: FullOrder[];
  tradeIns: AdminTradeIn[];
  bulkQuotes: AdminBulkQuote[];
  applications: AdminApplication[];
  stockUnits: number;
}) {
  const [tab, setTab] = useState<Tab>("orders");
  const pendingApps = useMemo(() => applications.filter((a) => a.status === "Pending"), [applications]);
  const openTradeIns = useMemo(() => tradeIns.filter((t) => !["Paid", "Returned", "Cancelled"].includes(t.status)), [tradeIns]);
  const newQuotes = useMemo(() => bulkQuotes.filter((q) => q.status === "New"), [bulkQuotes]);

  const stats = [
    { label: "Orders", value: orders.length },
    { label: "Open trade-ins", value: openTradeIns.length },
    { label: "New bulk quotes", value: newQuotes.length },
    { label: "Pending applications", value: pendingApps.length },
    { label: "Warehouse units", value: stockUnits },
  ];

  return (
    <div className="mx-auto w-full max-w-[1180px] px-[22px] pb-24">
      <div className="grid gap-3 pt-2 sm:grid-cols-3 lg:grid-cols-5">
        {stats.map((s) => (
          <div key={s.label} className="rounded-[16px] border border-[#e2e2e6] px-4 py-3.5">
            <p className="text-[24px] font-bold leading-none tracking-[-.02em] text-[#1d1d1f]">{s.value}</p>
            <p className="mt-1.5 text-[12.5px] text-[#86868b]">{s.label}</p>
          </div>
        ))}
      </div>

      <div className="mt-8 flex flex-wrap gap-2">
        {TABS.map((t) => (
          <button key={t.id} onClick={() => setTab(t.id)} className={cn("chip inline-flex items-center gap-1.5", tab === t.id && "on accent")}>
            <t.icon className="h-3.5 w-3.5" /> {t.label}
          </button>
        ))}
      </div>

      <div className="mt-6">
        {tab === "orders" && <OrdersPanel orders={orders} />}
        {tab === "tradeins" && <TradeInsPanel tradeIns={tradeIns} />}
        {tab === "bulk" && <BulkPanel quotes={bulkQuotes} />}
        {tab === "wholesale" && <WholesalePanel applications={applications} />}
      </div>
    </div>
  );
}

/* --------------------------------- orders --------------------------------- */

function OrdersPanel({ orders }: { orders: FullOrder[] }) {
  if (orders.length === 0) return <Empty text="No orders yet." />;
  return (
    <div className="flex flex-col gap-3">
      {orders.map((o) => (
        <OrderRow key={o.id} order={o} />
      ))}
    </div>
  );
}

function OrderRow({ order }: { order: FullOrder }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [carrier, setCarrier] = useState("UPS Ground");
  const [tracking, setTracking] = useState("");
  const [err, setErr] = useState("");
  const [busy, start] = useTransition();
  const shippable = order.status === "Confirmed";

  function ship() {
    setErr("");
    start(async () => {
      const res = await shipOrderAction({ orderId: order.id, carrier, trackingNumber: tracking });
      if (!res.ok) setErr(res.error ?? "Failed.");
      else { setOpen(false); router.refresh(); }
    });
  }

  return (
    <div className="rounded-[16px] border border-[#e2e2e6] px-5 py-4">
      <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
        <span className="font-mono text-[13.5px] font-semibold text-[#1d1d1f]">{order.id}</span>
        <StatusPill status={order.status} />
        <span className="text-[13px] text-[#6e6e73]">{fmtDate(order.createdAt)}</span>
        <span className="text-[13px] text-[#6e6e73]">{order.email ?? "—"}</span>
        <span className="ml-auto text-[14.5px] font-bold text-[#1d1d1f]">{formatPrice(order.total)}</span>
        {shippable && (
          <button onClick={() => setOpen((v) => !v)} className="btn btn-lt !h-8 !px-3.5 !text-[13px]">
            <Truck className="h-3.5 w-3.5" /> Ship
          </button>
        )}
      </div>
      <p className="mt-1.5 text-[12.5px] text-[#86868b]">
        {(order.lines ?? []).map((l) => `${l.qty}× ${l.name}`).join(" · ")}
        {order.trackingNumber ? ` · ${order.carrier ?? ""} ${order.trackingNumber}` : ""}
      </p>
      {open && (
        <div className="mt-3 flex flex-wrap items-end gap-3 border-t border-[#eee] pt-3">
          <div>
            <label className="flabel" htmlFor={`carrier-${order.id}`}>Carrier</label>
            <input id={`carrier-${order.id}`} value={carrier} onChange={(e) => setCarrier(e.target.value)} className="inpt !w-[190px]" />
          </div>
          <div>
            <label className="flabel" htmlFor={`trk-${order.id}`}>Tracking number</label>
            <input id={`trk-${order.id}`} value={tracking} onChange={(e) => setTracking(e.target.value)} className="inpt !w-[230px]" placeholder="1Z…" />
          </div>
          <button onClick={ship} disabled={busy || !tracking.trim()} className={cn("btn !h-10", (busy || !tracking.trim()) && "opacity-50")}>
            {busy ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />} Mark shipped &amp; email buyer
          </button>
          {err && <p className="text-[12.5px] text-[#b23b3b]">{err}</p>}
        </div>
      )}
    </div>
  );
}

/* -------------------------------- trade-ins -------------------------------- */

function TradeInsPanel({ tradeIns }: { tradeIns: AdminTradeIn[] }) {
  if (tradeIns.length === 0) return <Empty text="No trade-in submissions yet." />;
  return (
    <div className="flex flex-col gap-3">
      {tradeIns.map((t) => (
        <TradeInRow key={t.id} t={t} />
      ))}
    </div>
  );
}

function TradeInRow({ t }: { t: AdminTradeIn }) {
  const router = useRouter();
  const [status, setStatus] = useState<TradeInStatus>(t.status as TradeInStatus);
  const [note, setNote] = useState("");
  const [err, setErr] = useState("");
  const [busy, start] = useTransition();

  function update() {
    setErr("");
    start(async () => {
      const res = await updateTradeInStatusAction({ id: t.id, status, note });
      if (!res.ok) setErr(res.error ?? "Failed.");
      else { setNote(""); router.refresh(); }
    });
  }

  return (
    <div className="rounded-[16px] border border-[#e2e2e6] px-5 py-4">
      <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
        <span className="font-mono text-[13.5px] font-semibold text-[#1d1d1f]">{t.id}</span>
        <StatusPill status={t.status} />
        <span className="text-[13px] text-[#6e6e73]">{fmtDate(t.createdAt)}</span>
        <span className="text-[13px] text-[#6e6e73]">{t.firstName} {t.lastName} · {t.email} · {t.phone}</span>
        <span className="ml-auto text-[14.5px] font-bold text-[#0a7d61]">{formatPrice(t.total)}</span>
      </div>
      <p className="mt-1.5 text-[12.5px] text-[#86868b]">
        {t.lines.map((l) => `${l.qty}× ${l.name} ${l.gb}GB ${l.color} (${l.grade.toUpperCase()})`).join(" · ")}
        {" · "}payout: {t.payoutMethod}
        {" · "}{t.freeShip ? "free label owed" : "ships at seller's cost"}
      </p>
      <div className="mt-3 flex flex-wrap items-end gap-3 border-t border-[#eee] pt-3">
        <div>
          <label className="flabel" htmlFor={`st-${t.id}`}>Status</label>
          <select id={`st-${t.id}`} value={status} onChange={(e) => setStatus(e.target.value as TradeInStatus)} className="sel !w-[160px]">
            {TRADE_IN_STATUSES.map((s) => (<option key={s}>{s}</option>))}
          </select>
        </div>
        <div className="min-w-[240px] flex-1">
          <label className="flabel" htmlFor={`nt-${t.id}`}>Note to seller (optional — included in the email)</label>
          <input id={`nt-${t.id}`} value={note} onChange={(e) => setNote(e.target.value)} className="inpt" placeholder="e.g. screen had deep scratches — revised to $180" />
        </div>
        <button onClick={update} disabled={busy || status === t.status && !note.trim()} className={cn("btn !h-10", busy && "opacity-50")}>
          {busy ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />} Update &amp; email seller
        </button>
        {err && <p className="text-[12.5px] text-[#b23b3b]">{err}</p>}
      </div>
    </div>
  );
}

/* ------------------------------- bulk quotes ------------------------------- */

function BulkPanel({ quotes }: { quotes: AdminBulkQuote[] }) {
  const router = useRouter();
  const [busy, start] = useTransition();
  if (quotes.length === 0) return <Empty text="No bulk quote requests yet." />;
  return (
    <div className="flex flex-col gap-3">
      {quotes.map((q) => (
        <div key={q.id} className="rounded-[16px] border border-[#e2e2e6] px-5 py-4">
          <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
            <span className="text-[13.5px] font-semibold text-[#1d1d1f]">{q.firstName} {q.lastName}{q.company ? ` · ${q.company}` : ""}</span>
            <StatusPill status={q.status} />
            <span className="text-[13px] text-[#6e6e73]">{fmtDate(q.createdAt)}</span>
            <span className="text-[13px] text-[#6e6e73]">{q.email} · {q.phone}</span>
            <span className="ml-auto text-[13px] font-semibold text-[#1d1d1f]">{q.batchSize} devices</span>
            {q.status === "New" && (
              <button
                disabled={busy}
                onClick={() => start(async () => { await closeBulkQuoteAction({ id: q.id, status: "Quoted" }); router.refresh(); })}
                className="btn btn-lt !h-8 !px-3.5 !text-[13px]"
              >
                <Check className="h-3.5 w-3.5" /> Mark quoted
              </button>
            )}
          </div>
          {q.notes && <p className="mt-1.5 text-[12.5px] text-[#86868b]">{q.notes}</p>}
        </div>
      ))}
    </div>
  );
}

/* -------------------------------- wholesale -------------------------------- */

function WholesalePanel({ applications }: { applications: AdminApplication[] }) {
  const router = useRouter();
  const [busy, start] = useTransition();
  if (applications.length === 0) return <Empty text="No wholesale applications yet." />;

  function decide(id: string, approve: boolean) {
    start(async () => {
      await decideWholesaleAction({ applicationId: id, approve });
      router.refresh();
    });
  }

  return (
    <div className="flex flex-col gap-3">
      {applications.map((a) => (
        <div key={a.id} className="rounded-[16px] border border-[#e2e2e6] px-5 py-4">
          <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
            <span className="text-[13.5px] font-semibold text-[#1d1d1f]">{a.company}</span>
            <StatusPill status={a.status} />
            <span className="text-[13px] text-[#6e6e73]">{fmtDate(a.createdAt)}</span>
            <span className="text-[13px] text-[#6e6e73]">{a.name} · {a.email}</span>
            <span className="text-[13px] text-[#6e6e73]">{a.volume ?? "—"} · {a.businessType ?? "—"} · {a.region ?? "—"}</span>
            {a.status === "Pending" && (
              <span className="ml-auto flex gap-2">
                <button disabled={busy} onClick={() => decide(a.id, true)} className="btn !h-8 !bg-[#0a8f6e] !px-3.5 !text-[13px]">
                  <Check className="h-3.5 w-3.5" /> Approve
                </button>
                <button disabled={busy} onClick={() => decide(a.id, false)} className="btn btn-lt !h-8 !px-3.5 !text-[13px]">
                  <X className="h-3.5 w-3.5" /> Reject
                </button>
              </span>
            )}
          </div>
          {a.message && <p className="mt-1.5 text-[12.5px] text-[#86868b]">{a.message}</p>}
        </div>
      ))}
    </div>
  );
}

function Empty({ text }: { text: string }) {
  return (
    <div className="rounded-[16px] border border-dashed border-[#d2d2d7] py-14 text-center text-[14px] text-[#86868b]">
      {text}
    </div>
  );
}
