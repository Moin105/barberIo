"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Icon from "@/components/Icon";

function fmtMoney(n) {
  return `$${Number(n || 0).toFixed(2)}`;
}

export default function InvoicesList({ data, initial }) {
  const router = useRouter();
  const [from, setFrom] = useState(initial.from || "");
  const [to, setTo] = useState(initial.to || "");

  function apply() {
    const url = new URL(window.location.href);
    if (from) url.searchParams.set("from", from);
    else url.searchParams.delete("from");
    if (to) url.searchParams.set("to", to);
    else url.searchParams.delete("to");
    router.push(url.pathname + (url.search ? url.search : ""));
  }

  const rows = data?.invoices || [];
  const totals = data?.totals || { subtotal: 0, tax: 0, total: 0 };

  // Per-barber roll-up for the side panel.
  const perBarber = Object.values(
    rows.reduce((acc, r) => {
      const k = r.barber_id;
      acc[k] ??= {
        barber_id: k,
        barber_name: r.barber_name,
        seat_number: r.seat_number,
        count: 0,
        subtotal: 0,
        tax: 0,
        total: 0,
      };
      acc[k].count += 1;
      acc[k].subtotal += Number(r.subtotal);
      acc[k].tax += Number(r.tax_amount);
      acc[k].total += Number(r.total);
      return acc;
    }, {})
  ).sort((a, b) => b.total - a.total);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col items-start justify-between gap-3 sm:flex-row sm:items-end">
        <div>
          <span className="eyebrow">Money</span>
          <h1 className="section-title mt-2">Invoices</h1>
          <p className="muted">
            Every completed visit becomes an invoice. Use it to track per-barber
            earnings and reconcile tax.
          </p>
        </div>
        <div className="flex items-end gap-2">
          <div>
            <label className="label">From</label>
            <input
              type="date"
              value={from}
              onChange={(e) => setFrom(e.target.value)}
              className="input"
            />
          </div>
          <div>
            <label className="label">To</label>
            <input
              type="date"
              value={to}
              onChange={(e) => setTo(e.target.value)}
              className="input"
            />
          </div>
          <button onClick={apply} className="btn-dark">
            Filter
          </button>
        </div>
      </div>

      <div className="flex flex-wrap gap-3">
        <Stat label="Invoices" v={rows.length} icon="calendar" />
        <Stat label="Subtotal" v={fmtMoney(totals.subtotal)} icon="scissors" />
        <Stat label="Tax collected" v={fmtMoney(totals.tax)} icon="trend" />
        <Stat label="Gross" v={fmtMoney(totals.total)} icon="wallet" highlight />
      </div>

      <div className="flex flex-col gap-6 lg:flex-row">
        <div className="card flex-1 overflow-x-auto p-0">
          <table className="w-full text-sm">
            <thead className="text-left text-xs font-bold uppercase tracking-widest text-ink-400">
              <tr className="border-b border-ink-100">
                <th className="px-4 py-3">Invoice</th>
                <th className="px-4 py-3">Customer</th>
                <th className="px-4 py-3">Barber</th>
                <th className="px-4 py-3 text-right">Subtotal</th>
                <th className="px-4 py-3 text-right">Tax</th>
                <th className="px-4 py-3 text-right">Total</th>
                <th className="px-4 py-3"></th>
              </tr>
            </thead>
            <tbody>
              {rows.length === 0 && (
                <tr>
                  <td colSpan={7} className="py-10 text-center text-ink-400">
                    No invoices in this window.
                  </td>
                </tr>
              )}
              {rows.map((r) => (
                <tr key={r.id} className="border-b border-ink-100 last:border-0">
                  <td className="px-4 py-3">
                    <p className="font-semibold tabular-nums">{r.invoice_number}</p>
                    <p className="text-xs text-ink-400">
                      {new Date(r.issued_at).toLocaleDateString()}
                    </p>
                  </td>
                  <td className="px-4 py-3">
                    <p className="font-medium">{r.customer_name}</p>
                    <p className="text-xs text-ink-400 truncate">{r.service_name}</p>
                  </td>
                  <td className="px-4 py-3">
                    <p>{r.barber_name}</p>
                    <p className="text-xs text-ink-400">Seat {r.seat_number}</p>
                  </td>
                  <td className="px-4 py-3 text-right tabular-nums">
                    {fmtMoney(r.subtotal)}
                  </td>
                  <td className="px-4 py-3 text-right tabular-nums text-ink-400">
                    {fmtMoney(r.tax_amount)}
                  </td>
                  <td className="px-4 py-3 text-right font-bold tabular-nums">
                    {fmtMoney(r.total)}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <Link
                      href={`/owner/invoices/${r.id}`}
                      className="inline-flex items-center gap-1 text-xs font-semibold text-brand-600 hover:underline"
                    >
                      View <Icon name="arrow" className="h-3 w-3" />
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <aside className="card h-fit w-full lg:w-72 lg:shrink-0">
          <h2 className="display text-lg text-ink-900">Per-barber</h2>
          <p className="text-xs text-ink-400">
            Earnings broken down for the filtered window.
          </p>
          <div className="mt-3 flex flex-col gap-3">
            {perBarber.length === 0 && (
              <p className="text-sm text-ink-400">No data yet.</p>
            )}
            {perBarber.map((b) => (
              <div key={b.barber_id} className="rounded-md border border-ink-100 p-3">
                <div className="flex items-center justify-between gap-2">
                  <p className="truncate font-semibold">{b.barber_name}</p>
                  <span className="pill-slate">Seat {b.seat_number}</span>
                </div>
                <p className="mt-1 text-[11px] uppercase tracking-widest text-ink-400">
                  {b.count} invoice{b.count > 1 ? "s" : ""}
                </p>
                <p className="display mt-1 text-2xl tabular-nums">{fmtMoney(b.total)}</p>
                <p className="text-xs text-ink-400">
                  {fmtMoney(b.subtotal)} earned · {fmtMoney(b.tax)} tax
                </p>
              </div>
            ))}
          </div>
        </aside>
      </div>
    </div>
  );
}

function Stat({ label, v, icon, highlight }) {
  return (
    <div
      className={`flex flex-1 basis-[180px] items-center gap-3 rounded-xl p-4 shadow-soft ${
        highlight
          ? "border border-brand-600 bg-brand-gradient text-paper-50"
          : "border border-ink-100 bg-paper-50"
      }`}
    >
      <span
        className={`flex h-9 w-9 items-center justify-center rounded-md ${
          highlight ? "bg-paper-50/15 text-paper-50" : "bg-brand-50 text-brand-700"
        }`}
      >
        <Icon name={icon} className="h-4 w-4" />
      </span>
      <div className="min-w-0">
        <p
          className={`text-[10px] font-bold uppercase tracking-widest ${
            highlight ? "text-paper-50/80" : "text-ink-400"
          }`}
        >
          {label}
        </p>
        <p className="display text-xl tabular-nums">{v}</p>
      </div>
    </div>
  );
}
