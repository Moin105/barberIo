"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Icon from "@/components/Icon";

const POLL_MS = 30_000;

function timeAgo(iso) {
  const ms = Date.now() - new Date(iso).getTime();
  const s = Math.max(1, Math.floor(ms / 1000));
  if (s < 60) return `${s}s ago`;
  const m = Math.floor(s / 60);
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  const d = Math.floor(h / 24);
  return `${d}d ago`;
}

export default function NotificationBell() {
  const router = useRouter();
  const wrapRef = useRef(null);
  const [count, setCount] = useState(0);
  const [items, setItems] = useState([]);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [pulse, setPulse] = useState(false);

  const refreshCount = useCallback(async () => {
    try {
      const res = await fetch("/api/notifications/unread-count", {
        cache: "no-store",
      });
      if (res.ok) {
        const d = await res.json();
        const next = d.count || 0;
        setCount((prev) => {
          if (next > prev) setPulse(true);
          return next;
        });
      } else if (res.status === 401) {
        setCount(0);
      }
    } catch {
      /* network blip — ignore */
    }
  }, []);

  const loadList = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/notifications", { cache: "no-store" });
      if (res.ok) {
        const d = await res.json();
        setItems(d.notifications || []);
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshCount();
    const iv = setInterval(refreshCount, POLL_MS);
    const onFocus = () => refreshCount();
    window.addEventListener("focus", onFocus);
    return () => {
      clearInterval(iv);
      window.removeEventListener("focus", onFocus);
    };
  }, [refreshCount]);

  useEffect(() => {
    if (open) loadList();
  }, [open, loadList]);

  useEffect(() => {
    if (!open) return;
    function outside(e) {
      if (wrapRef.current && !wrapRef.current.contains(e.target)) setOpen(false);
    }
    window.addEventListener("mousedown", outside);
    return () => window.removeEventListener("mousedown", outside);
  }, [open]);

  useEffect(() => {
    if (!pulse) return;
    const t = setTimeout(() => setPulse(false), 900);
    return () => clearTimeout(t);
  }, [pulse]);

  async function markOne(id) {
    setItems((xs) =>
      xs.map((n) => (n.id === id && !n.read_at ? { ...n, read_at: new Date().toISOString() } : n))
    );
    setCount((c) => Math.max(0, c - 1));
    await fetch(`/api/notifications/${id}/read`, { method: "POST" });
  }

  async function markAll() {
    setItems((xs) => xs.map((n) => ({ ...n, read_at: n.read_at || new Date().toISOString() })));
    setCount(0);
    await fetch("/api/notifications/read-all", { method: "POST" });
  }

  function handleItemClick(n) {
    if (!n.read_at) markOne(n.id);
    if (n.href) {
      setOpen(false);
      router.push(n.href);
    }
  }

  return (
    <div ref={wrapRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-label="Notifications"
        className="relative inline-flex h-9 w-9 items-center justify-center rounded-md border border-ink-100 bg-paper-50 text-ink-700 transition hover:border-brand-200 hover:text-brand-600"
      >
        <Icon name="bell" className={`h-4 w-4 ${pulse ? "animate-bell-ring" : ""}`} />
        {count > 0 && (
          <span className="absolute -right-1 -top-1 flex h-4 min-w-[1rem] items-center justify-center rounded-full bg-brand-500 px-1 text-[10px] font-bold text-paper-50 shadow-soft">
            {count > 9 ? "9+" : count}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 top-full z-50 mt-2 w-[22rem] max-w-[calc(100vw-1.5rem)] origin-top-right rounded-xl border border-ink-100 bg-paper-50 shadow-soft">
          <div className="flex items-center justify-between border-b border-ink-100 px-4 py-3">
            <p className="display text-base text-ink-900">Notifications</p>
            <button
              onClick={markAll}
              className="text-xs font-semibold text-brand-600 hover:underline disabled:text-ink-400"
              disabled={count === 0}
            >
              Mark all read
            </button>
          </div>
          <div className="max-h-96 overflow-y-auto">
            {loading && (
              <p className="px-4 py-6 text-center text-xs text-ink-400">Loading…</p>
            )}
            {!loading && items.length === 0 && (
              <div className="flex flex-col items-center gap-2 px-4 py-8 text-center">
                <span className="flex h-9 w-9 items-center justify-center rounded-md bg-brand-50 text-brand-600">
                  <Icon name="bell" className="h-4 w-4" />
                </span>
                <p className="text-sm text-ink-400">No notifications yet.</p>
              </div>
            )}
            {!loading &&
              items.map((n) => (
                <button
                  key={n.id}
                  onClick={() => handleItemClick(n)}
                  className={`flex w-full items-start gap-3 border-b border-ink-100 px-4 py-3 text-left last:border-0 transition hover:bg-paper-100 ${
                    !n.read_at ? "bg-brand-50/40" : ""
                  }`}
                >
                  <span
                    className={`mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-md ${
                      n.read_at ? "bg-paper-100 text-ink-400" : "bg-brand-500 text-paper-50"
                    }`}
                  >
                    <Icon name={iconFor(n.kind)} className="h-3.5 w-3.5" />
                  </span>
                  <div className="min-w-0 flex-1">
                    <p
                      className={`truncate text-sm ${
                        n.read_at ? "font-medium text-ink-700" : "font-bold text-ink-900"
                      }`}
                    >
                      {n.title}
                    </p>
                    {n.body && (
                      <p className="line-clamp-2 text-xs text-ink-400">{n.body}</p>
                    )}
                    <p className="mt-1 text-[10px] uppercase tracking-widest text-ink-400">
                      {timeAgo(n.created_at)}
                    </p>
                  </div>
                  {!n.read_at && (
                    <span className="mt-1 h-2 w-2 shrink-0 rounded-full bg-brand-500" />
                  )}
                </button>
              ))}
          </div>
        </div>
      )}
    </div>
  );
}

function iconFor(kind) {
  if (kind?.startsWith("booking_")) return "calendar";
  if (kind === "rating_received") return "star";
  if (kind === "promotion_published") return "megaphone";
  return "bell";
}
