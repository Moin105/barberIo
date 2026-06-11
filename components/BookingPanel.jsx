"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Icon from "@/components/Icon";

export default function BookingPanel({ barber, services, me }) {
  const router = useRouter();
  const search = useSearchParams();

  const today = new Date().toISOString().slice(0, 10);
  const initialService = (() => {
    const sid = Number(search?.get("service"));
    return services.some((s) => s.id === sid) ? sid : services[0]?.id ?? null;
  })();
  const initialDay = (() => {
    const d = search?.get("day");
    return d && /^\d{4}-\d{2}-\d{2}$/.test(d) && d >= today ? d : today;
  })();

  const [day, setDay] = useState(initialDay);
  const [serviceId, setServiceId] = useState(initialService);
  const [slots, setSlots] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [bookedId, setBookedId] = useState(null);
  const [booking, setBooking] = useState(false);

  const svc = services.find((s) => s.id === serviceId);

  function nextHrefForLogin() {
    const params = new URLSearchParams();
    if (serviceId) params.set("service", String(serviceId));
    if (day) params.set("day", day);
    const path = `/barbers/${barber.id}${params.toString() ? `?${params}` : ""}`;
    return `/login?next=${encodeURIComponent(path)}`;
  }

  async function loadAvailability() {
    if (!svc) return;
    setLoading(true);
    setError(null);
    try {
      const r = await fetch(
        `/api/public/barbers/${barber.id}/availability?day=${day}&duration=${svc.duration_min}`
      );
      const d = await r.json().catch(() => ({}));
      setSlots(d.slots || []);
    } catch {
      setError("Could not load availability. Try refreshing.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadAvailability();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [day, serviceId, barber.id]);

  async function book(slot) {
    if (booking) return;
    if (!me) {
      router.push(nextHrefForLogin());
      return;
    }
    if (me.role !== "customer") {
      setError(
        "Only customer accounts can book. Sign out of your other account and sign in as a customer."
      );
      return;
    }
    setError(null);
    setBooking(true);
    try {
      const res = await fetch("/api/bookings", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          barber_id: barber.id,
          service_id: serviceId,
          start_at: slot.start,
        }),
      });

      if (res.status === 401) {
        // Session expired or never set. Send them to login with return path.
        router.push(nextHrefForLogin());
        return;
      }

      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        if (res.status === 409) {
          setError("That slot was just taken. Pick another one.");
          await loadAvailability();
        } else {
          setError(data.error || "Could not book this slot.");
        }
        return;
      }
      setBookedId(data.booking.id);
    } catch {
      setError("Network error. Check your connection and try again.");
    } finally {
      setBooking(false);
    }
  }

  if (services.length === 0) {
    return (
      <div className="card text-center text-ink-400">
        This barber has no services to book yet.
      </div>
    );
  }

  if (bookedId) {
    return (
      <div className="card flex items-start gap-3 border-amber-200 bg-amber-50">
        <Icon name="clock" className="mt-0.5 h-5 w-5 text-amber-700" />
        <div>
          <p className="display text-lg text-amber-900">Awaiting confirmation.</p>
          <p className="text-sm text-amber-800">
            Your request was sent to the shop. You'll get a notification when{" "}
            <b>{barber.name}</b> confirms or declines, and you can track it in{" "}
            <Link href="/my-bookings" className="font-semibold underline">
              My bookings
            </Link>
            .
          </p>
        </div>
      </div>
    );
  }

  const showWrongRole = me && me.role !== "customer";

  return (
    <div className="card flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h2 className="display text-xl text-ink-900">Book a slot</h2>
        <span className="pill-brand">Seat {barber.seat_number}</span>
      </div>

      {!me && (
        <p className="inline-flex items-start gap-2 rounded-md border border-amber-100 bg-amber-50 px-3 py-2 text-xs text-amber-800">
          <Icon name="lock" className="mt-0.5 h-3.5 w-3.5" />
          <span>
            You'll be asked to{" "}
            <Link href={nextHrefForLogin()} className="font-semibold underline">
              sign in
            </Link>{" "}
            before the booking is confirmed. Your selection will be remembered.
          </span>
        </p>
      )}

      {showWrongRole && (
        <p className="inline-flex items-start gap-2 rounded-md border border-brand-100 bg-brand-50 px-3 py-2 text-xs text-brand-700">
          <Icon name="x" className="mt-0.5 h-3.5 w-3.5" />
          <span>
            You're signed in as <b>{me.role}</b>. Only customer accounts can book.{" "}
            <form action="/logout" method="post" className="inline">
              <button type="submit" className="font-semibold underline">
                Sign out
              </button>
            </form>{" "}
            and{" "}
            <Link href="/signup" className="font-semibold underline">
              create a customer account
            </Link>
            .
          </span>
        </p>
      )}

      <div className="flex flex-col gap-3 sm:flex-row">
        <div className="flex-1">
          <label className="label">Service</label>
          <select
            value={serviceId ?? ""}
            onChange={(e) => setServiceId(Number(e.target.value))}
            className="input"
          >
            {services.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name} — ${Number(s.price).toFixed(2)} ({s.duration_min} min)
              </option>
            ))}
          </select>
        </div>
        <div className="flex-1">
          <label className="label">Date</label>
          <input
            type="date"
            value={day}
            min={today}
            onChange={(e) => setDay(e.target.value)}
            className="input"
          />
        </div>
      </div>

      {error && (
        <div className="rounded-md border border-brand-100 bg-brand-50 px-3 py-2 text-sm text-brand-700">
          {error}
        </div>
      )}

      {loading ? (
        <p className="text-sm text-ink-400">Loading slots…</p>
      ) : (
        <div className="flex flex-wrap gap-2">
          {slots.length === 0 && (
            <p className="text-sm text-ink-400">No slots for this day.</p>
          )}
          {slots.map((s) => (
            <button
              key={s.start}
              disabled={!s.available || booking || showWrongRole}
              onClick={() => book(s)}
              className={`w-[calc((100%-1rem)/3)] sm:w-[calc((100%-2.5rem)/6)] rounded-md px-3 py-2 text-sm font-semibold tabular-nums transition ${
                s.available && !showWrongRole
                  ? "border border-ink-100 bg-paper-50 hover:border-brand-500 hover:bg-brand-500 hover:text-paper-50 disabled:cursor-wait disabled:opacity-50"
                  : "cursor-not-allowed border border-ink-100 bg-paper-100 text-ink-400 line-through"
              }`}
            >
              {s.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
