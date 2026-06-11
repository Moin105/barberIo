"use client";

import { useState } from "react";

const PLANS = ["free", "starter", "pro", "enterprise"];
const STATUSES = ["active", "past_due", "cancelled"];

export default function BusinessesTable({ initial, initialQuery }) {
  const [rows, setRows] = useState(initial);
  const [query, setQuery] = useState(initialQuery);
  const [busy, setBusy] = useState(false);

  async function refresh(q = query) {
    setBusy(true);
    const res = await fetch(`/api/admin/businesses${q ? `?q=${encodeURIComponent(q)}` : ""}`);
    const data = await res.json().catch(() => ({}));
    setRows(data.businesses || []);
    setBusy(false);
  }

  async function updateSub(bizId, patch) {
    const res = await fetch(`/api/admin/subscriptions/${bizId}`, {
      method: "PUT",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(patch),
    });
    if (res.ok) refresh();
  }

  return (
    <div className="grid gap-6">
      <div className="flex items-end justify-between gap-3">
        <div>
          <h1 className="section-title">Businesses</h1>
          <p className="muted">Every shop owner on Clipper and their current plan.</p>
        </div>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            refresh();
          }}
          className="flex gap-2"
        >
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by name or email…"
            className="input w-64"
          />
          <button className="btn-dark" disabled={busy}>
            {busy ? "Searching…" : "Search"}
          </button>
        </form>
      </div>

      <div className="card overflow-x-auto p-0">
        <table className="w-full text-sm">
          <thead className="text-left text-xs font-bold uppercase tracking-wider text-ink-400">
            <tr className="border-b border-ink-100">
              <th className="px-4 py-3">Business</th>
              <th className="px-4 py-3">Owner</th>
              <th className="px-4 py-3">Shops · Barbers</th>
              <th className="px-4 py-3">Bookings</th>
              <th className="px-4 py-3">Plan</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Renews</th>
              <th className="px-4 py-3 text-right">MRR</th>
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 && (
              <tr>
                <td colSpan={8} className="py-10 text-center text-ink-400">
                  No businesses yet.
                </td>
              </tr>
            )}
            {rows.map((b) => (
              <tr key={b.id} className="border-b border-ink-100 last:border-0">
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    <div className="grid h-8 w-8 place-items-center rounded-lg bg-brand-50">💈</div>
                    <div>
                      <p className="font-semibold text-ink-900">{b.name}</p>
                      <p className="text-xs text-ink-400">
                        joined {new Date(b.created_at).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                </td>
                <td className="px-4 py-3">
                  <p className="font-semibold">{b.owner_name}</p>
                  <p className="text-xs text-ink-400">{b.owner_email}</p>
                </td>
                <td className="px-4 py-3">
                  <span className="pill-slate">{b.shop_count} · {b.barber_count}</span>
                </td>
                <td className="px-4 py-3">{b.booking_count}</td>
                <td className="px-4 py-3">
                  <select
                    value={b.plan || "free"}
                    onChange={(e) => updateSub(b.id, { plan: e.target.value })}
                    className="input py-1.5 text-xs"
                  >
                    {PLANS.map((p) => (
                      <option key={p} value={p}>
                        {p}
                      </option>
                    ))}
                  </select>
                </td>
                <td className="px-4 py-3">
                  <select
                    value={b.status || "active"}
                    onChange={(e) => updateSub(b.id, { status: e.target.value })}
                    className="input py-1.5 text-xs"
                  >
                    {STATUSES.map((s) => (
                      <option key={s} value={s}>
                        {s}
                      </option>
                    ))}
                  </select>
                </td>
                <td className="px-4 py-3 text-xs text-ink-400">
                  {b.current_period_end
                    ? new Date(b.current_period_end).toLocaleDateString()
                    : "—"}
                </td>
                <td className="px-4 py-3 text-right font-bold">
                  ${(b.monthly_amount || 0).toFixed(0)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
