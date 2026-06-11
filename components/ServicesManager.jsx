"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

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
    <div className="grid gap-6">
      <div>
        <h1 className="text-2xl font-bold">Services</h1>
        <p className="text-sm text-slate-600">
          Define the service menu once. Each barber can override the price for any service on
          their profile.
        </p>
      </div>

      <div className="grid gap-3">
        {services.length === 0 && (
          <div className="card text-center text-slate-600">
            No services yet. Add your first one below.
          </div>
        )}
        {services.map((s) => (
          <div key={s.id} className="card flex items-center justify-between">
            <div>
              <p className="font-semibold">{s.name}</p>
              <p className="text-xs text-slate-500">
                {s.duration_min} min · base ${Number(s.base_price).toFixed(2)}
              </p>
            </div>
            <button onClick={() => del(s.id)} className="text-xs text-red-600 hover:underline">
              Delete
            </button>
          </div>
        ))}
      </div>

      <form onSubmit={add} className="card grid gap-3">
        <h2 className="font-semibold">Add service</h2>
        <div className="grid gap-3 sm:grid-cols-3">
          <input name="name" required className="input" placeholder="e.g. Haircut" />
          <input
            name="duration_min"
            type="number"
            min="5"
            step="5"
            defaultValue="30"
            className="input"
            placeholder="Duration (min)"
          />
          <input
            name="base_price"
            type="number"
            min="0"
            step="0.01"
            defaultValue="20"
            className="input"
            placeholder="Base price"
          />
        </div>
        {error && <div className="rounded bg-red-50 px-3 py-2 text-sm text-red-700">{error}</div>}
        <button disabled={busy} className="btn-primary w-fit">
          {busy ? "Saving…" : "Add service"}
        </button>
      </form>
    </div>
  );
}
