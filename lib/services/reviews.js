import { one, q } from "../db";
import { notify, notifyMany } from "./notifications";

export async function getBookingByToken(token) {
  if (!token) return null;
  return one(
    `SELECT bk.id, bk.customer_id, bk.barber_id, bk.service_id, bk.shop_id,
            bk.status, bk.start_at, bk.price,
            bk.review_token_expires_at, bk.review_consumed_at,
            b.name AS barber_name, b.photo_url, b.user_id AS barber_user_id,
            sh.name AS shop_name, biz.name AS business_name,
            biz.owner_id AS owner_id,
            s.name AS service_name,
            u.name AS customer_name
       FROM bookings bk
       JOIN barbers b ON b.id = bk.barber_id
       JOIN shops sh ON sh.id = bk.shop_id
       JOIN businesses biz ON biz.id = sh.business_id
       JOIN services s ON s.id = bk.service_id
       JOIN users u ON u.id = bk.customer_id
      WHERE bk.review_token = $1`,
    [token]
  );
}

export function tokenState(bk) {
  if (!bk) return "invalid";
  if (bk.status !== "completed") return "not_completed";
  if (bk.review_consumed_at) return "consumed";
  if (bk.review_token_expires_at && new Date(bk.review_token_expires_at) < new Date())
    return "expired";
  // If a rating already exists (e.g. created via the old /api/bookings/:id/rate
  // path), we still treat the token as consumed.
  return "ready";
}

export async function redeemReviewToken({ token, stars, comment }) {
  const bk = await getBookingByToken(token);
  const state = tokenState(bk);
  if (state === "invalid") return { error: "Invalid review link", status: 404 };
  if (state === "not_completed")
    return { error: "This visit isn't complete yet", status: 400 };
  if (state === "consumed")
    return { error: "A review has already been submitted for this visit", status: 409 };
  if (state === "expired")
    return { error: "This review link has expired", status: 410 };

  const s = Number(stars);
  if (!Number.isInteger(s) || s < 1 || s > 5)
    return { error: "stars must be between 1 and 5", status: 400 };

  // Guard against existing rating from the older path.
  const existing = await one("SELECT id FROM ratings WHERE booking_id = $1", [bk.id]);
  if (existing) {
    await q("UPDATE bookings SET review_consumed_at = NOW() WHERE id = $1", [bk.id]);
    return { error: "A review has already been submitted for this visit", status: 409 };
  }

  await q(
    `INSERT INTO ratings (booking_id, barber_id, customer_id, stars, comment)
     VALUES ($1,$2,$3,$4,$5)`,
    [bk.id, bk.barber_id, bk.customer_id, s, (comment || "").trim() || null]
  );
  await q(
    "UPDATE bookings SET review_consumed_at = NOW() WHERE id = $1",
    [bk.id]
  );

  await notifyMany([bk.barber_user_id, bk.owner_id], {
    kind: "rating_received",
    title: `${bk.customer_name} gave ${bk.barber_name} ${s}★`,
    body: comment ? `"${comment.slice(0, 100)}"` : null,
    href: `/owner/shops/${bk.shop_id}`,
  });
  await notify({
    userId: bk.customer_id,
    kind: "rating_thanks",
    title: "Thanks for the feedback",
    body: `It helps ${bk.barber_name} and the next customer at ${bk.business_name}.`,
    href: "/my-bookings",
  });

  return { ok: true };
}
