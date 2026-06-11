import { cookies } from "next/headers";
import { SignJWT, jwtVerify } from "jose";
import bcrypt from "bcryptjs";
import { one } from "./db";

const COOKIE = "barber_session";
const MAX_AGE = 60 * 60 * 24 * 14;

function secret() {
  const s = process.env.JWT_SECRET || process.env.SESSION_SECRET;
  if (!s || s.length < 16)
    throw new Error("JWT_SECRET must be set (32+ random chars).");
  return new TextEncoder().encode(s);
}

export async function hashPassword(pw) {
  return bcrypt.hash(pw, 10);
}
export async function verifyPassword(pw, hash) {
  return bcrypt.compare(pw, hash);
}

export async function createSession(userId) {
  const jwt = await new SignJWT({ uid: userId })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(`${MAX_AGE}s`)
    .sign(secret());
  cookies().set(COOKIE, jwt, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: MAX_AGE,
  });
}

export function destroySession() {
  cookies().delete(COOKIE);
}

export async function getCurrentUser() {
  const token = cookies().get(COOKIE)?.value;
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, secret());
    const user = await one(
      "SELECT id, email, name, role, phone FROM users WHERE id = $1",
      [payload.uid]
    );
    return user || null;
  } catch {
    return null;
  }
}

export async function requireUser(role) {
  const user = await getCurrentUser();
  if (!user) return { error: "Sign in required", status: 401 };
  if (role) {
    const roles = Array.isArray(role) ? role : [role];
    if (!roles.includes(user.role))
      return { error: `Must be ${roles.join(" or ")}`, status: 403 };
  }
  return { user };
}
