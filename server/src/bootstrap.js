import bcrypt from "bcryptjs";
import { one } from "./db.js";

export async function ensureSuperAdmin() {
  const email = (process.env.SUPER_ADMIN_EMAIL || "admin@clipper.local").toLowerCase();
  const password = process.env.SUPER_ADMIN_PASSWORD || "ChangeMe123!";
  const name = process.env.SUPER_ADMIN_NAME || "Super Admin";

  const existing = await one("SELECT id, role FROM users WHERE email = $1", [email]);
  if (existing) {
    if (existing.role !== "super_admin") {
      await one(
        "UPDATE users SET role = 'super_admin' WHERE id = $1 RETURNING id",
        [existing.id]
      );
      console.log(`[bootstrap] promoted ${email} to super_admin`);
    }
    return;
  }

  const hash = await bcrypt.hash(password, 10);
  await one(
    "INSERT INTO users (email, password_hash, role, name) VALUES ($1,$2,'super_admin',$3) RETURNING id",
    [email, hash, name]
  );
  console.log(`[bootstrap] created super admin -> ${email}`);
  if (!process.env.SUPER_ADMIN_PASSWORD) {
    console.warn(
      "[bootstrap] WARNING: using default password 'ChangeMe123!'. " +
        "Set SUPER_ADMIN_PASSWORD in .env."
    );
  }
}
