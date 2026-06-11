import { Router } from "express";
import { many, one, q } from "../db.js";
import { requireAuth } from "../middleware/auth.js";

const router = Router();
router.use(requireAuth("customer"));

router.post("/", async (req, res) => {
  const { barber_id, service_id, start_at } = req.body || {};
  if (!barber_id || !service_id || !start_at)
    return res.status(400).json({ error: "barber_id, service_id, start_at required" });

  const barber = await one(
    `SELECT b.*, sh.id AS shop_id, sh.business_id, sh.open_hour, sh.close_hour
       FROM barbers b JOIN shops sh ON sh.id = b.shop_id WHERE b.id = $1`,
    [Number(barber_id)]
  );
  if (!barber) return res.status(404).json({ error: "Barber not found" });

  const svc = await one(
    "SELECT * FROM services WHERE id = $1 AND business_id = $2",
    [Number(service_id), barber.business_id]
  );
  if (!svc) return res.status(404).json({ error: "Service not on this barber's menu" });

  const overridePrice = await one(
    "SELECT price FROM barber_services WHERE barber_id = $1 AND service_id = $2",
    [barber.id, svc.id]
  );
  const price = Number(overridePrice?.price ?? svc.base_price);

  const start = new Date(start_at);
  if (isNaN(start.getTime())) return res.status(400).json({ error: "invalid start_at" });
  const end = new Date(start.getTime() + svc.duration_min * 60 * 1000);

  const conflict = await one(
    `SELECT 1 FROM bookings
      WHERE barber_id = $1 AND status != 'cancelled'
        AND start_at < $3 AND end_at > $2`,
    [barber.id, start.toISOString(), end.toISOString()]
  );
  if (conflict) return res.status(409).json({ error: "Slot no longer available" });

  const booking = await one(
    `INSERT INTO bookings
       (customer_id, shop_id, barber_id, service_id, start_at, end_at, price, status)
     VALUES ($1, $2, $3, $4, $5, $6, $7, 'booked')
     RETURNING *`,
    [req.user.id, barber.shop_id, barber.id, svc.id, start.toISOString(), end.toISOString(), price]
  );

  res.json({ booking });
});

router.get("/mine", async (req, res) => {
  const rows = await many(
    `SELECT bk.*, b.name AS barber_name, b.photo_url, sh.name AS shop_name,
            s.name AS service_name,
            (SELECT id FROM ratings WHERE booking_id = bk.id) AS rating_id
       FROM bookings bk
       JOIN barbers b ON b.id = bk.barber_id
       JOIN shops sh ON sh.id = bk.shop_id
       JOIN services s ON s.id = bk.service_id
      WHERE bk.customer_id = $1
      ORDER BY bk.start_at DESC`,
    [req.user.id]
  );
  res.json({ bookings: rows });
});

router.post("/:id/cancel", async (req, res) => {
  const id = Number(req.params.id);
  const bk = await one(
    "SELECT * FROM bookings WHERE id = $1 AND customer_id = $2",
    [id, req.user.id]
  );
  if (!bk) return res.status(404).json({ error: "Not found" });
  if (bk.status !== "booked")
    return res.status(400).json({ error: "Only booked appointments can be cancelled" });
  await q("UPDATE bookings SET status = 'cancelled' WHERE id = $1", [id]);
  res.json({ ok: true });
});

router.post("/:id/rate", async (req, res) => {
  const id = Number(req.params.id);
  const { stars, comment } = req.body || {};
  const s = Number(stars);
  if (!Number.isInteger(s) || s < 1 || s > 5)
    return res.status(400).json({ error: "stars must be 1-5" });

  const bk = await one(
    "SELECT * FROM bookings WHERE id = $1 AND customer_id = $2",
    [id, req.user.id]
  );
  if (!bk) return res.status(404).json({ error: "Not found" });
  if (bk.status !== "completed")
    return res.status(400).json({ error: "Only completed bookings can be rated" });

  const existing = await one(
    "SELECT id FROM ratings WHERE booking_id = $1",
    [id]
  );
  if (existing) return res.status(409).json({ error: "Already rated" });

  await q(
    `INSERT INTO ratings (booking_id, barber_id, customer_id, stars, comment)
     VALUES ($1, $2, $3, $4, $5)`,
    [id, bk.barber_id, req.user.id, s, comment || null]
  );
  res.json({ ok: true });
});

export default router;
