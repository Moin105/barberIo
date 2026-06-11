import { one } from "../db";
import { hashPassword, verifyPassword } from "../auth";

export async function signupUser({ email, password, name, phone, role, businessName }) {
  if (!email || !password || !name)
    return { error: "email, password and name required", status: 400 };
  if (password.length < 6)
    return { error: "password must be 6+ chars", status: 400 };
  const userRole = role === "owner" ? "owner" : "customer";

  const existing = await one("SELECT id FROM users WHERE email = $1", [
    email.toLowerCase(),
  ]);
  if (existing) return { error: "Email already in use", status: 409 };

  const hash = await hashPassword(password);
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

  return { user };
}

export async function loginUser({ email, password }) {
  if (!email || !password)
    return { error: "email and password required", status: 400 };
  const row = await one(
    "SELECT id, email, name, role, phone, password_hash FROM users WHERE email = $1",
    [email.toLowerCase()]
  );
  if (!row) return { error: "Invalid email or password", status: 401 };
  const ok = await verifyPassword(password, row.password_hash);
  if (!ok) return { error: "Invalid email or password", status: 401 };
  const { password_hash, ...user } = row;
  return { user };
}
