"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Icon from "@/components/Icon";

export default function ShopManager({ shop, barbers, services, report, bookings, day }) {
  const router = useRouter();
  const [tab, setTab] = useState("barbers");
  const [pending, setPending] = useState([]);

  // Keep the pending queue badge live without blocking the page.
  async function refreshPending() {
    try {
      const res = await fetch(`/api/owner/shops/${shop.id}/pending`, { cache: "no-store" });
      if (res.ok) {
        const d = await res.json();
        setPending(d.bookings || []);
      }
    } catch {}
  }
  useEffect(() => {
    refreshPending();
    const iv = setInterval(refreshPending, 30_000);
    return () => clearInterval(iv);
  }, [shop.id]);

  return (
    <div className="flex flex-col gap-6">
      <header className="flex flex-col items-start justify-between gap-4 sm:flex-row">
        <div>
          <Link
            href="/owner/shops"
            className="inline-flex items-center gap-1 text-xs text-ink-400 hover:text-brand-500"
          >
            <Icon name="arrow" className="h-3.5 w-3.5 -scale-x-100" /> All shops
          </Link>
          <h1 className="section-title mt-2">{shop.name}</h1>
          <p className="muted">{shop.address || "No address"}</p>
          <div className="mt-2 flex flex-wrap gap-2">
            <span className="pill-slate inline-flex items-center gap-1">
              <Icon name="chair" className="h-3 w-3" /> {shop.seats} seats
            </span>
            <span className="pill-slate inline-flex items-center gap-1">
              <Icon name="clock" className="h-3 w-3" /> {shop.open_hour}:00 → {shop.close_hour}:00
            </span>
            <span className="pill-brand">{barbers.length} barbers on staff</span>
            {pending.length > 0 && (
              <button
                onClick={() => setTab("pending")}
                className="pill-amber inline-flex items-center gap-1 hover:bg-amber-100"
              >
                <Icon name="bell" className="h-3 w-3" /> {pending.length} awaiting your review
              </button>
            )}
          </div>
        </div>
        <DeleteShopButton id={shop.id} />
      </header>

      <div className="flex gap-1 overflow-x-auto border-b border-ink-100">
        <TabBtn
          label="Seats & barbers"
          icon="chair"
          active={tab === "barbers"}
          onClick={() => setTab("barbers")}
        />
        <TabBtn
          label={`Pending (${pending.length})`}
          icon="bell"
          active={tab === "pending"}
          onClick={() => setTab("pending")}
          attention={pending.length > 0}
        />
        <TabBtn
          label={`Today's totals (${day})`}
          icon="wallet"
          active={tab === "report"}
          onClick={() => setTab("report")}
        />
        <TabBtn
          label={`Day (${bookings.length})`}
          icon="calendar"
          active={tab === "bookings"}
          onClick={() => setTab("bookings")}
        />
      </div>

      {tab === "barbers" && <BarbersTab shop={shop} barbers={barbers} services={services} />}
      {tab === "pending" && (
        <PendingTab
          bookings={pending}
          onChanged={() => {
            refreshPending();
            router.refresh();
          }}
        />
      )}
      {tab === "report" && <ReportTab shop={shop} report={report} day={day} />}
      {tab === "bookings" && (
        <BookingsTab
          bookings={bookings}
          day={day}
          shopId={shop.id}
          onChanged={() => {
            refreshPending();
            router.refresh();
          }}
        />
      )}
    </div>
  );
}

