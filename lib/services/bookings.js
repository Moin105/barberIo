import { one, many, q } from "../db";

export async function createBooking(customerId, { barber_id, service_id, start_at }) {
  if (!barber_id || !service_id || !start_at)
    return { error: "barber_id, service_id, start_at required", status: 400 };

  const barber = await one(
    `SELECT b.*, sh.id AS shop_id, sh.business_id, sh.open_hour, sh.close_hour
       FROM barbers b JOIN shops sh ON sh.id = b.shop_id WHERE b.id = $1`,
    [Number(barber_id)]
  );
  if (!barber) return { error: "Barber not found", status: 404 };

  const svc = await one(
    "SELECT * FROM services WHERE id = $1 AND business_id = $2",
    [Number(service_id), barber.business_id]
  );
  if (!svc) return { error: "Service not on this barber's menu", status: 404 };

  const overridePrice = await one(
    "SELECT price FROM barber_services WHERE barber_id = $1 AND service_id = $2",
    [barber.id, svc.id]
  );
  const price = Number(overridePrice?.price ?? svc.base_price);

  const start = new Date(start_at);
  if (isNaN(start.getTime())) return { error: "invalid start_at", status: 400 };
  const end = new Date(start.getTime() + svc.duration_min * 60 * 1000);

  const conflict = await one(
    `SELECT 1 FROM bookings
      WHERE barber_id = $1 AND status != 'cancelled'
        AND start_at < $3 AND end_at > $2`,
    [barber.id, start.toISOString(), end.toISOString()]
  );
  if (conflict) return { error: "Slot no longer available", status: 409 };

  const booking = await one(
    `INSERT INTO bookings
       (customer_id, shop_id, barber_id, service_id, start_at, end_at, price, status)
     VALUES ($1, $2, $3, $4, $5, $6, $7, 'booked') RETURNING *`,
    [customerId, barber.shop_id, barber.id, svc.id, start.toISOString(), end.toISOString(), price]
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
    "SELECT * FROM bookings WHERE id = $1 AND customer_id = $2",
    [bookingId, customerId]
  );
  if (!bk) return { error: "Not found", status: 404 };
  if (bk.status !== "booked")
    return { error: "Only booked appointments can be cancelled", status: 400 };
  await q("UPDATE bookings SET status = 'cancelled' WHERE id = $1", [bookingId]);
  return { ok: true };
}

export async function rateBooking(customerId, bookingId, { stars, comment }) {
  const s = Number(stars);
  if (!Number.isInteger(s) || s < 1 || s > 5)
    return { error: "stars must be 1-5", status: 400 };
  const bk = await one(
    "SELECT * FROM bookings WHERE id = $1 AND customer_id = $2",
    [bookingId, customerId]
  );
  if (!bk) return { error: "Not found", status: 404 };
  if (bk.status !== "completed")
    return { error: "Only completed bookings can be rated", status: 400 };
  const existing = await one("SELECT id FROM ratings WHERE booking_id = $1", [
    bookingId,
  ]);
  if (existing) return { error: "Already rated", status: 409 };
  await q(
    `INSERT INTO ratings (booking_id, barber_id, customer_id, stars, comment)
     VALUES ($1, $2, $3, $4, $5)`,
    [bookingId, bk.barber_id, customerId, s, comment || null]
  );
  return { ok: true };
}
