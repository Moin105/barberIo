import pg from "pg";
import "dotenv/config";

if (!process.env.DATABASE_URL) {
  console.error("FATAL: DATABASE_URL is not set. Copy .env.example to .env and fill it in.");
  process.exit(1);
}

export const pool = new pg.Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.DATABASE_URL.includes("localhost")
    ? false
    : { rejectUnauthorized: false },
  max: 5,
});

export async function q(text, params) {
  const res = await pool.query(text, params);
  return res;
}

export async function one(text, params) {
  const res = await pool.query(text, params);
  return res.rows[0] || null;
}

export async function many(text, params) {
  const res = await pool.query(text, params);
  return res.rows;
}
