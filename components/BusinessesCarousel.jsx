"use client";

import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import Icon from "@/components/Icon";

const AUTOPLAY_MS = 4200;

export default function BusinessesCarousel({ items }) {
  const trackRef = useRef(null);
  const [paused, setPaused] = useState(false);
  const [canLeft, setCanLeft] = useState(false);
  const [canRight, setCanRight] = useState(true);

  const updateArrows = useCallback(() => {
    const el = trackRef.current;
    if (!el) return;
    setCanLeft(el.scrollLeft > 4);
    setCanRight(el.scrollLeft < el.scrollWidth - el.clientWidth - 4);
  }, []);

  function stepWidth(el) {
    const first = el?.firstElementChild;
    if (!first) return 320;
    return first.getBoundingClientRect().width + 16;
  }

  function nudge(dir) {
    const el = trackRef.current;
    if (!el) return;
    el.scrollBy({ left: dir * stepWidth(el), behavior: "smooth" });
  }

  // Pointer-based drag scrolling
  useEffect(() => {
    const el = trackRef.current;
    if (!el) return;
    let down = false;
    let startX = 0;
    let startLeft = 0;
    let moved = false;

    function onDown(e) {
      down = true;
      moved = false;
      startX = e.clientX;
      startLeft = el.scrollLeft;
      el.style.cursor = "grabbing";
      setPaused(true);
    }
    function onMove(e) {
      if (!down) return;
      const dx = e.clientX - startX;
      if (Math.abs(dx) > 4) moved = true;
      el.scrollLeft = startLeft - dx;
    }
    function onUp() {
      if (!down) return;
      down = false;
      el.style.cursor = "";
      setPaused(false);
    }
    function onClickCapture(e) {
      // suppress click that follows a real drag
      if (moved) {
        e.preventDefault();
        e.stopPropagation();
        moved = false;
      }
    }
    el.addEventListener("pointerdown", onDown);
    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerup", onUp);
    el.addEventListener("click", onClickCapture, true);
    el.style.cursor = "grab";
    return () => {
      el.removeEventListener("pointerdown", onDown);
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onUp);
      el.removeEventListener("click", onClickCapture, true);
    };
  }, []);

  // Arrow-visibility sync
  useEffect(() => {
    const el = trackRef.current;
    if (!el) return;
    updateArrows();
    el.addEventListener("scroll", updateArrows, { passive: true });
    window.addEventListener("resize", updateArrows);
    return () => {
      el.removeEventListener("scroll", updateArrows);
      window.removeEventListener("resize", updateArrows);
    };
  }, [updateArrows, items]);

  // Auto-scroll (pauses on hover/drag/tab-hidden)
  useEffect(() => {
    if (paused) return;
    if (typeof document !== "undefined" && document.visibilityState !== "visible") return;
    const id = setInterval(() => {
      const el = trackRef.current;
      if (!el) return;
      const max = el.scrollWidth - el.clientWidth;
      if (el.scrollLeft >= max - 4) {
        el.scrollTo({ left: 0, behavior: "smooth" });
      } else {
        el.scrollBy({ left: stepWidth(el), behavior: "smooth" });
      }
    }, AUTOPLAY_MS);
    return () => clearInterval(id);
  }, [paused, items]);

  if (!items || items.length === 0) return null;

  return (
    <section
      className="flex flex-col gap-8"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocus={() => setPaused(true)}
      onBlur={() => setPaused(false)}
    >
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <span className="eyebrow inline-flex items-center gap-2">
            <Icon name="store" className="h-3.5 w-3.5" /> Onboarded
          </span>
          <h2 className="display mt-2 text-4xl text-ink-900 sm:text-5xl">
            Shops live on Clipper.
          </h2>
          <p className="text-sm text-ink-400">
            Real barber businesses already booking customers through the platform.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => nudge(-1)}
            disabled={!canLeft}
            aria-label="Previous shops"
            className="grid h-10 w-10 place-items-center rounded-full border border-ink-100 bg-paper-50 text-ink-700 shadow-soft transition hover:border-brand-200 hover:text-brand-600 disabled:opacity-40 disabled:hover:border-ink-100 disabled:hover:text-ink-700"
          >
            <Icon name="arrow" className="h-4 w-4 -scale-x-100" />
          </button>
          <button
            type="button"
            onClick={() => nudge(1)}
            disabled={!canRight}
            aria-label="More shops"
            className="grid h-10 w-10 place-items-center rounded-full border border-ink-100 bg-paper-50 text-ink-700 shadow-soft transition hover:border-brand-200 hover:text-brand-600 disabled:opacity-40 disabled:hover:border-ink-100 disabled:hover:text-ink-700"
          >
            <Icon name="arrow" className="h-4 w-4" />
          </button>
        </div>
      </div>

      <div className="relative">
        {/* Fade edges */}
        <span className="pointer-events-none absolute inset-y-0 left-0 z-10 w-12 bg-gradient-to-r from-paper-50 to-transparent" />
        <span className="pointer-events-none absolute inset-y-0 right-0 z-10 w-12 bg-gradient-to-l from-paper-50 to-transparent" />

        <div
          ref={trackRef}
          className="no-scrollbar flex snap-x snap-mandatory gap-4 overflow-x-auto scroll-smooth pb-3 select-none"
        >
          {items.map((b) => (
            <BusinessCard key={b.business_id} b={b} />
          ))}
        </div>
      </div>
    </section>
  );
}

function BusinessCard({ b }) {
  return (
    <Link
      href={`/shops/${b.shop_id}`}
      className="card card-hover relative flex w-72 shrink-0 snap-start flex-col gap-3 overflow-hidden sm:w-80"
      draggable={false}
    >
      <span className="pointer-events-none absolute inset-y-0 left-0 w-1 barber-pole" />
      <div className="flex items-start gap-3 pl-3">
        <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-md bg-brand-50 text-brand-700">
          <Icon name="store" className="h-6 w-6" />
        </span>
        <div className="min-w-0 flex-1">
          <p className="display truncate text-lg leading-tight text-ink-900">
            {b.business_name}
          </p>
          <p className="mt-0.5 text-[11px] font-semibold uppercase tracking-widest text-brand-600">
            <span className="tabular-nums">{b.shop_count}</span>{" "}
            {b.shop_count === 1 ? "shop" : "shops"} ·{" "}
            <span className="tabular-nums">{b.barber_count}</span> barbers
          </p>
        </div>
      </div>

      <div className="flex flex-col gap-1 pl-3 text-sm text-ink-700">
        <p className="truncate">{b.shop_name}</p>
        <p className="truncate text-xs text-ink-400">
          {b.shop_address || "Address coming soon"}
        </p>
      </div>

      <div className="mt-auto flex items-center justify-between border-t border-ink-100 pl-3 pt-3">
        {b.rating_avg ? (
          <span className="inline-flex items-center gap-1 text-sm">
            <Icon name="star" className="h-3.5 w-3.5 text-brass-500" filled />
            <span className="font-semibold tabular-nums">
              {Number(b.rating_avg).toFixed(1)}
            </span>
            <span className="text-[11px] text-ink-400">({b.rating_count})</span>
          </span>
        ) : (
          <span className="pill-amber">Fresh on Clipper</span>
        )}
        <span className="inline-flex items-center gap-1 text-xs font-semibold text-brand-600">
          Visit <Icon name="arrow" className="h-3 w-3" />
        </span>
      </div>
    </Link>
  );
}
