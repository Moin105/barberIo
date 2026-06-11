import { NextResponse } from "next/server";
import { destroySession } from "@/lib/auth";

export async function GET(req) {
  destroySession();
  return NextResponse.redirect(new URL("/", req.url));
}

export const dynamic = "force-dynamic";
