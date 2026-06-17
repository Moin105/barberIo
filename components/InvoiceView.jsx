"use client";

import Icon from "@/components/Icon";

function fmtMoney(n) {
  return `$${Number(n || 0).toFixed(2)}`;
}
function fmtDateTime(iso) {
  return new Date(iso).toLocaleString([], {
    weekday: "short",
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
}

export default function InvoiceView({ invoice, role = "customer" }) {
  function printInvoice() {
    window.print();
  }

  if (!invoice) {
    return (
      <div className="card text-center text-ink-400">
        Invoice not found.
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center justify-between gap-3 print:hidden">
        <p className="text-xs text-ink-400">
          {role === "owner"
            ? "Owner copy — track per-barber revenue and tax."
            : "Your copy of this visit. Print or screenshot for your records."}
        </p>
        <button onClick={printInvoice} className="btn-dark inline-flex items-center gap-1.5 text-sm">
          <Icon name="external" className="h-4 w-4" /> Print
        </button>
      </div>

      <article
        id="invoice"
        className="card relative overflow-hidden bg-paper-50 p-8 print:border-0 print:shadow-none"
      >
        <span className="pointer-events-none absolute inset-y-0 left-0 w-1 barber-pole" />

        <header className="flex flex-wrap items-start justify-between gap-4 pl-3">
          <div>
            <span className="eyebrow">Invoice</span>
            <h1 className="display mt-2 text-3xl text-ink-900">
              {invoice.business_name}
            </h1>
            <p className="text-xs text-ink-400">
              {invoice.shop_name}
              {invoice.shop_address ? ` · ${invoice.shop_address}` : ""}
            </p>
          </div>
          <div className="text-right">
            <p className="text-[10px] font-bold uppercase tracking-widest text-ink-400">
              Invoice no.
            </p>
            <p className="display text-xl tabular-nums">{invoice.invoice_number}</p>
            <p className="mt-1 text-[10px] uppercase tracking-widest text-ink-400">
              Issued {new Date(invoice.issued_at).toLocaleDateString()}
            </p>
          </div>
        </header>

        <div className="mt-6 flex flex-wrap gap-6 pl-3 text-sm">
          <div className="flex-1 min-w-[180px]">
            <p className="text-[10px] font-bold uppercase tracking-widest text-ink-400">
              Customer
            </p>
            <p className="font-semibold">{invoice.customer_name}</p>
            <p className="text-xs text-ink-400">{invoice.customer_email}</p>
            {invoice.customer_phone && (
              <p className="text-xs text-ink-400">{invoice.customer_phone}</p>
            )}
          </div>
          <div className="flex-1 min-w-[180px]">
            <p className="text-[10px] font-bold uppercase tracking-widest text-ink-400">
              Visit
            </p>
            <p className="font-semibold">{fmtDateTime(invoice.start_at)}</p>
            <p className="text-xs text-ink-400">
              {invoice.barber_name} · Seat {invoice.seat_number}
            </p>
          </div>
        </div>

        <table className="mt-7 w-full pl-3 text-sm">
          <thead>
            <tr className="border-b border-ink-100 text-left text-[10px] font-bold uppercase tracking-widest text-ink-400">
              <th className="py-2">Description</th>
              <th className="py-2">Barber</th>
              <th className="py-2 text-right">Amount</th>
            </tr>
          </thead>
          <tbody>
            <tr className="border-b border-ink-100">
              <td className="py-3">
                <p className="font-semibold">{invoice.service_name}</p>
                <p className="text-xs text-ink-400">
                  {invoice.duration_min} min at {invoice.shop_name}
                </p>
              </td>
              <td className="py-3">{invoice.barber_name}</td>
              <td className="py-3 text-right tabular-nums">{fmtMoney(invoice.subtotal)}</td>
            </tr>
          </tbody>
        </table>

        <div className="mt-4 flex justify-end pl-3">
          <dl className="w-full max-w-xs space-y-1.5 text-sm">
            <div className="flex justify-between">
              <dt className="text-ink-400">Subtotal</dt>
              <dd className="tabular-nums">{fmtMoney(invoice.subtotal)}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-ink-400">
                {invoice.tax_label} ({Number(invoice.tax_rate).toFixed(2)}%)
              </dt>
              <dd className="tabular-nums">{fmtMoney(invoice.tax_amount)}</dd>
            </div>
            <div className="flex items-baseline justify-between border-t border-ink-100 pt-2">
              <dt className="display text-lg">Total</dt>
              <dd className="display text-2xl tabular-nums">{fmtMoney(invoice.total)}</dd>
            </div>
          </dl>
        </div>

        <footer className="mt-8 border-t border-ink-100 pl-3 pt-4 text-[10px] uppercase tracking-widest text-ink-400">
          Paid in person at the shop · Clipper invoice {invoice.invoice_number}
        </footer>
      </article>
    </div>
  );
}
