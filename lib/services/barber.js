import { one, many } from "../db";
import { onBookingCompleted } from "./lifecycle";

export async function getBarberRecordByUser(userId) {
  return one(
    `SELECT b.*, sh.name AS shop_name, sh.address AS shop_address,
            sh.seats AS shop_seats, sh.open_hour, sh.close_hour,
            biz.name AS business_name
       FROM barbers b
       JOIN shops sh ON sh.id = b.shop_id
       JOIN businesses biz ON biz.id = sh.business_id
      WHERE b.user_id = $1`,
    [userId]
  );
}

export async function barberSchedule(userId, day) {
  const barber = await getBarberRecordByUser(userId);
  if (!barber) return { error: "No barber profile linked to this account", status: 404 };
  const bookings = await many(
    `SELECT bk.*, u.name AS customer_name, u.phone AS customer_phone,
            s.name AS service_name, s.duration_min,
            (SELECT id FROM invoices WHERE booking_id = bk.id) AS invoice_id
       FROM bookings bk
       JOIN users u ON u.id = bk.customer_id
       JOIN services s ON s.id = bk.service_id
      WHERE bk.barber_id = $1 AND bk.start_at::date = $2::date
      ORDER BY bk.start_at`,
    [barber.id, day]
  );
  const summary = bookings.reduce(
    (a, b) => {
      a.total += Number(b.price);
      if (b.status === "completed") {
        a.earned += Number(b.price);
        a.done += 1;
      } else if (b.status === "booked") {
        a.upcoming += 1;
      }
      return a;
    },
    { total: 0, earned: 0, done: 0, upcoming: 0 }
  );
  return { barber, day, bookings, summary };
}

export async function barberStats(userId) {
  const barber = await getBarberRecordByUser(userId);
  if (!barber) return { error: "No barber profile", status: 404 };
  const today = new Date().toISOString().slice(0, 10);
  const todayTotals = await one(
    `SELECT COALESCE(SUM(CASE WHEN status='completed' THEN price END),0)::float AS earned,
            COALESCE(SUM(CASE WHEN status='booked' THEN price END),0)::float AS pending
       FROM bookings WHERE barber_id = $1 AND start_at::date = $2::date`,
    [barber.id, today]
  );
  const weekTotals = await one(
    `SELECT COALESCE(SUM(CASE WHEN status='completed' THEN price END),0)::float AS earned
       FROM bookings
      WHERE barber_id = $1
        AND start_at >= NOW() - INTERVAL '7 days'`,
    [barber.id]
  );
  const rating = await one(
    `SELECT COALESCE(AVG(stars),0)::float AS avg, COUNT(*)::int AS count
       FROM ratings WHERE barber_id = $1`,
    [barber.id]
  );
  return { barber, today: todayTotals, week: weekTotals, rating };
}

export async function barberUpdateBookingStatus(userId, bookingId, status) {
  if (!["booked", "completed", "cancelled"].includes(status))
    return { error: "invalid status", status: 400 };
  const barber = await getBarberRecordByUser(userId);
  if (!barber) return { error: "No barber profile", status: 404 };
  const bk = await one(
    "SELECT * FROM bookings WHERE id = $1 AND barber_id = $2",
    [bookingId, barber.id]
  );
  if (!bk) return { error: "Booking not found", status: 404 };
  const updated = await one(
    "UPDATE bookings SET status = $1 WHERE id = $2 RETURNING *",
    [status, bookingId]
  );
  if (status === "completed") await onBookingCompleted(bookingId);
  return { booking: updated };
}
