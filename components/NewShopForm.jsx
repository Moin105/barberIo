"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Icon from "@/components/Icon";

export default function NewShopForm() {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(null);

  async function onSubmit(e) {
    e.preventDefault();
    setError(null);
    setBusy(true);
    const fd = new FormData(e.currentTarget);
    const payload = Object.fromEntries(fd.entries());
    const res = await fetch("/api/owner/shops", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(payload),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      setError(data.error || "Failed");
      setBusy(false);
      return;
    }
    e.target.reset();
    setBusy(false);
    router.refresh();
  }

  return (
    <form onSubmit={onSubmit} className="card flex flex-col gap-3">
      <h2 className="display inline-flex items-center gap-2 text-lg">
        <Icon name="plus" className="h-4 w-4 text-brand-700" /> Add a new shop
      </h2>
      <div className="flex flex-col gap-3 sm:flex-row">
        <div className="flex-1">
          <label className="label">Shop name</label>
          <input name="name" required className="input" placeholder="e.g. Downtown Cuts" />
        </div>
        <div className="flex-1">
          <label className="label">Address</label>
          <input name="address" className="input" placeholder="123 Main St" />
        </div>
      </div>
      <div className="flex flex-col gap-3 sm:flex-row">
        <div className="flex-1">
          <label className="label">Seats / chairs</label>
          <input name="seats" type="number" min="1" defaultValue="2" className="input" />
        </div>
        <div className="flex-1">
          <label className="label">Open hour</label>
          <input
            name="open_hour"
            type="number"
            min="0"
            max="23"
            defaultValue="9"
            className="input"
          />
        </div>
        <div className="flex-1">
          <label className="label">Close hour</label>
          <input
            name="close_hour"
            type="number"
            min="1"
            max="24"
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
        {busy ? "Saving…" : "Add shop"}
      </button>
    </form>
  );
}
