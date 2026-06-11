"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Icon from "@/components/Icon";

export default function BookingPanel({ barber, services, me }) {
  const router = useRouter();
  const today = new Date().toISOString().slice(0, 10);
  const [day, setDay] = useState(today);
  const [serviceId, setServiceId] = useState(services[0]?.id ?? null);
  const [slots, setSlots] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [bookedId, setBookedId] = useState(null);

  const svc = services.find((s) => s.id === serviceId);

  useEffect(() => {
    if (!svc) return;
    setLoading(true);
    setError(null);
    fetch(
      `/api/public/barbers/${barber.id}/availability?day=${day}&duration=${svc.duration_min}`
    )
      .then((r) => r.json())
      .then((d) => {
        setSlots(d.slots || []);
        setLoading(false);
      })
      .catch(() => {
        setError("Could not load availability");
        setLoading(false);
      });
  }, [day, serviceId, barber.id, svc?.duration_min]);

  async function book(slot) {
    if (!me) {
      router.push(`/login?next=/barbers/${barber.id}`);
      return;
    }
    if (me.role !== "customer") {
      setError("Only customer accounts can book. Sign out of your other account first.");
      return;
    }
    setError(null);
    const res = await fetch("/api/bookings", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        barber_id: barber.id,
        service_id: serviceId,
        start_at: slot.start,
      }),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      setError(data.error || "Could not book");
      return;
    }
    setBookedId(data.booking.id);
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
      <div className="card flex items-start gap-3 border-emerald-200 bg-emerald-50">
        <Icon name="check" className="mt-0.5 h-5 w-5 text-emerald-700" />
        <div>
          <p className="display text-lg text-emerald-900">Booking confirmed.</p>
          <p className="text-sm text-emerald-800">
            See it in{" "}
            <Link href="/my-bookings" className="font-semibold underline">
              My bookings
            </Link>
            .
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="card flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h2 className="display text-xl text-ink-900">Book a slot</h2>
        <span className="pill-brand">Seat {barber.seat_number}</span>
      </div>

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
              disabled={!s.available}
              onClick={() => book(s)}
              className={`w-[calc((100%-1rem)/3)] sm:w-[calc((100%-2.5rem)/6)] rounded-md px-3 py-2 text-sm font-semibold tabular-nums transition ${
                s.available
                  ? "border border-ink-100 bg-paper-50 hover:border-brand-500 hover:bg-brand-500 hover:text-paper-50"
                  : "cursor-not-allowed border border-ink-100 bg-paper-100 text-ink-400 line-through"
              }`}
            >
              {s.label}
            </button>
          ))}
        </div>
      )}

      {!me && (
        <p className="text-xs text-ink-400">
          You'll be asked to sign in before the booking is confirmed.
        </p>
      )}
    </div>
  );
}
