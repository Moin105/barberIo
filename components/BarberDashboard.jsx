"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Icon from "@/components/Icon";
import ReviewQRButton from "@/components/ReviewQRButton";

export default function BarberDashboard({ day, barber, bookings, summary, stats }) {
  const router = useRouter();
  const [busy, setBusy] = useState(null);

  if (!barber) {
    return (
      <div className="card mx-auto max-w-lg text-center">
        <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-md bg-brand-50 text-brand-700">
          <Icon name="user" className="h-6 w-6" />
        </span>
        <p className="display mt-3 text-lg">No barber profile yet.</p>
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
    <div className="flex flex-col gap-6">
      <section className="relative overflow-hidden rounded-2xl bg-ink-gradient p-8 text-paper-50">
        <div className="pointer-events-none absolute inset-0 bg-grid bg-[length:30px_30px] opacity-20" />
        <div className="pointer-events-none absolute right-0 top-0 h-full w-2 barber-pole" />
        <div className="relative flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <span className="pill inline-flex items-center gap-1.5 border-paper-50/20 bg-paper-50/10 text-paper-50">
              <Icon name="store" className="h-3.5 w-3.5" /> {barber.business_name}
            </span>
            <h1 className="display mt-3 text-4xl">
              Hey, {barber.name.split(" ")[0]}.
            </h1>
            <p className="mt-1 text-sm text-paper-50/80">
              {barber.shop_name} · Seat {barber.seat_number}
              {barber.shop_address && (
                <span className="text-paper-50/60"> · {barber.shop_address}</span>
              )}
            </p>
          </div>
          <div className="flex flex-col gap-2 md:items-end">
            <input
              type="date"
              value={day}
              onChange={(e) => changeDay(e.target.value)}
              className="rounded-md border border-paper-50/20 bg-paper-50/10 px-3 py-2 text-sm text-paper-50 backdrop-blur"
            />
            {upcoming && (
              <div className="rounded-md bg-brand-500/20 px-3 py-2 text-xs">
                <p className="font-bold uppercase tracking-widest text-brand-200">Next up</p>
                <p className="text-sm">
                  {upcoming.customer_name} ·{" "}
                  {new Date(upcoming.start_at).toLocaleTimeString([], {
                    hour: "numeric",
                    minute: "2-digit",
                    hour12: true,
                  })}
                </p>
              </div>
            )}
          </div>
        </div>
      </section>

      <div className="flex flex-wrap gap-3">
        <Stat
          icon="wallet"
          label="Today"
          v={`$${(summary?.earned || 0).toFixed(0)}`}
          sub={`${summary?.done || 0} done · ${summary?.upcoming || 0} ahead`}
        />
        <Stat
          icon="clock"
          label="Pending today"
          v={`$${((summary?.total || 0) - (summary?.earned || 0)).toFixed(0)}`}
          sub="if everyone shows up"
        />
        <Stat
          icon="trend"
          label="Last 7 days"
          v={`$${(stats?.week?.earned || 0).toFixed(0)}`}
          sub="earned"
        />
        <Stat
          icon="star"
          label="Rating"
          v={stats?.rating?.count ? stats.rating.avg.toFixed(1) : "—"}
          sub={stats?.rating?.count ? `${stats.rating.count} reviews` : "No reviews yet"}
        />
      </div>

      <section className="card">
        <div className="flex items-center justify-between">
          <h2 className="display text-xl text-ink-900">Schedule · {day}</h2>
          <p className="text-xs text-ink-400">
            Open {barber.open_hour}:00 → {barber.close_hour}:00 · {barber.shop_seats} seats
          </p>
        </div>

        <div className="mt-4 flex flex-col gap-2">
          {bookings.length === 0 && (
            <div className="rounded-md border border-dashed border-ink-100 p-10 text-center text-sm text-ink-400">
              No bookings today. Enjoy the breather.
            </div>
          )}
          {bookings.map((b) => {
            const past = new Date(b.end_at).getTime() < Date.now();
            return (
              <div
                key={b.id}
                className={`flex items-center gap-4 rounded-md border p-3 ${
                  b.status === "completed"
                    ? "border-emerald-100 bg-emerald-50/60"
                    : b.status === "cancelled"
                    ? "border-ink-100 bg-paper-100 opacity-70"
                    : past
                    ? "border-amber-200 bg-amber-50/70"
                    : "border-ink-100 bg-paper-50"
                }`}
              >
                <div className="grid place-items-center rounded-md bg-paper-50 px-3 py-2 text-center shadow-soft">
                  <p className="display text-lg tabular-nums">
                    {new Date(b.start_at).toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </p>
                  <p className="text-[10px] uppercase tracking-widest text-ink-400">
                    {b.duration_min} min
                  </p>
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate font-bold">
                    {b.customer_name}{" "}
                    <span className="font-normal text-ink-400">· {b.service_name}</span>
                  </p>
                  <p className="inline-flex items-center gap-1 text-xs text-ink-400">
                    Seat {barber.seat_number}
                    {b.customer_phone && (
                      <>
                        <span className="text-ink-200">·</span>
                        <Icon name="phone" className="h-3 w-3" /> {b.customer_phone}
                      </>
                    )}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="display text-lg">${Number(b.price).toFixed(2)}</span>
                  {b.status === "booked" && (
                    <>
                      <button
                        disabled={busy === b.id}
                        onClick={() => setStatus(b.id, "completed")}
                        className="btn-primary inline-flex items-center gap-1 px-3 py-1.5 text-xs"
                      >
                        <Icon name="check" className="h-3.5 w-3.5" /> Done
                      </button>
                      <button
                        disabled={busy === b.id}
                        onClick={() => setStatus(b.id, "cancelled")}
                        className="btn-ghost px-3 py-1.5 text-xs"
                      >
                        Skip
                      </button>
                    </>
                  )}
                  {b.status === "completed" && (
                    <>
                      <span className="pill-green">done</span>
                      <ReviewQRButton
                        token={b.review_token}
                        customerName={b.customer_name}
                        barberName={barber.name}
                      />
                    </>
                  )}
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

function Stat({ icon, label, v, sub }) {
  return (
    <div className="card flex flex-1 basis-[200px] gap-3">
      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-brand-50 text-brand-700">
        <Icon name={icon} className="h-4 w-4" />
      </span>
      <div className="min-w-0">
        <p className="text-[10px] font-bold uppercase tracking-widest text-ink-400">{label}</p>
        <p className="display text-2xl tabular-nums">{v}</p>
        {sub && <p className="text-xs text-ink-400">{sub}</p>}
      </div>
    </div>
  );
}
