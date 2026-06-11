import { Router } from "express";
import bcrypt from "bcryptjs";
import { one, many, q } from "../db.js";
import { requireAuth } from "../middleware/auth.js";

const router = Router();
router.use(requireAuth("owner"));

async function getBiz(ownerId) {
  let biz = await one("SELECT * FROM businesses WHERE owner_id = $1", [ownerId]);
  if (!biz) {
    biz = await one(
      "INSERT INTO businesses (owner_id, name) VALUES ($1, $2) RETURNING *",
      [ownerId, "My Barber Business"]
    );
    await one(
      `INSERT INTO subscriptions (business_id, plan, status, monthly_amount)
       VALUES ($1, 'free', 'active', 0)
       ON CONFLICT (business_id) DO NOTHING RETURNING id`,
      [biz.id]
    );
  }
  return biz;
}

async function assertShopOwned(shopId, ownerId) {
  return one(
    `SELECT sh.* FROM shops sh
       JOIN businesses biz ON biz.id = sh.business_id
      WHERE sh.id = $1 AND biz.owner_id = $2`,
    [shopId, ownerId]
  );
}

async function assertBarberOwned(barberId, ownerId) {
  return one(
    `SELECT b.* FROM barbers b
       JOIN shops sh ON sh.id = b.shop_id
       JOIN businesses biz ON biz.id = sh.business_id
      WHERE b.id = $1 AND biz.owner_id = $2`,
    [barberId, ownerId]
  );
}

async function assertServiceOwned(serviceId, ownerId) {
  return one(
    `SELECT s.* FROM services s
       JOIN businesses biz ON biz.id = s.business_id
      WHERE s.id = $1 AND biz.owner_id = $2`,
    [serviceId, ownerId]
  );
}

router.get("/me", async (req, res) => {
  const biz = await getBiz(req.user.id);
  const subscription = await one(
    "SELECT * FROM subscriptions WHERE business_id = $1",
    [biz.id]
  );
  res.json({ business: biz, subscription });
});

router.put("/business", async (req, res) => {
  const { name } = req.body || {};
  if (!name) return res.status(400).json({ error: "name required" });
  const biz = await getBiz(req.user.id);
  const updated = await one(
    "UPDATE businesses SET name = $1 WHERE id = $2 RETURNING *",
    [name, biz.id]
  );
  res.json({ business: updated });
});

router.get("/shops", async (req, res) => {
  const biz = await getBiz(req.user.id);
  const rows = await many(
    `SELECT sh.*,
            (SELECT COUNT(*)::int FROM barbers b WHERE b.shop_id = sh.id) AS barber_count
       FROM shops sh
      WHERE sh.business_id = $1
      ORDER BY sh.created_at`,
    [biz.id]
  );
  res.json({ shops: rows });
});

router.post("/shops", async (req, res) => {
  const { name, address, seats, open_hour, close_hour } = req.body || {};
  if (!name) return res.status(400).json({ error: "name required" });
  const biz = await getBiz(req.user.id);
  const shop = await one(
    `INSERT INTO shops (business_id, name, address, seats, open_hour, close_hour)
     VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
    [
      biz.id,
      name,
      address || null,
      Number(seats) || 1,
      Number(open_hour) || 9,
      Number(close_hour) || 20,
    ]
  );
  res.json({ shop });
});

router.get("/shops/:id", async (req, res) => {
  const shop = await assertShopOwned(Number(req.params.id), req.user.id);
  if (!shop) return res.status(404).json({ error: "Shop not found" });
  const barbers = await many(
    `SELECT b.*, u.email AS login_email
       FROM barbers b
       LEFT JOIN users u ON u.id = b.user_id
      WHERE b.shop_id = $1
      ORDER BY b.seat_number, b.created_at`,
    [shop.id]
  );
  res.json({ shop, barbers });
});

router.put("/shops/:id", async (req, res) => {
  const shop = await assertShopOwned(Number(req.params.id), req.user.id);
  if (!shop) return res.status(404).json({ error: "Shop not found" });
  const { name, address, seats, open_hour, close_hour } = req.body || {};
  const updated = await one(
    `UPDATE shops
        SET name = COALESCE($1, name),
            address = COALESCE($2, address),
            seats = COALESCE($3, seats),
            open_hour = COALESCE($4, open_hour),
            close_hour = COALESCE($5, close_hour)
      WHERE id = $6 RETURNING *`,
    [
      name,
      address,
      seats != null ? Number(seats) : null,
      open_hour != null ? Number(open_hour) : null,
      close_hour != null ? Number(close_hour) : null,
      shop.id,
    ]
  );
  res.json({ shop: updated });
});

router.delete("/shops/:id", async (req, res) => {
  const shop = await assertShopOwned(Number(req.params.id), req.user.id);
  if (!shop) return res.status(404).json({ error: "Shop not found" });
  await q("DELETE FROM shops WHERE id = $1", [shop.id]);
  res.json({ ok: true });
});

router.post("/shops/:id/barbers", async (req, res) => {
  const shop = await assertShopOwned(Number(req.params.id), req.user.id);
  if (!shop) return res.status(404).json({ error: "Shop not found" });
  const { name, bio, photo_url, seat_number, login_email, login_password } =
    req.body || {};
  if (!name) return res.status(400).json({ error: "name required" });

  let userId = null;
  if (login_email && login_password) {
    if (login_password.length < 6)
      return res.status(400).json({ error: "barber password must be 6+ chars" });
    const existing = await one("SELECT id FROM users WHERE email = $1", [
      login_email.toLowerCase(),
    ]);
    if (existing)
      return res
        .status(409)
        .json({ error: "That email is already used by another account" });
    const hash = await bcrypt.hash(login_password, 10);
    const u = await one(
      `INSERT INTO users (email, password_hash, role, name)
       VALUES ($1, $2, 'barber', $3) RETURNING id`,
      [login_email.toLowerCase(), hash, name]
    );
    userId = u.id;
  }

  const seat = Math.max(1, Math.min(Number(seat_number) || 1, shop.seats));
  const barber = await one(
    `INSERT INTO barbers (shop_id, user_id, name, bio, photo_url, seat_number)
     VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
    [shop.id, userId, name, bio || null, photo_url || null, seat]
  );
  res.json({ barber });
});

