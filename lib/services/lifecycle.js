// Shared completion-side effects: when a booking moves to status='completed'
// (from either the owner or the barber endpoint), issue a one-time review
// token and create an invoice. Both are idempotent — calling them twice for
// the same booking is a no-op.

import crypto from "node:crypto";
import { one, q } from "../db";

export const REVIEW_TOKEN_TTL_HOURS = 24;

export async function ensureReviewToken(bookingId) {
  const existing = await one(
    "SELECT review_token, review_token_expires_at FROM bookings WHERE id = $1",
    [bookingId]
  );
  if (existing?.review_token) return existing.review_token;

  const token = crypto.randomBytes(16).toString("hex"); // 32 hex chars
  await q(
    `UPDATE bookings
        SET review_token = $1,
            review_token_expires_at = NOW() + ($2 || ' hours')::interval
      WHERE id = $3`,
    [token, String(REVIEW_TOKEN_TTL_HOURS), bookingId]
  );
  return token;
}

export async function ensureInvoice(bookingId) {
  const existing = await one(
    "SELECT * FROM invoices WHERE booking_id = $1",
    [bookingId]
  );
  if (existing) return existing;

  const bk = await one(
    `SELECT bk.*, biz.id AS business_id, biz.tax_rate, biz.tax_label
       FROM bookings bk
       JOIN shops sh ON sh.id = bk.shop_id
       JOIN businesses biz ON biz.id = sh.business_id
      WHERE bk.id = $1`,
    [bookingId]
  );
  if (!bk) return null;

  const taxRate = Number(bk.tax_rate || 0);
  const subtotal = Number(bk.price);
  const taxAmount = Math.round(subtotal * (taxRate / 100) * 100) / 100;
  const total = Math.round((subtotal + taxAmount) * 100) / 100;

  // Sequential per business — small race possible, but harmless for phase-1.
  const count = await one(
    "SELECT COUNT(*)::int AS n FROM invoices WHERE business_id = $1",
    [bk.business_id]
  );
  const seq = (count?.n || 0) + 1;
  const invoice_number = `INV-${bk.business_id}-${String(seq).padStart(5, "0")}`;

  return one(
    `INSERT INTO invoices
       (business_id, booking_id, customer_id, barber_id, invoice_number,
        subtotal, tax_rate, tax_label, tax_amount, total)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10) RETURNING *`,
    [
      bk.business_id,
      bookingId,
      bk.customer_id,
      bk.barber_id,
      invoice_number,
      subtotal,
      taxRate,
      bk.tax_label || "Tax",
      taxAmount,
      total,
    ]
  );
}

export async function onBookingCompleted(bookingId) {
  await ensureReviewToken(bookingId);
  await ensureInvoice(bookingId);
}
