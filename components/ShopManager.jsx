"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";

export default function ShopManager({ shop, barbers, services, report, bookings, day }) {
  const router = useRouter();
  const [tab, setTab] = useState("barbers");

  return (
    <div className="grid gap-6">
      <header className="flex items-start justify-between gap-4">
        <div>
          <Link href="/owner/shops" className="text-xs text-ink-400 hover:text-brand-500">
            ← All shops
          </Link>
          <h1 className="section-title">{shop.name}</h1>
          <p className="muted">{shop.address || "No address"}</p>
          <div className="mt-2 flex gap-2">
            <span className="pill-slate">🪑 {shop.seats} seats</span>
            <span className="pill-slate">
              🕘 {shop.open_hour}:00 → {shop.close_hour}:00
            </span>
            <span className="pill-brand">{barbers.length} barbers on staff</span>
          </div>
        </div>
        <DeleteShopButton id={shop.id} />
      </header>

      <div className="flex gap-1 border-b border-ink-100">
        <TabBtn label="🪑 Seats & barbers" active={tab === "barbers"} onClick={() => setTab("barbers")} />
        <TabBtn
          label={`💰 Today's totals (${day})`}
          active={tab === "report"}
          onClick={() => setTab("report")}
        />
        <TabBtn
          label={`📅 Bookings (${bookings.length})`}
          active={tab === "bookings"}
          onClick={() => setTab("bookings")}
        />
      </div>

      {tab === "barbers" && <BarbersTab shop={shop} barbers={barbers} services={services} />}
      {tab === "report" && <ReportTab shop={shop} report={report} day={day} />}
      {tab === "bookings" && (
        <BookingsTab
          bookings={bookings}
          day={day}
          shopId={shop.id}
          onChanged={() => router.refresh()}
        />
      )}
    </div>
  );
}

function TabBtn({ label, active, onClick }) {
  return (
    <button
      onClick={onClick}
      className={`tab-btn ${active ? "tab-btn-active" : ""}`}
    >
      {label}
    </button>
  );
}