function PendingTab({ bookings, onChanged }) {
  async function setStatus(id, status) {
    const res = await fetch(`/api/owner/bookings/${id}`, {
      method: "PATCH",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ status }),
    });
    if (res.ok) onChanged();
  }

  if (bookings.length === 0) {
    return (
      <div className="card flex flex-col items-center gap-2 py-10 text-center">
        <span className="flex h-10 w-10 items-center justify-center rounded-md bg-emerald-50 text-emerald-700">
          <Icon name="check" className="h-5 w-5" />
        </span>
        <p className="display text-lg text-ink-900">All caught up.</p>
        <p className="text-sm text-ink-400">
          No bookings awaiting your review right now.
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      <p className="text-sm text-ink-400">
        Review each request below. Confirming locks in the slot; declining frees it for someone else.
      </p>
      {bookings.map((b) => (
        <div
          key={b.id}
          className="card border-l-4 border-l-amber-400 flex flex-col gap-3 md:flex-row md:items-center"
        >
          <div className="grid place-items-center rounded-md bg-paper-100 px-3 py-2 text-center">
            <p className="display text-lg tabular-nums">
              {new Date(b.start_at).toLocaleTimeString([], {
                hour: "numeric",
                minute: "2-digit",
                hour12: true,
              })}
            </p>
            <p className="text-[10px] uppercase tracking-widest text-ink-400">
              {new Date(b.start_at).toLocaleDateString()}
            </p>
          </div>
          <div className="min-w-0 flex-1">
            <p className="font-bold">
              {b.customer_name}
              {b.customer_phone && (
                <span className="ml-2 inline-flex items-center gap-1 text-xs font-normal text-ink-400">
                  <Icon name="phone" className="h-3 w-3" /> {b.customer_phone}
                </span>
              )}
            </p>
            <p className="text-sm text-ink-400">
              {b.service_name} with {b.barber_name} (Seat {b.seat_number}) — $
              {Number(b.price).toFixed(2)}
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => setStatus(b.id, "booked")}
              className="btn-primary inline-flex items-center gap-1 text-xs"
            >
              <Icon name="check" className="h-3.5 w-3.5" /> Confirm
            </button>
            <button
              onClick={() => setStatus(b.id, "declined")}
              className="btn-ghost inline-flex items-center gap-1 text-xs"
            >
              <Icon name="x" className="h-3.5 w-3.5" /> Decline
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}

function TabBtn({ label, icon, active, onClick, attention }) {
  return (
    <button
      onClick={onClick}
      className={`tab-btn inline-flex items-center gap-1.5 whitespace-nowrap ${active ? "tab-btn-active" : ""}`}
    >
      <Icon name={icon} className={`h-3.5 w-3.5 ${attention ? "text-amber-600" : ""}`} />
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
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap gap-3">
        {seatNumbers.map((n) => {
          const occupants = seatMap[n] || [];
          return (
            <div key={n} className="card w-full border-l-4 border-l-brand-500 md:w-[calc((100%-0.75rem)/2)]">
              <div className="flex items-center justify-between">
                <p className="display inline-flex items-center gap-2 text-lg">
                  <Icon name="chair" className="h-4 w-4 text-brand-700" /> Seat {n}
                </p>
                <span className="pill-slate">
                  {occupants.length === 0
                    ? "Empty"
                    : `${occupants.length} barber${occupants.length > 1 ? "s" : ""}`}
                </span>
              </div>
              {occupants.length === 0 ? (
                <p className="mt-2 text-xs text-ink-400">No barber assigned yet.</p>
              ) : (
                <div className="mt-3 flex flex-col gap-2">
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

      <form onSubmit={addBarber} className="card flex flex-col gap-3">
        <h3 className="display inline-flex items-center gap-2 text-lg">
          <Icon name="plus" className="h-4 w-4 text-brand-700" /> Add barber
        </h3>
        <div className="flex flex-col gap-3 sm:flex-row">
          <div className="flex-1">
            <label className="label">Name</label>
            <input name="name" required className="input" placeholder="Marco Rossi" />
          </div>
          <div className="sm:w-44">
            <label className="label">Seat</label>
            <select name="seat_number" className="input">
              {seatNumbers.map((n) => (
                <option key={n} value={n}>
                  Seat {n}
                </option>
              ))}
            </select>
          </div>
        </div>
        <div>
          <label className="label">Short bio</label>
          <input
            name="bio"
            className="input"
            placeholder="15 years on the chair · classic cuts"
          />
        </div>
        <div>
          <label className="label">Photo URL</label>
          <input name="photo_url" className="input" placeholder="https://…" />
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
          <div className="flex flex-col gap-3 rounded-md bg-paper-100/60 p-3 sm:flex-row">
            <div className="flex-1">
              <label className="label">Barber email</label>
              <input
                name="login_email"
                type="email"
                required={withLogin}
                className="input"
                placeholder="marco@example.com"
              />
            </div>
            <div className="flex-1">
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
          <div className="rounded-md border border-brand-100 bg-brand-50 px-3 py-2 text-sm text-brand-700">
            {error}
          </div>
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
    <div className="rounded-md border border-ink-100 bg-paper-50 p-3 transition hover:border-brand-200">
      <div className="flex items-center gap-3">
        {barber.photo_url ? (
          <img
            src={barber.photo_url}
            alt={barber.name}
            className="h-12 w-12 rounded-md object-cover"
          />
        ) : (
          <div className="flex h-12 w-12 items-center justify-center rounded-md bg-brand-50 text-brand-700">
            <Icon name="user" className="h-6 w-6" />
          </div>
        )}
        <div className="min-w-0 flex-1">
          <p className="font-bold">{barber.name}</p>
          <p className="inline-flex items-center gap-1 truncate text-xs text-ink-400">
            {barber.login_email ? (
              <>
                <Icon name="lock" className="h-3 w-3" /> {barber.login_email}
              </>
            ) : (
              <span className="inline-flex items-center gap-1 text-amber-700">
                <Icon name="x" className="h-3 w-3" /> No login set
              </span>
            )}
          </p>
        </div>
        <select
          value={barber.seat_number}
          onChange={(e) => changeSeat(e.target.value)}
          className="input w-24 py-1 text-xs"
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
        <button onClick={toggle} className="btn-ghost inline-flex items-center gap-1 text-xs">
          <Icon name="wallet" className="h-3.5 w-3.5" />
          {open ? "Hide pricing" : "Set fees"}
        </button>
        <button
          onClick={() => setLoginOpen(!loginOpen)}
          className="btn-ghost inline-flex items-center gap-1 text-xs"
        >
          <Icon name="lock" className="h-3.5 w-3.5" />
          {barber.login_email ? "Reset login" : "Set login"}
        </button>
        <button
          onClick={onDelete}
          className="ml-auto inline-flex items-center gap-1 text-xs text-brand-600 hover:underline"
        >
          <Icon name="trash" className="h-3.5 w-3.5" /> Remove
        </button>
      </div>

      {loginOpen && (
        <form
          onSubmit={setLogin}
          className="mt-3 flex flex-col gap-2 rounded-md bg-paper-100/70 p-3 text-xs"
        >
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
            <div className="flex flex-col gap-2">
              {services.map((s) => {
                const row = pricing?.find((p) => p.id === s.id);
                const override = row?.override_price;
                return (
                  <div key={s.id} className="flex items-center gap-3 text-xs">
                    <span className="flex-1 truncate font-medium">{s.name}</span>
                    <span className="text-ink-400">
                      base ${Number(s.base_price).toFixed(2)}
                    </span>
                    <input
                      type="number"
                      step="0.01"
                      defaultValue={override ?? ""}
                      placeholder={`base $${Number(s.base_price).toFixed(2)}`}
                      onBlur={(e) => {
                        if ((override ?? "") !== e.target.value)
                          savePrice(s.id, e.target.value);
                      }}
                      className="input w-32 py-1.5"
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
    <div className="flex flex-col gap-4">
      <div className="flex flex-col items-start justify-between gap-3 sm:flex-row sm:items-end">
        <input
          type="date"
          value={day}
          onChange={(e) => changeDay(e.target.value)}
          className="input w-fit"
        />
        <div className="text-right">
          <p className="text-[10px] font-bold uppercase tracking-widest text-ink-400">
            Earned · pending
          </p>
          <p className="display text-3xl text-ink-900">
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
    <div className="flex flex-col gap-3">
      {bookings.length === 0 && (
        <div className="card text-center text-ink-400">No bookings on {day}.</div>
      )}
      {bookings.map((b) => (
        <div key={b.id} className="card flex items-center gap-4">
          <div className="text-center">
            <p className="text-xs text-ink-400">
              {new Date(b.start_at).toLocaleDateString()}
            </p>
            <p className="display text-lg tabular-nums">
              {new Date(b.start_at).toLocaleTimeString([], {
                hour: "numeric",
                minute: "2-digit",
                hour12: true,
              })}
            </p>
          </div>
          <div className="min-w-0 flex-1">
            <p className="font-bold">
              {b.customer_name}
              {b.customer_phone && (
                <span className="ml-2 inline-flex items-center gap-1 text-xs font-normal text-ink-400">
                  <Icon name="phone" className="h-3 w-3" /> {b.customer_phone}
                </span>
              )}
            </p>
            <p className="truncate text-sm text-ink-400">
              {b.service_name} with {b.barber_name} (Seat {b.seat_number}) — $
              {Number(b.price).toFixed(2)}
            </p>
          </div>
          <span
            className={`pill ${
              b.status === "completed"
                ? "pill-green"
                : b.status === "cancelled" || b.status === "declined"
                ? "pill-slate"
                : "pill-amber"
            }`}
          >
            {b.status}
          </span>
          {b.status === "pending" && (
            <div className="flex gap-1">
              <button
                onClick={() => setStatus(b.id, "booked")}
                className="btn-primary inline-flex items-center gap-1 text-xs"
              >
                <Icon name="check" className="h-3.5 w-3.5" /> Confirm
              </button>
              <button
                onClick={() => setStatus(b.id, "declined")}
                className="btn-ghost text-xs"
              >
                Decline
              </button>
            </div>
          )}
          {b.status === "booked" && (
            <div className="flex gap-1">
              <button
                onClick={() => setStatus(b.id, "completed")}
                className="btn-primary inline-flex items-center gap-1 text-xs"
              >
                <Icon name="check" className="h-3.5 w-3.5" /> Done
              </button>
              <button
                onClick={() => setStatus(b.id, "cancelled")}
                className="btn-ghost text-xs"
              >
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
    <button
      onClick={del}
      className="inline-flex items-center gap-1 text-xs text-brand-600 hover:underline"
    >
      <Icon name="trash" className="h-3.5 w-3.5" /> Delete shop
    </button>
  );
}
