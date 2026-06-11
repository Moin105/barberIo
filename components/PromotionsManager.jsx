"use client";

import { useState } from "react";
import Icon from "@/components/Icon";

function isLive(p) {
  if (!p.active) return false;
  const now = Date.now();
  if (p.starts_at && new Date(p.starts_at).getTime() > now) return false;
  if (p.ends_at && new Date(p.ends_at).getTime() <= now) return false;
  return true;
}

export default function PromotionsManager({ initial }) {
  const [rows, setRows] = useState(initial);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(null);

  async function refresh() {
    const res = await fetch("/api/owner/promotions", { cache: "no-store" });
    if (res.ok) {
      const d = await res.json();
      setRows(d.promotions || []);
    }
  }

  async function add(e) {
    e.preventDefault();
    setError(null);
    setBusy(true);
    const fd = new FormData(e.currentTarget);
    const payload = Object.fromEntries(fd.entries());
    if (payload.ends_at === "") delete payload.ends_at;
    if (payload.starts_at === "") delete payload.starts_at;
    const res = await fetch("/api/owner/promotions", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(payload),
    });
    const d = await res.json().catch(() => ({}));
    setBusy(false);
    if (!res.ok) {
      setError(d.error || "Failed to publish promotion");
      return;
    }
    e.target.reset();
    refresh();
  }

  async function toggle(id, active) {
    setRows((rs) => rs.map((r) => (r.id === id ? { ...r, active } : r)));
    await fetch(`/api/owner/promotions/${id}`, {
      method: "PUT",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ active }),
    });
    refresh();
  }

  async function remove(id) {
    if (!confirm("Delete this promotion? Customers will stop seeing it.")) return;
    await fetch(`/api/owner/promotions/${id}`, { method: "DELETE" });
    refresh();
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <span className="eyebrow">Marketing</span>
        <h1 className="section-title mt-2">Deals & promotions</h1>
        <p className="muted">
          Run a promo and customers will see it on the Clipper homepage in the Deals section.
        </p>
      </div>

      <div className="flex flex-col gap-3">
        {rows.length === 0 && (
          <div className="card text-center text-ink-400">
            No promotions yet. Add one below — first-cut discounts, beard combos, student
            rates, whatever pulls people in.
          </div>
        )}
        {rows.map((p) => {
          const live = isLive(p);
          return (
            <div key={p.id} className="card flex flex-col gap-3 md:flex-row md:items-start">
              <div className="flex shrink-0 items-start gap-3">
                {p.image_url ? (
                  <img
                    src={p.image_url}
                    alt=""
                    className="h-20 w-20 rounded-md object-cover"
                  />
                ) : (
                  <span className="flex h-20 w-20 items-center justify-center rounded-md bg-brand-50 text-brand-700">
                    <Icon name="megaphone" className="h-7 w-7" />
                  </span>
                )}
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <p className="display text-lg text-ink-900">{p.title}</p>
                  <span className={live ? "pill-green" : "pill-slate"}>
                    {live ? "Live" : p.active ? "Scheduled" : "Paused"}
                  </span>
                </div>
                <p className="mt-1 text-sm text-ink-700">{p.body}</p>
                <p className="mt-2 text-[10px] uppercase tracking-widest text-ink-400">
                  {p.starts_at
                    ? `From ${new Date(p.starts_at).toLocaleDateString()}`
                    : "Starts immediately"}
                  {" · "}
                  {p.ends_at
                    ? `Until ${new Date(p.ends_at).toLocaleDateString()}`
                    : "No end date"}
                  {p.cta_label && p.cta_href ? ` · CTA: ${p.cta_label}` : ""}
                </p>
              </div>
              <div className="flex shrink-0 flex-wrap items-center gap-2">
                <button
                  onClick={() => toggle(p.id, !p.active)}
                  className="btn-ghost text-xs"
                  title={p.active ? "Pause" : "Resume"}
                >
                  {p.active ? "Pause" : "Resume"}
                </button>
                <button
                  onClick={() => remove(p.id)}
                  className="inline-flex items-center gap-1 text-xs text-brand-600 hover:underline"
                >
                  <Icon name="trash" className="h-3.5 w-3.5" /> Delete
                </button>
              </div>
            </div>
          );
        })}
      </div>

      <form onSubmit={add} className="card flex flex-col gap-3">
        <h2 className="display inline-flex items-center gap-2 text-lg">
          <Icon name="plus" className="h-4 w-4 text-brand-700" /> New promotion
        </h2>
        <div className="flex flex-col gap-3 sm:flex-row">
          <div className="flex-1">
            <label className="label">Title</label>
            <input
              name="title"
              required
              maxLength={80}
              className="input"
              placeholder="e.g. First-cut 30% off"
            />
          </div>
          <div className="flex-1">
            <label className="label">Call-to-action label</label>
            <input
              name="cta_label"
              className="input"
              placeholder="Book now (optional)"
            />
          </div>
        </div>
        <div>
          <label className="label">Description</label>
          <textarea
            name="body"
            required
            maxLength={240}
            rows={2}
            className="input"
            placeholder="What's the offer, what's the catch, who's it for?"
          />
        </div>
        <div className="flex flex-col gap-3 sm:flex-row">
          <div className="flex-1">
            <label className="label">Image URL (optional)</label>
            <input name="image_url" className="input" placeholder="https://…" />
          </div>
          <div className="flex-1">
            <label className="label">CTA link (optional)</label>
            <input name="cta_href" className="input" placeholder="/shops/123 or https://…" />
          </div>
        </div>
        <div className="flex flex-col gap-3 sm:flex-row">
          <div className="flex-1">
            <label className="label">Starts</label>
            <input name="starts_at" type="datetime-local" className="input" />
          </div>
          <div className="flex-1">
            <label className="label">Ends</label>
            <input name="ends_at" type="datetime-local" className="input" />
          </div>
        </div>
        {error && (
          <div className="rounded-md border border-brand-100 bg-brand-50 px-3 py-2 text-sm text-brand-700">
            {error}
          </div>
        )}
        <button disabled={busy} className="btn-primary w-fit">
          {busy ? "Publishing…" : "Publish promotion"}
        </button>
      </form>
    </div>
  );
}
