import { NextResponse } from "next/server";

const COOKIE = "barber_session";

function logoutResponse(req) {
  // Use 303 So a form POST becomes a GET on the home page redirect.
  const res = NextResponse.redirect(new URL("/", req.url), { status: 303 });
  // Attach the cookie deletion directly to *this* response so it always lands
  // on the browser even though we are returning a manual redirect.
  res.cookies.set(COOKIE, "", {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 0,
  });
  return res;
}

export async function GET(req) {
  return logoutResponse(req);
}
export async function POST(req) {
  return logoutResponse(req);
}

export const dynamic = "force-dynamic";
