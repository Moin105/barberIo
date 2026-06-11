"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Icon from "@/components/Icon";

export default function MyBookingsList({ bookings }) {
  const router = useRouter();
  const [busy, setBusy] = useState(null);
  const [rating, setRating] = useState({});

  // Keep the list live: refresh whenever the tab regains focus and every 30s
  // while it's open, so a booking marked done by the shop appears without a
  // manual reload.
  useEffect(() => {
    const refresh = () => router.refresh();
    const onVisible = () => {
      if (document.visibilityState === "visible") refresh();
    };
    window.addEventListener("focus", refresh);
    document.addEventListener("visibilitychange", onVisible);
    const id = setInterval(refresh, 30_000);
    return () => {
      window.removeEventListener("focus", refresh);
      document.removeEventListener("visibilitychange", onVisible);
      clearInterval(id);
    };
  }, [router]);

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
    <div className="flex flex-col gap-6">
      <div>
        <span className="eyebrow">My account</span>
        <h1 className="display mt-2 text-3xl text-ink-900">My bookings</h1>
        <p className="text-sm text-ink-400">
          Past and upcoming appointments. Leave a rating after a visit.
        </p>
      </div>

      {bookings.length === 0 ? (
        <div className="card flex flex-col items-center gap-3 text-center">
          <span className="flex h-12 w-12 items-center justify-center rounded-md bg-brand-50 text-brand-700">
            <Icon name="calendar" className="h-6 w-6" />
          </span>
          <p className="display text-lg">No bookings yet.</p>
          <Link href="/shops" className="btn-primary">
            Find a barber
          </Link>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {bookings.map((b) => {
            const when = new Date(b.start_at);
            const upcoming = when.getTime() > Date.now();
            return (
              <div key={b.id} className="card flex flex-col gap-3">
                <div className="flex items-center gap-3">
                  {b.photo_url ? (
                    <img
                      src={b.photo_url}
                      alt=""
                      className="h-12 w-12 rounded-md object-cover"
                    />
                  ) : (
                    <div className="flex h-12 w-12 items-center justify-center rounded-md bg-brand-50 text-brand-700">
                      <Icon name="user" className="h-5 w-5" />
                    </div>
                  )}
                  <div className="min-w-0 flex-1">
                    <p className="font-semibold">
                      {b.service_name} with {b.barber_name}
                    </p>
                    <p className="truncate text-xs text-ink-400">
                      {b.shop_name} · Seat {b.seat_number} ·{" "}
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
                        ? "pill-green"
                        : b.status === "cancelled"
                        ? "pill-slate"
                        : upcoming
                        ? "pill-amber"
                        : "pill-slate"
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
                  <div className="rounded-md border border-ink-100 bg-paper-100/60 p-3">
                    <p className="text-[10px] font-bold uppercase tracking-widest text-ink-400">
                      Rate this visit
                    </p>
                    <div className="mt-2 flex gap-1">
                      {[1, 2, 3, 4, 5].map((n) => (
                        <button
                          key={n}
                          type="button"
                          onClick={() =>
                            setRating((p) => ({
                              ...p,
                              [b.id]: { ...(p[b.id] || {}), stars: n },
                            }))
                          }
                          className="text-brass-500 transition hover:scale-110"
                          aria-label={`${n} stars`}
                        >
                          <Icon
                            name="star"
                            className="h-7 w-7"
                            filled={(rating[b.id]?.stars || 0) >= n}
                          />
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
                  <p className="inline-flex items-center gap-1.5 text-xs text-emerald-700">
                    <Icon name="check" className="h-3.5 w-3.5" /> You rated this visit.
                  </p>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
