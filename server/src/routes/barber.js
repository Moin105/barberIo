import { Router } from "express";
import { many, one, q } from "../db.js";
import { requireAuth } from "../middleware/auth.js";

const router = Router();
router.use(requireAuth("barber"));

async function getBarberRecord(userId) {
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

router.get("/me", async (req, res) => {
  const barber = await getBarberRecord(req.user.id);
  if (!barber)
    return res.status(404).json({ error: "No barber profile linked to this account" });
  res.json({ barber });
});

router.get("/schedule", async (req, res) => {
  const barber = await getBarberRecord(req.user.id);
  if (!barber) return res.status(404).json({ error: "No barber profile" });
  const day = req.query.day || new Date().toISOString().slice(0, 10);

  const bookings = await many(
    `SELECT bk.*, u.name AS customer_name, u.phone AS customer_phone,
            s.name AS service_name, s.duration_min
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

  res.json({ barber, day, bookings, summary });
});

router.get("/upcoming", async (req, res) => {
  const barber = await getBarberRecord(req.user.id);
  if (!barber) return res.status(404).json({ error: "No barber profile" });
  const rows = await many(
    `SELECT bk.*, u.name AS customer_name, u.phone AS customer_phone,
            s.name AS service_name
       FROM bookings bk
       JOIN users u ON u.id = bk.customer_id
       JOIN services s ON s.id = bk.service_id
      WHERE bk.barber_id = $1 AND bk.start_at >= NOW() AND bk.status = 'booked'
      ORDER BY bk.start_at LIMIT 30`,
    [barber.id]
  );
  res.json({ bookings: rows });
});

router.patch("/bookings/:id", async (req, res) => {
  const barber = await getBarberRecord(req.user.id);
  if (!barber) return res.status(404).json({ error: "No barber profile" });
  const id = Number(req.params.id);
  const bk = await one(
    "SELECT * FROM bookings WHERE id = $1 AND barber_id = $2",
    [id, barber.id]
  );
  if (!bk) return res.status(404).json({ error: "Booking not found" });
  const { status } = req.body || {};
  if (!["booked", "completed", "cancelled"].includes(status))
    return res.status(400).json({ error: "invalid status" });
  const updated = await one(
    "UPDATE bookings SET status = $1 WHERE id = $2 RETURNING *",
    [status, id]
  );
  res.json({ booking: updated });
});

router.get("/stats", async (req, res) => {
  const barber = await getBarberRecord(req.user.id);
  if (!barber) return res.status(404).json({ error: "No barber profile" });
  const today = new Date().toISOString().slice(0, 10);

  const totalsToday = await one(
    `SELECT COALESCE(SUM(CASE WHEN status='completed' THEN price END),0)::float AS earned,
            COALESCE(SUM(CASE WHEN status='booked' THEN price END),0)::float AS pending
       FROM bookings WHERE barber_id = $1 AND start_at::date = $2::date`,
    [barber.id, today]
  );
  const totalsWeek = await one(
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
  res.json({ barber, today: totalsToday, week: totalsWeek, rating });
});

export default router;