router.put("/barbers/:id", async (req, res) => {
  const barber = await assertBarberOwned(Number(req.params.id), req.user.id);
  if (!barber) return res.status(404).json({ error: "Barber not found" });
  const { name, bio, photo_url, seat_number } = req.body || {};
  const shop = await one("SELECT seats FROM shops WHERE id = $1", [barber.shop_id]);
  const seat =
    seat_number != null
      ? Math.max(1, Math.min(Number(seat_number), shop.seats))
      : null;
  const updated = await one(
    `UPDATE barbers
        SET name = COALESCE($1, name),
            bio = COALESCE($2, bio),
            photo_url = COALESCE($3, photo_url),
            seat_number = COALESCE($4, seat_number)
      WHERE id = $5 RETURNING *`,
    [name ?? null, bio ?? null, photo_url ?? null, seat, barber.id]
  );
  res.json({ barber: updated });
});

router.post("/barbers/:id/login", async (req, res) => {
  const barber = await assertBarberOwned(Number(req.params.id), req.user.id);
  if (!barber) return res.status(404).json({ error: "Barber not found" });
  const { login_email, login_password } = req.body || {};
  if (!login_email || !login_password)
    return res.status(400).json({ error: "email and password required" });
  if (login_password.length < 6)
    return res.status(400).json({ error: "password must be 6+ chars" });

  const email = login_email.toLowerCase();
  const hash = await bcrypt.hash(login_password, 10);

  if (barber.user_id) {
    await q(
      "UPDATE users SET email = $1, password_hash = $2, name = $3 WHERE id = $4",
      [email, hash, barber.name, barber.user_id]
    );
  } else {
    const existing = await one("SELECT id FROM users WHERE email = $1", [email]);
    if (existing)
      return res
        .status(409)
        .json({ error: "That email is already used by another account" });
    const u = await one(
      `INSERT INTO users (email, password_hash, role, name)
       VALUES ($1, $2, 'barber', $3) RETURNING id`,
      [email, hash, barber.name]
    );
    await q("UPDATE barbers SET user_id = $1 WHERE id = $2", [u.id, barber.id]);
  }
  res.json({ ok: true });
});

router.delete("/barbers/:id", async (req, res) => {
  const barber = await assertBarberOwned(Number(req.params.id), req.user.id);
  if (!barber) return res.status(404).json({ error: "Barber not found" });
  await q("DELETE FROM barbers WHERE id = $1", [barber.id]);
  if (barber.user_id) await q("DELETE FROM users WHERE id = $1", [barber.user_id]);
  res.json({ ok: true });
});

router.get("/barbers/:id", async (req, res) => {
  const barber = await assertBarberOwned(Number(req.params.id), req.user.id);
  if (!barber) return res.status(404).json({ error: "Barber not found" });
  const biz = await getBiz(req.user.id);
  const services = await many(
    `SELECT s.id, s.name, s.duration_min, s.base_price,
            bs.price AS override_price
       FROM services s
       LEFT JOIN barber_services bs ON bs.service_id = s.id AND bs.barber_id = $1
      WHERE s.business_id = $2
      ORDER BY s.name`,
    [barber.id, biz.id]
  );
  res.json({ barber, services });
});

