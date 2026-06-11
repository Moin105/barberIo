import { Router } from "express";
import { many, one } from "../db.js";

const router = Router();

router.get("/shops", async (_req, res) => {
  const rows = await many(
    `SELECT sh.id, sh.name, sh.address, sh.seats, sh.open_hour, sh.close_hour,
            biz.name AS business_name,
            (SELECT COUNT(*)::int FROM barbers b WHERE b.shop_id = sh.id) AS barber_count
       FROM shops sh
       JOIN businesses biz ON biz.id = sh.business_id
      ORDER BY sh.name`
  );
  res.json({ shops: rows });
});

router.get("/shops/:id", async (req, res) => {
  const shop = await one(
    `SELECT sh.*, biz.name AS business_name
       FROM shops sh JOIN businesses biz ON biz.id = sh.business_id
      WHERE sh.id = $1`,
    [Number(req.params.id)]
  );
  if (!shop) return res.status(404).json({ error: "Not found" });
  const barbers = await many(
    `SELECT b.*,
            (SELECT AVG(stars)::float FROM ratings r WHERE r.barber_id = b.id) AS rating_avg,
            (SELECT COUNT(*)::int FROM ratings r WHERE r.barber_id = b.id) AS rating_count
       FROM barbers b WHERE b.shop_id = $1 ORDER BY b.name`,
    [shop.id]
  );
  res.json({ shop, barbers });
});

router.get("/barbers/:id", async (req, res) => {
  const id = Number(req.params.id);
  const barber = await one(
    `SELECT b.*, sh.id AS shop_id, sh.name AS shop_name, sh.address AS shop_address,
            sh.open_hour, sh.close_hour, sh.seats
       FROM barbers b
       JOIN shops sh ON sh.id = b.shop_id
      WHERE b.id = $1`,
    [id]
  );
  if (!barber) return res.status(404).json({ error: "Not found" });

  const services = await many(
    `SELECT s.id, s.name, s.duration_min,
            COALESCE(bs.price, s.base_price)::float AS price
       FROM services s
       LEFT JOIN barber_services bs ON bs.service_id = s.id AND bs.barber_id = $1
      WHERE s.business_id = (
        SELECT business_id FROM shops WHERE id = $2
      )
      ORDER BY s.name`,
    [id, barber.shop_id]
  );

  const rating = await one(
    `SELECT AVG(stars)::float AS avg, COUNT(*)::int AS count
       FROM ratings WHERE barber_id = $1`,
    [id]
  );

  const reviews = await many(
    `SELECT r.stars, r.comment, r.created_at, u.name AS customer_name
       FROM ratings r JOIN users u ON u.id = r.customer_id
      WHERE r.barber_id = $1
      ORDER BY r.created_at DESC LIMIT 10`,
    [id]
  );

  res.json({ barber, services, rating, reviews });
});

router.get("/barbers/:id/availability", async (req, res) => {
  const id = Number(req.params.id);
  const day = req.query.day || new Date().toISOString().slice(0, 10);
  const duration = Math.max(15, Number(req.query.duration) || 30);

  const barber = await one(
    `SELECT b.*, sh.open_hour, sh.close_hour, sh.seats
       FROM barbers b JOIN shops sh ON sh.id = b.shop_id WHERE b.id = $1`,
    [id]
  );
  if (!barber) return res.status(404).json({ error: "Not found" });

  const taken = await many(
    `SELECT start_at, end_at FROM bookings
      WHERE barber_id = $1 AND start_at::date = $2::date AND status != 'cancelled'`,
    [id, day]
  );

  const slots = [];
  const open = barber.open_hour;
  const close = barber.close_hour;
  const step = 30;
  const dayStart = new Date(`${day}T00:00:00`);
  for (let h = open * 60; h + duration <= close * 60; h += step) {
    const s = new Date(dayStart.getTime() + h * 60 * 1000);
    const e = new Date(s.getTime() + duration * 60 * 1000);
    const conflict = taken.some((b) => {
      const bs = new Date(b.start_at).getTime();
      const be = new Date(b.end_at).getTime();
      return s.getTime() < be && e.getTime() > bs;
    });
    slots.push({
      start: s.toISOString(),
      end: e.toISOString(),
      label: `${String(Math.floor(h / 60)).padStart(2, "0")}:${String(h % 60).padStart(2, "0")}`,
      available: !conflict,
    });
  }
  res.json({ day, duration, slots });
});

export default router;
