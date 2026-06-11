import { Router } from "express";
import bcrypt from "bcryptjs";
import { one } from "../db.js";
import {
  signToken,
  setSessionCookie,
  clearSessionCookie,
  requireAuth,
} from "../middleware/auth.js";

const router = Router();

function badRequest(res, msg) {
  return res.status(400).json({ error: msg });
}

router.post("/signup", async (req, res) => {
  const { email, password, name, phone, role, businessName } = req.body || {};
  if (!email || !password || !name)
    return badRequest(res, "email, password and name required");
  if (password.length < 6) return badRequest(res, "password must be 6+ chars");
  const userRole = role === "owner" ? "owner" : "customer";

  const existing = await one("SELECT id FROM users WHERE email = $1", [
    email.toLowerCase(),
  ]);
  if (existing) return res.status(409).json({ error: "Email already in use" });

  const hash = await bcrypt.hash(password, 10);
  const user = await one(
    `INSERT INTO users (email, password_hash, role, name, phone)
     VALUES ($1, $2, $3, $4, $5)
     RETURNING id, email, name, role, phone`,
    [email.toLowerCase(), hash, userRole, name, phone || null]
  );

  if (userRole === "owner") {
    const biz = await one(
      "INSERT INTO businesses (owner_id, name) VALUES ($1, $2) RETURNING id",
      [user.id, businessName?.trim() || `${name}'s Business`]
    );
    await one(
      `INSERT INTO subscriptions (business_id, plan, status, monthly_amount)
       VALUES ($1, 'free', 'active', 0) RETURNING id`,
      [biz.id]
    );
  }

  setSessionCookie(res, signToken(user.id));
  res.json({ user });
});

router.post("/login", async (req, res) => {
  const { email, password } = req.body || {};
  if (!email || !password) return badRequest(res, "email and password required");
  const row = await one(
    "SELECT id, email, name, role, phone, password_hash FROM users WHERE email = $1",
    [email.toLowerCase()]
  );
  if (!row) return res.status(401).json({ error: "Invalid email or password" });
  const ok = await bcrypt.compare(password, row.password_hash);
  if (!ok) return res.status(401).json({ error: "Invalid email or password" });
  const { password_hash, ...user } = row;
  setSessionCookie(res, signToken(user.id));
  res.json({ user });
});

router.post("/logout", (req, res) => {
  clearSessionCookie(res);
  res.json({ ok: true });
});

router.get("/me", requireAuth(), (req, res) => {
  res.json({ user: req.user });
});

export default router;
