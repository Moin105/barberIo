"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Icon from "@/components/Icon";

export default function MyBookingsList({ bookings }) {
  const router = useRouter();
  const [busy, setBusy] = useState(null);

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

  return (
    <div className="flex flex-col gap-6">
      <div>
        <span className="eyebrow">My account</span>
        <h1 className="display mt-2 text-3xl text-ink-900">My bookings</h1>
        <p className="text-sm text-ink-400">
          Past and upcoming appointments. Scan the QR at the shop after a visit to rate it.
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
                        hour: "numeric",
                        minute: "2-digit",
                        hour12: true,
                      })}{" "}
                      · ${Number(b.price).toFixed(2)}
                    </p>
                  </div>
                  <span
                    className={`pill ${
                      b.status === "completed"
                        ? "pill-green"
                        : b.status === "cancelled" || b.status === "declined"
                        ? "pill-slate"
                        : b.status === "pending"
                        ? "pill-amber"
                        : upcoming
                        ? "pill-brand"
                        : "pill-slate"
                    }`}
                  >
                    {b.status === "pending"
                      ? "awaiting confirmation"
                      : b.status === "booked"
                      ? "confirmed"
                      : b.status}
                  </span>
                  {["pending", "booked"].includes(b.status) && upcoming && (
                    <button
                      disabled={busy === b.id}
                      onClick={() => cancel(b.id)}
                      className="btn-ghost text-xs"
                    >
                      Cancel
                    </button>
                  )}
                </div>

                {b.status === "completed" && (
                  <div className="flex flex-wrap items-center gap-3">
                    {!b.rating_id && !b.review_consumed_at && (
                      <p className="inline-flex items-center gap-2 rounded-md border border-amber-100 bg-amber-50 px-3 py-1.5 text-xs text-amber-800">
                        <Icon name="star" className="h-3.5 w-3.5" filled />
                        Scan the QR at the shop to leave a review (expires 24h after the visit).
                      </p>
                    )}
                    {b.rating_id && (
                      <span className="inline-flex items-center gap-1.5 text-xs text-emerald-700">
                        <Icon name="check" className="h-3.5 w-3.5" /> You rated this visit.
                      </span>
                    )}
                    {b.invoice_id && (
                      <Link
                        href={`/invoices/${b.id}`}
                        className="btn-ghost inline-flex items-center gap-1 text-xs"
                      >
                        <Icon name="wallet" className="h-3.5 w-3.5" /> View invoice
                      </Link>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
