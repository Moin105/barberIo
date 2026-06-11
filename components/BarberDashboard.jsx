"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function BarberDashboard({ day, barber, bookings, summary, stats }) {
  const router = useRouter();
  const [busy, setBusy] = useState(null);

  if (!barber) {
    return (
      <div className="card mx-auto max-w-lg text-center">
        <p className="text-2xl">👋</p>
        <p className="mt-2 font-bold">No barber profile linked to this account.</p>
        <p className="mt-1 text-sm text-ink-400">
          Ask your shop owner to invite you from the shop dashboard.
        </p>
      </div>
    );
  }

  async function setStatus(id, status) {
    setBusy(id);
    const res = await fetch(`/api/barber/bookings/${id}`, {
      method: "PATCH",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ status }),
    });
    setBusy(null);
    if (res.ok) router.refresh();
  }

  function changeDay(v) {
    const url = new URL(window.location.href);
    url.searchParams.set("day", v);
    router.push(url.pathname + url.search);
  }

  const upcoming = bookings.find(
    (b) => b.status === "booked" && new Date(b.start_at).getTime() > Date.now()
  );

  return (
    <div className="grid gap-6">
      <section className="relative overflow-hidden rounded-3xl bg-ink-gradient p-8 text-white">
        <div className="absolute inset-0 bg-grid bg-[length:30px_30px] opacity-20" />
        <div className="absolute right-0 top-0 h-full w-3 barber-pole" />
        <div className="relative grid gap-4 md:grid-cols-[1fr_auto]">
          <div>
            <p className="pill bg-white/15 text-white border-white/20 w-fit">
              💈 {barber.business_name}
            </p>
            <h1 className="mt-3 text-4xl font-extrabold">Hey, {barber.name.split(" ")[0]}.</h1>
            <p className="mt-1 text-sm text-white/80">
              {barber.shop_name} · Seat {barber.seat_number}
              {barber.shop_address && (
                <span className="text-white/60"> · {barber.shop_address}</span>
              )}
            </p>
          </div>
          <div className="grid gap-2">
            <input
              type="date"
              value={day}
              onChange={(e) => changeDay(e.target.value)}
              className="rounded-lg border border-white/20 bg-white/10 px-3 py-2 text-sm text-white placeholder-white/50 backdrop-blur"
            />
            {upcoming && (
              <div className="rounded-xl bg-brand-500/20 px-3 py-2 text-xs">
                <p className="font-bold uppercase tracking-wider text-brand-200">
                  Next up
                </p>
                <p className="text-sm">
                  {upcoming.customer_name} ·{" "}
                  {new Date(upcoming.start_at).toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </p>
              </div>
            )}
          </div>
        </div>
      </section>

      <div className="grid gap-3 sm:grid-cols-4">
        <Stat
          label="Today"
          v={`$${(summary?.earned || 0).toFixed(0)}`}
          sub={`${summary?.done || 0} done · ${summary?.upcoming || 0} ahead`}
        />
        <Stat
          label="Pending today"
          v={`$${((summary?.total || 0) - (summary?.earned || 0)).toFixed(0)}`}
          sub="if everyone shows up"
        />
        <Stat
          label="Last 7 days"
          v={`$${(stats?.week?.earned || 0).toFixed(0)}`}
          sub="earned"
        />
        <Stat
          label="Rating"
          v={
            stats?.rating?.count
              ? `⭐ ${stats.rating.avg.toFixed(1)}`
              : "—"
          }
          sub={stats?.rating?.count ? `${stats.rating.count} reviews` : "No reviews yet"}
        />
      </div>

      <section className="card">
        <div className="flex items-center justify-between">
          <h2 className="font-bold">Schedule · {day}</h2>
          <p className="text-xs text-ink-400">
            Open {barber.open_hour}:00 → {barber.close_hour}:00 · {barber.shop_seats} seats
          </p>
        </div>

        <div className="mt-4 grid gap-2">
          {bookings.length === 0 && (
            <div className="rounded-xl border border-dashed border-ink-100 p-10 text-center text-sm text-ink-400">
              No bookings today. Enjoy the breather. ☕
            </div>
          )}
          {bookings.map((b) => {
            const past = new Date(b.end_at).getTime() < Date.now();
            return (
              <div
                key={b.id}
                className={`grid grid-cols-[auto_1fr_auto] items-center gap-4 rounded-xl border p-3 ${
                  b.status === "completed"
                    ? "border-emerald-100 bg-emerald-50/60"
                    : b.status === "cancelled"
                    ? "border-ink-100 bg-ink-50 opacity-70"
                    : past
                    ? "border-amber-200 bg-amber-50/70"
                    : "border-ink-100 bg-white"
                }`}
              >
                <div className="grid place-items-center rounded-lg bg-white px-3 py-2 text-center shadow-soft">
                  <p className="text-lg font-extrabold tabular-nums">
                    {new Date(b.start_at).toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </p>
                  <p className="text-[10px] uppercase tracking-wider text-ink-400">
                    {b.duration_min} min
                  </p>
                </div>
                <div>
                  <p className="font-bold">
                    {b.customer_name}{" "}
                    <span className="font-normal text-ink-400">
                      · {b.service_name}
                    </span>
                  </p>
                  <p className="text-xs text-ink-400">
                    Seat {barber.seat_number}
                    {b.customer_phone && (
                      <span> · 📞 {b.customer_phone}</span>
                    )}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-bold">${Number(b.price).toFixed(2)}</span>
                  {b.status === "booked" && (
                    <>
                      <button
                        disabled={busy === b.id}
                        onClick={() => setStatus(b.id, "completed")}
                        className="btn-primary text-xs px-3 py-1.5"
                      >
                        ✓ Done
                      </button>
                      <button
                        disabled={busy === b.id}
                        onClick={() => setStatus(b.id, "cancelled")}
                        className="btn-ghost text-xs px-3 py-1.5"
                      >
                        Skip
                      </button>
                    </>
                  )}
                  {b.status === "completed" && <span className="pill-green">done</span>}
                  {b.status === "cancelled" && <span className="pill-slate">cancelled</span>}
                </div>
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
}

function Stat({ label, v, sub }) {
  return (
    <div className="card">
      <p className="text-[10px] font-bold uppercase tracking-widest text-ink-400">{label}</p>
      <p className="mt-1 text-2xl font-extrabold tabular-nums">{v}</p>
      {sub && <p className="text-xs text-ink-400">{sub}</p>}
    </div>
  );
}
