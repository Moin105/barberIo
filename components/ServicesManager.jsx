"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Icon from "@/components/Icon";

export default function ServicesManager({ initialServices }) {
  const router = useRouter();
  const [services, setServices] = useState(initialServices);
  const [error, setError] = useState(null);
  const [busy, setBusy] = useState(false);

  async function refresh() {
    const res = await fetch("/api/owner/services");
    if (res.ok) {
      const data = await res.json();
      setServices(data.services || []);
    }
  }

  async function add(e) {
    e.preventDefault();
    setError(null);
    setBusy(true);
    const fd = new FormData(e.currentTarget);
    const payload = Object.fromEntries(fd.entries());
    const res = await fetch("/api/owner/services", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(payload),
    });
    const data = await res.json().catch(() => ({}));
    setBusy(false);
    if (!res.ok) {
      setError(data.error || "Failed");
      return;
    }
    e.target.reset();
    refresh();
  }

  async function del(id) {
    if (!confirm("Delete this service from your menu?")) return;
    const res = await fetch(`/api/owner/services/${id}`, { method: "DELETE" });
    if (res.ok) refresh();
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="section-title">Services</h1>
        <p className="muted">
          Define the service menu once. Each barber can override the price for any service on
          their profile.
        </p>
      </div>

      <div className="flex flex-col gap-3">
        {services.length === 0 && (
          <div className="card text-center text-ink-400">
            No services yet. Add your first one below.
          </div>
        )}
        {services.map((s) => (
          <div key={s.id} className="card flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="flex h-9 w-9 items-center justify-center rounded-md bg-brand-50 text-brand-700">
                <Icon name="scissors" className="h-4 w-4" />
              </span>
              <div>
                <p className="font-semibold">{s.name}</p>
                <p className="text-xs text-ink-400">
                  {s.duration_min} min · base ${Number(s.base_price).toFixed(2)}
                </p>
              </div>
            </div>
            <button
              onClick={() => del(s.id)}
              className="inline-flex items-center gap-1 text-xs text-brand-600 hover:underline"
            >
              <Icon name="trash" className="h-3.5 w-3.5" /> Delete
            </button>
          </div>
        ))}
      </div>

      <form onSubmit={add} className="card flex flex-col gap-3">
        <h2 className="display inline-flex items-center gap-2 text-lg">
          <Icon name="plus" className="h-4 w-4 text-brand-700" /> Add service
        </h2>
        <div className="flex flex-col gap-3 sm:flex-row">
          <div className="flex-1">
            <label className="label">Name</label>
            <input name="name" required className="input" placeholder="e.g. Haircut" />
          </div>
          <div className="sm:w-32">
            <label className="label">Duration (min)</label>
            <input
              name="duration_min"
              type="number"
              min="5"
              step="5"
              defaultValue="30"
              className="input"
            />
          </div>
          <div className="sm:w-32">
            <label className="label">Base price</label>
            <input
              name="base_price"
              type="number"
              min="0"
              step="0.01"
              defaultValue="20"
              className="input"
            />
          </div>
        </div>
        {error && (
          <div className="rounded-md border border-brand-100 bg-brand-50 px-3 py-2 text-sm text-brand-700">
            {error}
          </div>
        )}
        <button disabled={busy} className="btn-primary w-fit">
          {busy ? "Saving…" : "Add service"}
        </button>
      </form>
    </div>
  );
}
