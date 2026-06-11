import { NextResponse } from "next/server";
import { api } from "@/lib/api";

export async function GET(req) {
  const upstream = await api("/auth/logout", { method: "POST" });
  const res = NextResponse.redirect(new URL("/", req.url));
  const setCookie = upstream.headers.get("set-cookie");
  if (setCookie) res.headers.set("set-cookie", setCookie);
  return res;
}

export const dynamic = "force-dynamic";
