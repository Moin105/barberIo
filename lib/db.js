import pg from "pg";
import bcrypt from "bcryptjs";
import { SCHEMA_SQL } from "./schema";

let _pool = null;
let _initPromise = null;

function makePool() {
  if (!process.env.DATABASE_URL) {
    throw new Error(
      "DATABASE_URL is not set. Add it to .env.local locally and to the Vercel project's environment variables."
    );
  }
  return new pg.Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: process.env.DATABASE_URL.includes("localhost")
      ? false
      : { rejectUnauthorized: false },
    max: 3,
    idleTimeoutMillis: 10_000,
  });
}

function pool() {
  if (!_pool) _pool = makePool();
  return _pool;
}

async function bootstrap() {
  const p = pool();
  await p.query(SCHEMA_SQL);

  const email = (process.env.SUPER_ADMIN_EMAIL || "admin@clipper.local").toLowerCase();
  const password = process.env.SUPER_ADMIN_PASSWORD || "ChangeMe123!";
  const name = process.env.SUPER_ADMIN_NAME || "Super Admin";

  const existing = await p.query(
    "SELECT id, role FROM users WHERE email = $1",
    [email]
  );
  if (existing.rows.length === 0) {
    const hash = await bcrypt.hash(password, 10);
    await p.query(
      "INSERT INTO users (email, password_hash, role, name) VALUES ($1, $2, 'super_admin', $3)",
      [email, hash, name]
    );
    console.log(`[bootstrap] created super admin -> ${email}`);
  } else if (existing.rows[0].role !== "super_admin") {
    await p.query("UPDATE users SET role = 'super_admin' WHERE id = $1", [
      existing.rows[0].id,
    ]);
    console.log(`[bootstrap] promoted ${email} to super_admin`);
  }
}

function ready() {
  if (!_initPromise) {
    _initPromise = bootstrap().catch((e) => {
      _initPromise = null;
      throw e;
    });
  }
  return _initPromise;
}

export async function q(text, params) {
  await ready();
  return pool().query(text, params);
}

export async function one(text, params) {
  const res = await q(text, params);
  return res.rows[0] || null;
}

export async function many(text, params) {
  const res = await q(text, params);
  return res.rows;
}
