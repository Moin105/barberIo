"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

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
    fetch(`/api/public/barbers/${barber.id}/availability?day=${day}&duration=${svc.duration_min}`)
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
      setError("Only customer accounts can book. Sign out of your owner account first.");
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
      <div className="card text-center text-slate-600">
        This barber has no services to book yet.
      </div>
    );
  }

  if (bookedId) {
    return (
      <div className="card border-green-300 bg-green-50">
        <p className="font-semibold text-green-800">Booking confirmed!</p>
        <p className="text-sm text-green-800">
          See it in <Link href="/my-bookings" className="underline">My bookings</Link>.
        </p>
      </div>
    );
  }

  return (
    <div className="card grid gap-4">
      <h2 className="font-semibold">Book a slot</h2>

      <div className="grid gap-3 sm:grid-cols-2">
        <div>
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
        <div>
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

      {error && <div className="rounded bg-red-50 px-3 py-2 text-sm text-red-700">{error}</div>}

      {loading ? (
        <p className="text-sm text-slate-500">Loading slots…</p>
      ) : (
        <div className="grid grid-cols-3 gap-2 sm:grid-cols-6">
          {slots.length === 0 && (
            <p className="col-span-full text-sm text-slate-500">No slots for this day.</p>
          )}
          {slots.map((s) => (
            <button
              key={s.start}
              disabled={!s.available}
              onClick={() => book(s)}
              className={`rounded-md px-3 py-2 text-sm font-medium transition ${
                s.available
                  ? "border border-ink-100 bg-white hover:bg-brand-500 hover:text-white hover:border-brand-500"
                  : "bg-slate-100 text-slate-400 line-through"
              }`}
            >
              {s.label}
            </button>
          ))}
        </div>
      )}

      {!me && (
        <p className="text-xs text-slate-500">
          You'll be asked to sign in before the booking is confirmed.
        </p>
      )}
    </div>
  );
}
