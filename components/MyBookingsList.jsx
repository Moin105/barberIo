"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function MyBookingsList({ bookings }) {
  const router = useRouter();
  const [busy, setBusy] = useState(null);
  const [rating, setRating] = useState({});

  async function cancel(id) {
    if (!confirm("Cancel this booking?")) return;
    setBusy(id);
    const res = await fetch(`/api/bookings/${id}/cancel`, { method: "POST" });
    setBusy(null);
    if (res.ok) router.refresh();
  }

  async function submitRating(bookingId) {
    const r = rating[bookingId];
    if (!r?.stars) return;
    setBusy(bookingId);
    const res = await fetch(`/api/bookings/${bookingId}/rate`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ stars: r.stars, comment: r.comment || "" }),
    });
    setBusy(null);
    if (res.ok) router.refresh();
  }

  return (
    <div className="grid gap-6">
      <div>
        <h1 className="text-2xl font-bold">My bookings</h1>
        <p className="text-sm text-slate-600">
          Past and upcoming appointments. Leave a rating after a visit.
        </p>
      </div>

      {bookings.length === 0 ? (
        <div className="card text-center">
          <p className="text-slate-600">No bookings yet.</p>
          <Link href="/shops" className="btn-primary mt-3 inline-block">
            Find a barber
          </Link>
        </div>
      ) : (
        <div className="grid gap-3">
          {bookings.map((b) => {
            const when = new Date(b.start_at);
            const upcoming = when.getTime() > Date.now();
            return (
              <div key={b.id} className="card grid gap-3">
                <div className="flex items-center gap-4">
                  {b.photo_url ? (
                    <img
                      src={b.photo_url}
                      alt=""
                      className="h-12 w-12 rounded-full object-cover"
                    />
                  ) : (
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-slate-200 text-xl">
                      💈
                    </div>
                  )}
                  <div className="flex-1">
                    <p className="font-semibold">
                      {b.service_name} with {b.barber_name}
                    </p>
                    <p className="text-xs text-slate-500">
                      {b.shop_name} ·{" "}
                      {when.toLocaleString([], {
                        weekday: "short",
                        month: "short",
                        day: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}{" "}
                      · ${Number(b.price).toFixed(2)}
                    </p>
                  </div>
                  <span
                    className={`pill ${
                      b.status === "completed"
                        ? "bg-green-100 text-green-700"
                        : b.status === "cancelled"
                        ? "bg-slate-100 text-slate-500"
                        : upcoming
                        ? "bg-amber-100 text-amber-700"
                        : "bg-slate-100 text-slate-700"
                    }`}
                  >
                    {b.status}
                  </span>
                  {b.status === "booked" && upcoming && (
                    <button
                      disabled={busy === b.id}
                      onClick={() => cancel(b.id)}
                      className="btn-ghost text-xs"
                    >
                      Cancel
                    </button>
                  )}
                </div>

                {b.status === "completed" && !b.rating_id && (
                  <div className="rounded-md bg-slate-50 p-3">
                    <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                      Rate this visit
                    </p>
                    <div className="mt-2 flex gap-1 text-2xl">
                      {[1, 2, 3, 4, 5].map((n) => (
                        <button
                          key={n}
                          onClick={() =>
                            setRating((p) => ({
                              ...p,
                              [b.id]: { ...(p[b.id] || {}), stars: n },
                            }))
                          }
                          className={
                            (rating[b.id]?.stars || 0) >= n ? "text-amber-400" : "text-slate-300"
                          }
                        >
                          ★
                        </button>
                      ))}
                    </div>
                    <textarea
                      placeholder="Leave a comment (optional)"
                      className="input mt-2 h-20"
                      value={rating[b.id]?.comment || ""}
                      onChange={(e) =>
                        setRating((p) => ({
                          ...p,
                          [b.id]: { ...(p[b.id] || {}), comment: e.target.value },
                        }))
                      }
                    />
                    <button
                      disabled={busy === b.id || !rating[b.id]?.stars}
                      onClick={() => submitRating(b.id)}
                      className="btn-primary mt-2 text-xs"
                    >
                      {busy === b.id ? "Submitting…" : "Submit rating"}
                    </button>
                  </div>
                )}

                {b.rating_id && (
                  <p className="text-xs text-green-700">✓ You rated this visit.</p>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
