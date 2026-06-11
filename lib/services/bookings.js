import { one, many, q } from "../db";
import { notify, notifyMany } from "./notifications";

function fmtTime(iso) {
  const d = new Date(iso);
  return d.toLocaleString([], {
    weekday: "short",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export async function createBooking(customerId, { barber_id, service_id, start_at }) {
  if (!barber_id || !service_id || !start_at)
    return { error: "barber_id, service_id, start_at required", status: 400 };

  const barber = await one(
    `SELECT b.*, sh.id AS shop_id, sh.business_id, sh.open_hour, sh.close_hour,
            biz.owner_id AS owner_id
       FROM barbers b
       JOIN shops sh ON sh.id = b.shop_id
       JOIN businesses biz ON biz.id = sh.business_id
      WHERE b.id = $1`,
    [Number(barber_id)]
  );
  if (!barber) return { error: "Barber not found", status: 404 };

  const svc = await one(
    "SELECT * FROM services WHERE id = $1 AND business_id = $2",
    [Number(service_id), barber.business_id]
  );
  if (!svc) return { error: "Service not on this barber's menu", status: 404 };

  const customer = await one(
    "SELECT name, email FROM users WHERE id = $1",
    [customerId]
  );

  const overridePrice = await one(
    "SELECT price FROM barber_services WHERE barber_id = $1 AND service_id = $2",
    [barber.id, svc.id]
  );
  const price = Number(overridePrice?.price ?? svc.base_price);

  const start = new Date(start_at);
  if (isNaN(start.getTime())) return { error: "invalid start_at", status: 400 };
  const end = new Date(start.getTime() + svc.duration_min * 60 * 1000);

  // Pending bookings still take the slot, so a conflict check now ignores only
  // cancelled and declined.
  const conflict = await one(
    `SELECT 1 FROM bookings
      WHERE barber_id = $1 AND status NOT IN ('cancelled','declined')
        AND start_at < $3 AND end_at > $2`,
    [barber.id, start.toISOString(), end.toISOString()]
  );
  if (conflict) return { error: "Slot no longer available", status: 409 };

  const booking = await one(
    `INSERT INTO bookings
       (customer_id, shop_id, barber_id, service_id, start_at, end_at, price, status)
     VALUES ($1, $2, $3, $4, $5, $6, $7, 'pending') RETURNING *`,
    [customerId, barber.shop_id, barber.id, svc.id, start.toISOString(), end.toISOString(), price]
  );

  // Notify the shop owner (and the barber, if they have a login) that a
  // booking is awaiting their review.
  const whenLabel = fmtTime(start);
  await notifyMany(
    [barber.owner_id, barber.user_id],
    {
      kind: "booking_requested",
      title: `New booking from ${customer?.name || "a customer"}`,
      body: `${svc.name} with ${barber.name} · ${whenLabel}`,
      href: `/owner/shops/${barber.shop_id}`,
    }
  );

  return { booking };
}

export async function myBookings(customerId) {
  return many(
    `SELECT bk.*, b.name AS barber_name, b.photo_url, b.seat_number,
            sh.name AS shop_name, s.name AS service_name,
            (SELECT id FROM ratings WHERE booking_id = bk.id) AS rating_id
       FROM bookings bk
       JOIN barbers b ON b.id = bk.barber_id
       JOIN shops sh ON sh.id = bk.shop_id
       JOIN services s ON s.id = bk.service_id
      WHERE bk.customer_id = $1
      ORDER BY bk.start_at DESC`,
    [customerId]
  );
}

export async function cancelBooking(customerId, bookingId) {
  const bk = await one(
    `SELECT bk.*, b.user_id AS barber_user_id, biz.owner_id AS owner_id, u.name AS customer_name
       FROM bookings bk
       JOIN barbers b ON b.id = bk.barber_id
       JOIN shops sh ON sh.id = bk.shop_id
       JOIN businesses biz ON biz.id = sh.business_id
       JOIN users u ON u.id = bk.customer_id
      WHERE bk.id = $1 AND bk.customer_id = $2`,
    [bookingId, customerId]
  );
  if (!bk) return { error: "Not found", status: 404 };
  if (!["pending", "booked"].includes(bk.status))
    return { error: "Only pending or confirmed appointments can be cancelled", status: 400 };
  await q("UPDATE bookings SET status = 'cancelled' WHERE id = $1", [bookingId]);

  await notifyMany([bk.owner_id, bk.barber_user_id], {
    kind: "booking_cancelled",
    title: `${bk.customer_name} cancelled their booking`,
    body: fmtTime(bk.start_at),
    href: `/owner/shops/${bk.shop_id}`,
  });

  return { ok: true };
}

export async function rateBooking(customerId, bookingId, { stars, comment }) {
  const s = Number(stars);
  if (!Number.isInteger(s) || s < 1 || s > 5)
    return { error: "stars must be 1-5", status: 400 };
  const bk = await one(
    `SELECT bk.*, b.user_id AS barber_user_id, biz.owner_id AS owner_id,
            b.name AS barber_name, u.name AS customer_name
       FROM bookings bk
       JOIN barbers b ON b.id = bk.barber_id
       JOIN shops sh ON sh.id = bk.shop_id
       JOIN businesses biz ON biz.id = sh.business_id
       JOIN users u ON u.id = bk.customer_id
      WHERE bk.id = $1 AND bk.customer_id = $2`,
    [bookingId, customerId]
  );
  if (!bk) return { error: "Not found", status: 404 };
  if (bk.status !== "completed")
    return { error: "Only completed bookings can be rated", status: 400 };
  const existing = await one("SELECT id FROM ratings WHERE booking_id = $1", [bookingId]);
  if (existing) return { error: "Already rated", status: 409 };
  await q(
    `INSERT INTO ratings (booking_id, barber_id, customer_id, stars, comment)
     VALUES ($1, $2, $3, $4, $5)`,
    [bookingId, bk.barber_id, customerId, s, comment || null]
  );

  await notifyMany([bk.barber_user_id, bk.owner_id], {
    kind: "rating_received",
    title: `${bk.customer_name} gave ${bk.barber_name} ${s}★`,
    body: comment ? `"${comment.slice(0, 100)}"` : null,
    href: `/owner/shops/${bk.shop_id}`,
  });

  return { ok: true };
}
