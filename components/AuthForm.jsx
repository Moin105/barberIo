"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Icon from "@/components/Icon";

const ROLE_HOME = {
  owner: "/owner",
  super_admin: "/admin",
  barber: "/barber",
  customer: "/shops",
};

function safeNext(raw) {
  // Only allow same-origin relative paths to prevent open-redirects.
  if (!raw || typeof raw !== "string") return null;
  if (!raw.startsWith("/")) return null;
  if (raw.startsWith("//")) return null;
  return raw;
}

export default function AuthForm({ mode, role, title, subtitle, redirectTo }) {
  const router = useRouter();
  const search = useSearchParams();
  const nextParam = safeNext(search?.get("next"));

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
      const home = ROLE_HOME[data.user?.role] || "/shops";
      // ?next= wins over redirectTo wins over role-home.
      const target = nextParam || redirectTo || home;
      router.push(target);
      router.refresh();
    } catch {
      setError("Network error");
      setBusy(false);
    }
  }

  return (
    <div className="mx-auto w-full max-w-md">
      <div className="card relative overflow-hidden">
        <span className="absolute inset-y-0 left-0 w-1 barber-pole" />
        <div className="pl-3">
          <h1 className="display text-3xl text-ink-900">{title}</h1>
          {subtitle && <p className="mt-1 text-sm text-ink-400">{subtitle}</p>}
          {nextParam && (
            <p className="mt-2 inline-flex items-center gap-1.5 rounded-md border border-brand-100 bg-brand-50 px-2.5 py-1 text-[11px] text-brand-700">
              <Icon name="lock" className="h-3 w-3" />
              You'll return to your booking after signing in.
            </p>
          )}
          <form onSubmit={onSubmit} className="mt-6 flex flex-col gap-4">
            {mode === "signup" && (
              <Field label="Full name">
                <input name="name" required className="input" autoComplete="name" />
              </Field>
            )}
            {mode === "signup" && role === "owner" && (
              <Field label="Business name">
                <input
                  name="businessName"
                  placeholder="e.g. Sharp Cuts Inc."
                  className="input"
                />
              </Field>
            )}
            <Field label="Email">
              <input name="email" type="email" required className="input" autoComplete="email" />
            </Field>
            {mode === "signup" && (
              <Field label="Phone (optional)">
                <input name="phone" className="input" autoComplete="tel" />
              </Field>
            )}
            <Field label="Password">
              <input
                name="password"
                type="password"
                required
                minLength={6}
                className="input"
                placeholder={mode === "signup" ? "min 6 characters" : ""}
                autoComplete={mode === "signup" ? "new-password" : "current-password"}
              />
            </Field>
            {error && (
              <div className="rounded-md border border-brand-100 bg-brand-50 px-3 py-2 text-sm text-brand-700">
                {error}
              </div>
            )}
            <button disabled={busy} type="submit" className="btn-primary mt-1 w-full py-3">
              {busy ? (
                "Please wait…"
              ) : (
                <>
                  {mode === "signup" ? "Create account" : "Sign in"}
                  <Icon name="arrow" className="h-4 w-4" />
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

function Field({ label, children }) {
  return (
    <div className="field-row">
      <label className="label">{label}</label>
      {children}
    </div>
  );
}