function BarbersTab({ shop, barbers, services }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(null);
  const [withLogin, setWithLogin] = useState(true);

  const seatNumbers = Array.from({ length: shop.seats }, (_, i) => i + 1);
  const seatMap = barbers.reduce((m, b) => {
    if (!m[b.seat_number]) m[b.seat_number] = [];
    m[b.seat_number].push(b);
    return m;
  }, {});

  async function addBarber(e) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    const fd = new FormData(e.currentTarget);
    const payload = Object.fromEntries(fd.entries());
    if (!withLogin) {
      delete payload.login_email;
      delete payload.login_password;
    }
    const res = await fetch(`/api/owner/shops/${shop.id}/barbers`, {
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
    router.refresh();
  }

  async function deleteBarber(id) {
    if (!confirm("Remove this barber? Their login will be revoked too.")) return;
    const res = await fetch(`/api/owner/barbers/${id}`, { method: "DELETE" });
    if (res.ok) router.refresh();
  }

  return (
    <div className="grid gap-6">
      <div className="grid gap-3 sm:grid-cols-2">
        {seatNumbers.map((n) => {
          const occupants = seatMap[n] || [];
          return (
            <div key={n} className="card border-l-4 border-l-brand-500">
              <div className="flex items-center justify-between">
                <p className="font-bold">🪑 Seat {n}</p>
                <span className="pill-slate">
                  {occupants.length === 0
                    ? "Empty"
                    : `${occupants.length} barber${occupants.length > 1 ? "s" : ""}`}
                </span>
              </div>
              {occupants.length === 0 ? (
                <p className="mt-2 text-xs text-ink-400">No barber assigned yet.</p>
              ) : (
                <div className="mt-3 grid gap-2">
                  {occupants.map((b) => (
                    <BarberCard
                      key={b.id}
                      barber={b}
                      services={services}
                      shop={shop}
                      onDelete={() => deleteBarber(b.id)}
                    />
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>

      <form onSubmit={addBarber} className="card grid gap-3">
        <h3 className="font-bold">➕ Add barber</h3>
        <div className="grid gap-3 sm:grid-cols-2">
          <div>
            <label className="label">Name</label>
            <input name="name" required className="input" placeholder="Marco Rossi" />
          </div>
          <div>
            <label className="label">Seat</label>
            <select name="seat_number" className="input">
              {seatNumbers.map((n) => (
                <option key={n} value={n}>
                  Seat {n}
                </option>
              ))}
            </select>
          </div>
          <div className="sm:col-span-2">
            <label className="label">Short bio</label>
            <input name="bio" className="input" placeholder="15 years on the chair · loves classic cuts" />
          </div>
          <div className="sm:col-span-2">
            <label className="label">Photo URL</label>
            <input name="photo_url" className="input" placeholder="https://…" />
          </div>
        </div>

        <label className="flex items-center gap-2 text-sm font-semibold text-ink-700">
          <input
            type="checkbox"
            checked={withLogin}
            onChange={(e) => setWithLogin(e.target.checked)}
            className="h-4 w-4 accent-brand-500"
          />
          Create a login for this barber (so they can see their schedule)
        </label>

        {withLogin && (
          <div className="grid gap-3 rounded-xl bg-ink-50 p-3 sm:grid-cols-2">
            <div>
              <label className="label">Barber email</label>
              <input
                name="login_email"
                type="email"
                required={withLogin}
                className="input"
                placeholder="marco@example.com"
              />
            </div>
            <div>
              <label className="label">Initial password</label>
              <input
                name="login_password"
                type="text"
                required={withLogin}
                minLength={6}
                className="input"
                placeholder="they'll change it later"
              />
            </div>
          </div>
        )}

        {error && (
          <div className="rounded-lg bg-brand-50 px-3 py-2 text-sm text-brand-700">{error}</div>
        )}
        <button disabled={busy} className="btn-primary w-fit">
          {busy ? "Saving…" : "Add barber"}
        </button>
        {services.length === 0 && (
          <p className="text-xs text-amber-700">
            Tip: add some services first so this barber has prices to charge.
          </p>
        )}
      </form>
    </div>
  );
}

function BarberCard({ barber, services, shop, onDelete }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [pricing, setPricing] = useState(null);
  const [loading, setLoading] = useState(false);
  const [loginOpen, setLoginOpen] = useState(false);

  async function loadPricing() {
    setLoading(true);
    const res = await fetch(`/api/owner/barbers/${barber.id}`);
    if (res.ok) {
      const data = await res.json();
      setPricing(data.services || []);
    }
    setLoading(false);
  }

  async function toggle() {
    if (!open && pricing === null) await loadPricing();
    setOpen(!open);
  }

  async function savePrice(serviceId, value) {
    const res = await fetch(`/api/owner/barbers/${barber.id}/services`, {
      method: "PUT",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        service_id: serviceId,
        price: value === "" ? null : Number(value),
      }),
    });
    if (res.ok) await loadPricing();
  }

  async function changeSeat(v) {
    const res = await fetch(`/api/owner/barbers/${barber.id}`, {
      method: "PUT",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ seat_number: Number(v) }),
    });
    if (res.ok) router.refresh();
  }

  async function setLogin(e) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const payload = Object.fromEntries(fd.entries());
    const res = await fetch(`/api/owner/barbers/${barber.id}/login`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(payload),
    });
    if (res.ok) {
      setLoginOpen(false);
      router.refresh();
    } else {
      const d = await res.json().catch(() => ({}));
      alert(d.error || "Could not set login");
    }
  }

  return (
    <div className="rounded-xl border border-ink-100 bg-white p-3 transition hover:border-brand-200">
      <div className="flex items-center gap-3">
        {barber.photo_url ? (
          <img
            src={barber.photo_url}
            alt={barber.name}
            className="h-12 w-12 rounded-full object-cover"
          />
        ) : (
          <div className="grid h-12 w-12 place-items-center rounded-full bg-brand-50 text-xl">
            💈
          </div>
        )}
        <div className="flex-1">
          <p className="font-bold">{barber.name}</p>
          <p className="text-xs text-ink-400">
            {barber.login_email ? (
              <>🔑 {barber.login_email}</>
            ) : (
              <span className="text-amber-700">⚠️ No login set</span>
            )}
          </p>
        </div>
        <select
          value={barber.seat_number}
          onChange={(e) => changeSeat(e.target.value)}
          className="input w-20 py-1 text-xs"
          title="Seat"
        >
          {Array.from({ length: shop.seats }, (_, i) => i + 1).map((n) => (
            <option key={n} value={n}>
              Seat {n}
            </option>
          ))}
        </select>
      </div>

      <div className="mt-3 flex flex-wrap gap-2 text-xs">
        <button onClick={toggle} className="btn-ghost text-xs">
          {open ? "Hide pricing" : "💵 Set fees"}
        </button>
        <button onClick={() => setLoginOpen(!loginOpen)} className="btn-ghost text-xs">
          🔐 {barber.login_email ? "Reset login" : "Set login"}
        </button>
        <button onClick={onDelete} className="ml-auto text-xs text-brand-600 hover:underline">
          Remove
        </button>
      </div>

      {loginOpen && (
        <form onSubmit={setLogin} className="mt-3 grid gap-2 rounded-lg bg-ink-50 p-3 text-xs">
          <input
            name="login_email"
            type="email"
            required
            placeholder="email"
            defaultValue={barber.login_email || ""}
            className="input"
          />
          <input
            name="login_password"
            type="text"
            required
            minLength={6}
            placeholder="new password"
            className="input"
          />
          <button className="btn-primary text-xs">Save login</button>
        </form>
      )}

      {open && (
        <div className="mt-3 border-t border-ink-100 pt-3">
          {loading && <p className="text-xs text-ink-400">Loading…</p>}
          {!loading && services.length === 0 && (
            <p className="text-xs text-ink-400">
              No services yet — add some in the Services page.
            </p>
          )}
          {!loading && services.length > 0 && (
            <div className="grid gap-2">
              {services.map((s) => {
                const row = pricing?.find((p) => p.id === s.id);
                const override = row?.override_price;
                return (
                  <div key={s.id} className="flex items-center gap-3 text-xs">
                    <span className="flex-1 font-medium">{s.name}</span>
                    <span className="text-ink-400">
                      base ${Number(s.base_price).toFixed(2)}
                    </span>
                    <input
                      type="number"
                      step="0.01"
                      defaultValue={override ?? ""}
                      placeholder={`use base ($${Number(s.base_price).toFixed(2)})`}
                      onBlur={(e) => {
                        if ((override ?? "") !== e.target.value)
                          savePrice(s.id, e.target.value);
                      }}
                      className="input w-36 py-1.5"
                    />
                  </div>
                );
              })}
              <p className="text-xs text-ink-400">Leave blank to use the base price.</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function ReportTab({ shop, report, day }) {
  const router = useRouter();
  function changeDay(v) {
    const url = new URL(window.location.href);
    url.searchParams.set("day", v);
    router.push(url.pathname + url.search);
  }
  if (!report) return <div className="card">No data.</div>;
  return (
    <div className="grid gap-4">
      <div className="flex items-center justify-between">
        <input
          type="date"
          value={day}
          onChange={(e) => changeDay(e.target.value)}
          className="input w-fit"
        />
        <div className="text-right">
          <p className="text-xs font-bold uppercase tracking-widest text-ink-400">
            Earned · pending
          </p>
          <p className="text-3xl font-extrabold">
            ${report.totals.completed.toFixed(2)}{" "}
            <span className="text-base font-medium text-ink-400">
              + ${report.totals.pending.toFixed(2)}
            </span>
          </p>
        </div>
      </div>
      <div className="card overflow-x-auto p-0">
        <table className="w-full text-sm">
          <thead className="text-left text-xs font-bold uppercase tracking-widest text-ink-400">
            <tr className="border-b border-ink-100">
              <th className="px-4 py-3">Seat</th>
              <th className="px-4 py-3">Barber</th>
              <th className="px-4 py-3">Done</th>
              <th className="px-4 py-3">Pending</th>
              <th className="px-4 py-3 text-right">Earned</th>
              <th className="px-4 py-3 text-right">Pending $</th>
              <th className="px-4 py-3 text-right">End-of-day</th>
            </tr>
          </thead>
          <tbody>
            {report.rows.map((r) => (
              <tr key={r.barber_id} className="border-b border-ink-100 last:border-0">
                <td className="px-4 py-3">
                  <span className="pill-brand">Seat {r.seat_number}</span>
                </td>
                <td className="px-4 py-3 font-medium">{r.barber_name}</td>
                <td className="px-4 py-3">{r.completed_count}</td>
                <td className="px-4 py-3">{r.pending_count}</td>
                <td className="px-4 py-3 text-right">${r.completed_total.toFixed(2)}</td>
                <td className="px-4 py-3 text-right text-ink-400">
                  ${r.pending_total.toFixed(2)}
                </td>
                <td className="px-4 py-3 text-right font-bold">
                  ${(r.completed_total + r.pending_total).toFixed(2)}
                </td>
              </tr>
            ))}
            {report.rows.length === 0 && (
              <tr>
                <td colSpan={7} className="py-8 text-center text-ink-400">
                  No barbers yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function BookingsTab({ bookings, day, onChanged }) {
  async function setStatus(id, status) {
    const res = await fetch(`/api/owner/bookings/${id}`, {
      method: "PATCH",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ status }),
    });
    if (res.ok) onChanged();
  }
  return (
    <div className="grid gap-3">
      {bookings.length === 0 && (
        <div className="card text-center text-ink-400">No bookings on {day}.</div>
      )}
      {bookings.map((b) => (
        <div key={b.id} className="card flex items-center gap-4">
          <div className="text-center">
            <p className="text-xs text-ink-400">
              {new Date(b.start_at).toLocaleDateString()}
            </p>
            <p className="font-extrabold tabular-nums">
              {new Date(b.start_at).toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
              })}
            </p>
          </div>
          <div className="flex-1">
            <p className="font-bold">
              {b.customer_name}
              {b.customer_phone && (
                <span className="ml-2 text-xs text-ink-400">📞 {b.customer_phone}</span>
              )}
            </p>
            <p className="text-sm text-ink-400">
              {b.service_name} with {b.barber_name} (Seat {b.seat_number}) — $
              {Number(b.price).toFixed(2)}
            </p>
          </div>
          <span
            className={`pill ${
              b.status === "completed"
                ? "pill-green"
                : b.status === "cancelled"
                ? "pill-slate"
                : "pill-amber"
            }`}
          >
            {b.status}
          </span>
          {b.status === "booked" && (
            <div className="flex gap-1">
              <button onClick={() => setStatus(b.id, "completed")} className="btn-primary text-xs">
                ✓ Done
              </button>
              <button onClick={() => setStatus(b.id, "cancelled")} className="btn-ghost text-xs">
                Cancel
              </button>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

function DeleteShopButton({ id }) {
  const router = useRouter();
  async function del() {
    if (!confirm("Delete this shop? This removes its barbers and bookings.")) return;
    const res = await fetch(`/api/owner/shops/${id}`, { method: "DELETE" });
    if (res.ok) router.push("/owner/shops");
  }
  return (
    <button onClick={del} className="text-xs text-brand-600 hover:underline">
      Delete shop
    </button>
  );
}
