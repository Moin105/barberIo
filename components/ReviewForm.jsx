"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Icon from "@/components/Icon";

export default function ReviewForm({ token, booking }) {
  const router = useRouter();
  const [stars, setStars] = useState(0);
  const [hover, setHover] = useState(0);
  const [comment, setComment] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(null);
  const [done, setDone] = useState(false);

  async function submit(e) {
    e.preventDefault();
    if (!stars) {
      setError("Pick a star rating first.");
      return;
    }
    setError(null);
    setBusy(true);
    try {
      const res = await fetch(`/api/review/${token}`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ stars, comment }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data.error || "Could not submit review");
        setBusy(false);
        return;
      }
      setDone(true);
      setBusy(false);
      setTimeout(() => router.refresh(), 800);
    } catch {
      setError("Network error");
      setBusy(false);
    }
  }

  if (done) {
    return (
      <div className="mx-auto max-w-md py-10">
        <div className="card border-emerald-200 bg-emerald-50 text-center text-emerald-900">
          <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-md bg-paper-50 text-emerald-700">
            <Icon name="check" className="h-6 w-6" />
          </span>
          <h1 className="display mt-3 text-2xl">Thanks for the review!</h1>
          <p className="mt-1 text-sm">
            It helps {booking.barber_name} and the next customer at {booking.business_name}.
          </p>
        </div>
      </div>
    );
  }

  const visible = hover || stars;

  return (
    <div className="mx-auto max-w-md py-10">
      <div className="card relative overflow-hidden">
        <span className="absolute inset-y-0 left-0 w-1 barber-pole" />
        <div className="pl-3">
          <span className="eyebrow">Verified visit</span>
          <h1 className="display mt-2 text-3xl text-ink-900">
            How was your cut?
          </h1>
          <div className="mt-3 flex items-center gap-3">
            {booking.photo_url ? (
              <img
                src={booking.photo_url}
                alt=""
                className="h-12 w-12 rounded-md object-cover"
              />
            ) : (
              <span className="flex h-12 w-12 items-center justify-center rounded-md bg-brand-50 text-brand-700">
                <Icon name="user" className="h-6 w-6" />
              </span>
            )}
            <div>
              <p className="font-bold">{booking.barber_name}</p>
              <p className="text-xs text-ink-400">
                {booking.service_name} · {booking.business_name}
              </p>
            </div>
          </div>

          <form onSubmit={submit} className="mt-6 flex flex-col gap-4">
            <div>
              <p className="label">Your rating</p>
              <div
                className="flex gap-1"
                onMouseLeave={() => setHover(0)}
              >
                {[1, 2, 3, 4, 5].map((n) => (
                  <button
                    key={n}
                    type="button"
                    onClick={() => setStars(n)}
                    onMouseEnter={() => setHover(n)}
                    aria-label={`${n} stars`}
                    className="text-brass-500 transition hover:scale-110"
                  >
                    <Icon name="star" className="h-9 w-9" filled={visible >= n} />
                  </button>
                ))}
              </div>
              {stars > 0 && (
                <p className="mt-2 text-xs text-ink-400">
                  {["", "Rough", "Eh", "Good", "Great", "Best in town"][stars]}
                </p>
              )}
            </div>
            <div>
              <label className="label">Comment (optional)</label>
              <textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                maxLength={400}
                rows={3}
                className="input"
                placeholder="What stood out? Anything they could do better?"
              />
            </div>
            {error && (
              <div className="rounded-md border border-brand-100 bg-brand-50 px-3 py-2 text-sm text-brand-700">
                {error}
              </div>
            )}
            <button disabled={busy} className="btn-primary w-full py-3">
              {busy ? "Sending…" : "Submit review"}
            </button>
            <p className="text-[10px] text-center uppercase tracking-widest text-ink-400">
              One review per visit · expires after 24 hours
            </p>
          </form>
        </div>
      </div>
    </div>
  );
}
