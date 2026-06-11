"use client";

import { useState } from "react";
import Icon from "@/components/Icon";

const PLANS = ["free", "starter", "pro", "enterprise"];
const STATUSES = ["active", "past_due", "cancelled"];

const PLAN_STYLE = {
  free: "bg-paper-100 text-ink-700 border-ink-100",
  starter: "bg-amber-50 text-amber-800 border-amber-200",
  pro: "bg-brand-50 text-brand-700 border-brand-100",
  enterprise: "bg-ink-900 text-paper-50 border-ink-900",
};
const STATUS_STYLE = {
  active: "bg-emerald-50 text-emerald-700 border-emerald-100",
  past_due: "bg-amber-50 text-amber-800 border-amber-200",
  cancelled: "bg-paper-100 text-ink-400 border-ink-100",
};

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
    // optimistic update so the pill flips colour instantly
    setRows((rs) => rs.map((r) => (r.id === bizId ? { ...r, ...patch } : r)));
    const res = await fetch(`/api/admin/subscriptions/${bizId}`, {
      method: "PUT",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(patch),
    });
    if (!res.ok) refresh();
    else refresh();
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col items-start justify-between gap-3 sm:flex-row sm:items-end">
        <div>
          <h1 className="section-title">Businesses</h1>
          <p className="muted">Every shop owner on Clipper and their current plan.</p>
        </div>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            refresh();
          }}
          className="flex w-full gap-2 sm:w-auto"
        >
          <div className="relative flex-1 sm:w-64 sm:flex-initial">
            <Icon
              name="search"
              className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-400"
            />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search by name or email…"
              className="input w-full pl-9"
            />
          </div>
          <button className="btn-dark" disabled={busy}>
            {busy ? "Searching…" : "Search"}
          </button>
        </form>
      </div>

      {rows.length === 0 ? (
        <div className="card py-12 text-center text-sm text-ink-400">
          No businesses yet.
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {rows.map((b) => (
            <BusinessRow
              key={b.id}
              b={b}
              onPlan={(v) => updateSub(b.id, { plan: v })}
              onStatus={(v) => updateSub(b.id, { status: v })}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function BusinessRow({ b, onPlan, onStatus }) {
  const plan = b.plan || "free";
  const status = b.status || "active";

  return (
    <div className="card flex flex-col gap-4 lg:flex-row lg:items-center">
      {/* Identity */}
      <div className="flex min-w-0 flex-1 items-center gap-3">
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-brand-50 text-brand-700">
          <Icon name="store" className="h-5 w-5" />
        </span>
        <div className="min-w-0">
          <p className="truncate font-bold text-ink-900">{b.name}</p>
          <p className="truncate text-xs text-ink-400">
            {b.owner_name} <span className="text-ink-200">·</span> {b.owner_email}
          </p>
          <p className="mt-0.5 text-[10px] uppercase tracking-widest text-ink-400">
            Joined {new Date(b.created_at).toLocaleDateString()}
          </p>
        </div>
      </div>

      {/* Counts */}
      <div className="flex gap-4 border-t border-ink-100 pt-3 lg:border-0 lg:border-l lg:pt-0 lg:pl-5">
        <Mini label="Shops" v={b.shop_count} />
        <Mini label="Barbers" v={b.barber_count} />
        <Mini label="Bookings" v={b.booking_count} />
      </div>

      {/* Plan + Status */}
      <div className="flex flex-wrap items-center gap-2 lg:flex-nowrap lg:border-l lg:border-ink-100 lg:pl-5">
        <PillSelect
          label="Plan"
          value={plan}
          options={PLANS}
          color={PLAN_STYLE[plan]}
          onChange={onPlan}
        />
        <PillSelect
          label="Status"
          value={status}
          options={STATUSES}
          color={STATUS_STYLE[status]}
          onChange={onStatus}
        />
      </div>

      {/* MRR + renews */}
      <div className="flex items-end justify-between gap-4 border-t border-ink-100 pt-3 lg:border-0 lg:border-l lg:pt-0 lg:pl-5">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-widest text-ink-400">
            Renews
          </p>
          <p className="text-xs text-ink-700">
            {b.current_period_end
              ? new Date(b.current_period_end).toLocaleDateString()
              : "—"}
          </p>
        </div>
        <div className="text-right">
          <p className="text-[10px] font-bold uppercase tracking-widest text-ink-400">MRR</p>
          <p className="display text-2xl tabular-nums text-ink-900">
            ${Number(b.monthly_amount || 0).toFixed(0)}
          </p>
        </div>
      </div>
    </div>
  );
}

function Mini({ label, v }) {
  return (
    <div>
      <p className="text-[10px] font-bold uppercase tracking-widest text-ink-400">{label}</p>
      <p className="display text-lg tabular-nums text-ink-900">{v ?? 0}</p>
    </div>
  );
}

function PillSelect({ label, value, options, color, onChange }) {
  return (
    <label className="relative flex flex-col gap-1">
      <span className="sr-only">{label}</span>
      <span
        className={`relative inline-flex items-center rounded-full border ${color} px-3 py-1.5 pr-8 text-[11px] font-bold uppercase tracking-widest shadow-soft`}
      >
        {value.replace("_", " ")}
        <svg
          className="pointer-events-none absolute right-2 top-1/2 h-3 w-3 -translate-y-1/2 opacity-70"
          viewBox="0 0 12 12"
          fill="currentColor"
        >
          <path d="M6 8.5 1.8 4h8.4z" />
        </svg>
        <select
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="absolute inset-0 cursor-pointer opacity-0"
          aria-label={label}
        >
          {options.map((o) => (
            <option key={o} value={o}>
              {o.replace("_", " ")}
            </option>
          ))}
        </select>
      </span>
    </label>
  );
}
