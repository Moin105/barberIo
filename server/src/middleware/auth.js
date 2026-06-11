import jwt from "jsonwebtoken";
import { one } from "../db.js";

const COOKIE = "barber_session";
const SECRET = () => {
  const s = process.env.JWT_SECRET;
  if (!s || s.length < 16) throw new Error("JWT_SECRET missing or too short");
  return s;
};

export function signToken(userId) {
  return jwt.sign({ uid: userId }, SECRET(), { expiresIn: "14d" });
}

export function setSessionCookie(res, token) {
  const prod = process.env.NODE_ENV === "production";
  res.cookie(COOKIE, token, {
    httpOnly: true,
    sameSite: prod ? "none" : "lax",
    secure: prod,
    path: "/",
    maxAge: 14 * 24 * 60 * 60 * 1000,
  });
}

export function clearSessionCookie(res) {
  const prod = process.env.NODE_ENV === "production";
  res.clearCookie(COOKIE, {
    httpOnly: true,
    sameSite: prod ? "none" : "lax",
    secure: prod,
    path: "/",
  });
}

async function userFromReq(req) {
  const token = req.cookies?.[COOKIE];
  if (!token) return null;
  let payload;
  try {
    payload = jwt.verify(token, SECRET());
  } catch {
    return null;
  }
  const user = await one(
    "SELECT id, email, name, role, phone FROM users WHERE id = $1",
    [payload.uid]
  );
  return user;
}

export function attachUser() {
  return async (req, _res, next) => {
    req.user = await userFromReq(req);
    next();
  };
}

export function requireAuth(role) {
  return (req, res, next) => {
    if (!req.user) return res.status(401).json({ error: "Sign in required" });
    if (role && req.user.role !== role)
      return res.status(403).json({ error: `Must be ${role}` });
    next();
  };
}
