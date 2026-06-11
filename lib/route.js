import { NextResponse } from "next/server";
import { requireUser } from "./auth";

export const dynamic = "force-dynamic";

export function json(data, init = {}) {
  return NextResponse.json(data, init);
}

export function err(message, status = 400) {
  return NextResponse.json({ error: message }, { status });
}

export function withAuth(role, handler) {
  return async (req, ctx) => {
    const r = await requireUser(role);
    if (r.error) return err(r.error, r.status);
    try {
      return await handler(req, { ...ctx, user: r.user });
    } catch (e) {
      console.error("[route]", e);
      return err(e.message || "Internal error", 500);
    }
  };
}

export function withTry(handler) {
  return async (req, ctx) => {
    try {
      return await handler(req, ctx);
    } catch (e) {
      console.error("[route]", e);
      return err(e.message || "Internal error", 500);
    }
  };
}

export async function bodyOf(req) {
  try {
    return await req.json();
  } catch {
    return {};
  }
}