router.put("/barbers/:id/services", async (req, res) => {
  const barber = await assertBarberOwned(Number(req.params.id), req.user.id);
  if (!barber) return res.status(404).json({ error: "Barber not found" });
  const { service_id, price } = req.body || {};
  const sid = Number(service_id);
  if (!sid) return res.status(400).json({ error: "service_id required" });
  const svc = await assertServiceOwned(sid, req.user.id);
  if (!svc) return res.status(404).json({ error: "Service not found" });

  if (price === null || price === "" || price === undefined) {
    await q(
      "DELETE FROM barber_services WHERE barber_id = $1 AND service_id = $2",
      [barber.id, sid]
    );
    return res.json({ ok: true, cleared: true });
  }
  const p = Number(price);
  if (!Number.isFinite(p) || p < 0)
    return res.status(400).json({ error: "price must be a non-negative number" });

  await q(
    `INSERT INTO barber_services (barber_id, service_id, price)
     VALUES ($1, $2, $3)
     ON CONFLICT (barber_id, service_id) DO UPDATE SET price = EXCLUDED.price`,
    [barber.id, sid, p]
  );
  res.json({ ok: true });
});

router.get("/services", async (req, res) => {
  const biz = await getBiz(req.user.id);
  const rows = await many(
    "SELECT * FROM services WHERE business_id = $1 ORDER BY name",
    [biz.id]
  );
  res.json({ services: rows });
});

router.post("/services", async (req, res) => {
  const { name, duration_min, base_price } = req.body || {};
  if (!name) return res.status(400).json({ error: "name required" });
  const biz = await getBiz(req.user.id);
  const svc = await one(
    `INSERT INTO services (business_id, name, duration_min, base_price)
     VALUES ($1, $2, $3, $4) RETURNING *`,
    [biz.id, name, Number(duration_min) || 30, Number(base_price) || 0]
  );
  res.json({ service: svc });
});

router.delete("/services/:id", async (req, res) => {
  const svc = await assertServiceOwned(Number(req.params.id), req.user.id);
  if (!svc) return res.status(404).json({ error: "Service not found" });
  await q("DELETE FROM services WHERE id = $1", [svc.id]);
  res.json({ ok: true });
});

router.get("/shops/:id/report", async (req, res) => {
  const shop = await assertShopOwned(Number(req.params.id), req.user.id);
  if (!shop) return res.status(404).json({ error: "Shop not found" });
  const day = req.query.day || new Date().toISOString().slice(0, 10);

  const rows = await many(
    `SELECT b.id AS barber_id, b.name AS barber_name, b.seat_number,
            COALESCE(SUM(CASE WHEN bk.status='completed' THEN bk.price END), 0)::float AS completed_total,
            COALESCE(SUM(CASE WHEN bk.status='booked' THEN bk.price END), 0)::float AS pending_total,
            COUNT(CASE WHEN bk.status='completed' THEN 1 END)::int AS completed_count,
            COUNT(CASE WHEN bk.status='booked' THEN 1 END)::int AS pending_count
       FROM barbers b
       LEFT JOIN bookings bk
              ON bk.barber_id = b.id
             AND bk.start_at::date = $1::date
      WHERE b.shop_id = $2
      GROUP BY b.id, b.name, b.seat_number
      ORDER BY b.seat_number, b.name`,
    [day, shop.id]
  );

  const totals = rows.reduce(
    (acc, r) => {
      acc.completed += r.completed_total;
      acc.pending += r.pending_total;
      return acc;
    },
    { completed: 0, pending: 0 }
  );

  res.json({ day, shop, rows, totals });
});

router.get("/shops/:id/bookings", async (req, res) => {
  const shop = await assertShopOwned(Number(req.params.id), req.user.id);
  if (!shop) return res.status(404).json({ error: "Shop not found" });
  const day = req.query.day || new Date().toISOString().slice(0, 10);
  const rows = await many(
    `SELECT bk.*, u.name AS customer_name, u.phone AS customer_phone,
            b.name AS barber_name, b.seat_number, s.name AS service_name
       FROM bookings bk
       JOIN users u ON u.id = bk.customer_id
       JOIN barbers b ON b.id = bk.barber_id
       JOIN services s ON s.id = bk.service_id
      WHERE bk.shop_id = $1 AND bk.start_at::date = $2::date
      ORDER BY bk.start_at`,
    [shop.id, day]
  );
  res.json({ bookings: rows });
});

router.patch("/bookings/:id", async (req, res) => {
  const id = Number(req.params.id);
  const booking = await one(
    `SELECT bk.* FROM bookings bk
       JOIN shops sh ON sh.id = bk.shop_id
       JOIN businesses biz ON biz.id = sh.business_id
      WHERE bk.id = $1 AND biz.owner_id = $2`,
    [id, req.user.id]
  );
  if (!booking) return res.status(404).json({ error: "Booking not found" });
  const { status } = req.body || {};
  if (!["booked", "completed", "cancelled"].includes(status))
    return res.status(400).json({ error: "invalid status" });
  const updated = await one(
    "UPDATE bookings SET status = $1 WHERE id = $2 RETURNING *",
    [status, id]
  );
  res.json({ booking: updated });
});

export default router;
