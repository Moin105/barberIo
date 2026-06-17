"use client";

import { useEffect, useState } from "react";
import QRCode from "react-qr-code";
import Icon from "@/components/Icon";

export default function ReviewQRButton({ token, customerName, barberName }) {
  const [open, setOpen] = useState(false);
  const [url, setUrl] = useState("");

  useEffect(() => {
    if (typeof window === "undefined") return;
    setUrl(`${window.location.origin}/review/${token}`);
  }, [token]);

  useEffect(() => {
    function onKey(e) {
      if (e.key === "Escape") setOpen(false);
    }
    if (open) document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open]);

  if (!token) return null;

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="btn-ghost inline-flex items-center gap-1 text-xs"
        title="Show review QR for the customer"
      >
        <Icon name="star" className="h-3.5 w-3.5" /> Review QR
      </button>

      {open && (
        <div
          className="fixed inset-0 z-[80] flex items-center justify-center bg-ink-900/60 p-4"
          onClick={() => setOpen(false)}
        >
          <div
            className="card relative w-full max-w-sm bg-paper-50 text-center"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="absolute right-3 top-3 inline-flex h-7 w-7 items-center justify-center rounded-md text-ink-400 hover:bg-paper-100 hover:text-ink-900"
              aria-label="Close"
            >
              <Icon name="x" className="h-4 w-4" />
            </button>
            <span className="eyebrow inline-flex">Verified review</span>
            <h3 className="display mt-2 text-2xl text-ink-900">
              Hand the phone to {customerName?.split(" ")[0] || "the customer"}
            </h3>
            <p className="mt-1 text-xs text-ink-400">
              They'll scan and leave one review for this visit only.
            </p>
            <div className="mt-4 flex justify-center">
              <div className="rounded-md border border-ink-100 bg-white p-4 shadow-soft">
                {url ? (
                  <QRCode value={url} size={208} bgColor="#ffffff" fgColor="#13110f" level="M" />
                ) : (
                  <div className="h-52 w-52 animate-pulse rounded bg-paper-100" />
                )}
              </div>
            </div>
            <p className="mt-3 text-[10px] uppercase tracking-widest text-ink-400">
              Link expires in 24h · single use
            </p>
            {url && (
              <p className="mt-1 truncate text-[11px] text-ink-400">
                {url}
              </p>
            )}
          </div>
        </div>
      )}
    </>
  );
}
