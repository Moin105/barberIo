"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function AuthForm({ mode, role, title, subtitle, redirectTo }) {
  const router = useRouter();
  const [error, setError] = useState(null);
  const [busy, setBusy] = useState(false);

  async function onSubmit(e) {
    e.preventDefault();
    setError(null);
    setBusy(true);
    const fd = new FormData(e.currentTarget);
    const payload = Object.fromEntries(fd.entries());
    if (mode === "signup") payload.role = role;
    const path = mode === "signup" ? "/api/auth/signup" : "/api/auth/login";
    try {
      const res = await fetch(path, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data.error || "Something went wrong");
        setBusy(false);
        return;
      }
      const target =
        redirectTo ||
        (data.user?.role === "owner"
          ? "/owner"
          : data.user?.role === "super_admin"
          ? "/admin"
          : data.user?.role === "barber"
          ? "/barber"
          : "/shops");
      router.push(target);
      router.refresh();
    } catch (err) {
      setError("Network error");
      setBusy(false);
    }
  }

  return (
    <div className="mx-auto max-w-md">
      <div className="card">
        <h1 className="text-2xl font-extrabold tracking-tight">{title}</h1>
        {subtitle && <p className="mt-1 text-sm text-ink-400">{subtitle}</p>}
        <form onSubmit={onSubmit} className="mt-5 grid gap-3">
          {mode === "signup" && (
            <div>
              <label className="label">Full name</label>
              <input name="name" required className="input" />
            </div>
          )}
          {mode === "signup" && role === "owner" && (
            <div>
              <label className="label">Business name</label>
              <input
                name="businessName"
                placeholder="e.g. Sharp Cuts Inc."
                className="input"
              />
            </div>
          )}
          <div>
            <label className="label">Email</label>
            <input name="email" type="email" required className="input" />
          </div>
          {mode === "signup" && (
            <div>
              <label className="label">Phone (optional)</label>
              <input name="phone" className="input" />
            </div>
          )}
          <div>
            <label className="label">Password</label>
            <input
              name="password"
              type="password"
              required
              minLength={6}
              className="input"
              placeholder={mode === "signup" ? "min 6 characters" : ""}
            />
          </div>
          {error && (
            <div className="rounded-lg bg-brand-50 px-3 py-2 text-sm text-brand-700 border border-brand-100">
              {error}
            </div>
          )}
          <button disabled={busy} type="submit" className="btn-primary mt-1">
            {busy ? "Please wait…" : mode === "signup" ? "Create account" : "Sign in"}
          </button>
        </form>
      </div>
    </div>
  );
}
