"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Icon from "@/components/Icon";

const PRESETS = [
  { label: "No tax", rate: 0, name: "Tax" },
  { label: "US Sales Tax", rate: 8.875, name: "Sales Tax" },
  { label: "UK / EU VAT", rate: 20, name: "VAT" },
  { label: "AU GST", rate: 10, name: "GST" },
  { label: "Pakistan GST", rate: 18, name: "GST" },
  { label: "India GST", rate: 18, name: "GST" },
];

export default function OwnerSettings({ me }) {
  const router = useRouter();
  const business = me?.business || {};
  const [taxRate, setTaxRate] = useState(
    business.tax_rate != null ? Number(business.tax_rate) : 0
  );
  const [taxLabel, setTaxLabel] = useState(business.tax_label || "Tax");
  const [name, setName] = useState(business.name || "");
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState(null);

  function applyPreset(p) {
    setTaxRate(p.rate);
    setTaxLabel(p.name);
  }

  async function saveTax(e) {
    e.preventDefault();
    setBusy(true);
    setMsg(null);
    const res = await fetch("/api/owner/business/tax", {
      method: "PUT",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ tax_rate: taxRate, tax_label: taxLabel }),
    });
    const data = await res.json().catch(() => ({}));
    setBusy(false);
    if (!res.ok) {
      setMsg({ kind: "err", text: data.error || "Could not save" });
      return;
    }
    setMsg({ kind: "ok", text: "Tax settings updated. Future invoices will use them." });
    router.refresh();
  }

  async function saveName(e) {
    e.preventDefault();
    setBusy(true);
    setMsg(null);
    const res = await fetch("/api/owner/me", { method: "GET" });
    // PUT business name endpoint
    const r2 = await fetch("/api/owner/business", {
      method: "PUT",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ name }),
    });
    setBusy(false);
    if (!r2.ok) {
      const d = await r2.json().catch(() => ({}));
      setMsg({ kind: "err", text: d.error || "Could not save" });
      return;
    }
    setMsg({ kind: "ok", text: "Business name updated." });
    router.refresh();
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <span className="eyebrow">Business</span>
        <h1 className="section-title mt-2">Settings</h1>
        <p className="muted">
          Configure your tax for invoices and rename your business.
        </p>
      </div>

      {msg && (
        <div
          className={`rounded-md border px-3 py-2 text-sm ${
            msg.kind === "err"
              ? "border-brand-100 bg-brand-50 text-brand-700"
              : "border-emerald-100 bg-emerald-50 text-emerald-700"
          }`}
        >
          {msg.text}
        </div>
      )}

      <form onSubmit={saveName} className="card flex flex-col gap-3">
        <h2 className="display text-lg">Business name</h2>
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="input"
          required
          maxLength={80}
        />
        <button disabled={busy} className="btn-dark w-fit">Save name</button>
      </form>

      <form onSubmit={saveTax} className="card flex flex-col gap-4">
        <div>
          <h2 className="display text-lg">Tax</h2>
          <p className="muted">
            Set the rate that gets applied to every invoice from now on.
            Existing invoices keep the rate they were issued with.
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          {PRESETS.map((p) => (
            <button
              key={p.label}
              type="button"
              onClick={() => applyPreset(p)}
              className={`pill ${
                Number(taxRate) === p.rate && taxLabel === p.name
                  ? "pill-brand"
                  : "pill-slate hover:bg-paper-200"
              }`}
            >
              {p.label} · {p.rate}%
            </button>
          ))}
        </div>

        <div className="flex flex-col gap-3 sm:flex-row">
          <div className="flex-1">
            <label className="label">Tax label (what it's called on invoices)</label>
            <input
              value={taxLabel}
              onChange={(e) => setTaxLabel(e.target.value)}
              className="input"
              maxLength={20}
              placeholder="VAT / GST / Sales Tax / Tax"
            />
          </div>
          <div className="sm:w-40">
            <label className="label">Rate (%)</label>
            <input
              type="number"
              step="0.01"
              min="0"
              max="100"
              value={taxRate}
              onChange={(e) => setTaxRate(e.target.value)}
              className="input"
            />
          </div>
        </div>

        <div className="rounded-md border border-ink-100 bg-paper-100/50 p-3 text-xs text-ink-700">
          <p className="font-semibold">Preview on a $25.00 cut</p>
          <p className="mt-1 tabular-nums">
            Subtotal $25.00 · {taxLabel} {Number(taxRate || 0).toFixed(2)}%
            {" "}= ${(25 * Number(taxRate || 0) / 100).toFixed(2)} ·
            Total ${(25 + 25 * Number(taxRate || 0) / 100).toFixed(2)}
          </p>
        </div>

        <button disabled={busy} className="btn-primary w-fit">
          {busy ? "Saving…" : "Save tax settings"}
        </button>
      </form>
    </div>
  );
}
