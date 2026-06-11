import bcrypt from "bcryptjs";
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

export async function getOrCreateBusiness(ownerId) {
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

export async function getOwnerMe(ownerId) {
  const biz = await getOrCreateBusiness(ownerId);
  const subscription = await one(
    "SELECT * FROM subscriptions WHERE business_id = $1",
    [biz.id]
  );
  return { business: biz, subscription };
}

export async function listShops(ownerId) {
  const biz = await getOrCreateBusiness(ownerId);
  return many(
    `SELECT sh.*,
            (SELECT COUNT(*)::int FROM barbers b WHERE b.shop_id = sh.id) AS barber_count
       FROM shops sh
      WHERE sh.business_id = $1
      ORDER BY sh.created_at`,
    [biz.id]
  );
}

export async function createShop(ownerId, { name, address, seats, open_hour, close_hour }) {
  if (!name) return { error: "name required", status: 400 };
  const biz = await getOrCreateBusiness(ownerId);
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
  return { shop };
}

export async function shopOwnedBy(shopId, ownerId) {
  return one(
    `SELECT sh.* FROM shops sh
       JOIN businesses biz ON biz.id = sh.business_id
      WHERE sh.id = $1 AND biz.owner_id = $2`,
    [shopId, ownerId]
  );
}

export async function getShopDetail(shopId, ownerId) {
  const shop = await shopOwnedBy(shopId, ownerId);
  if (!shop) return { error: "Shop not found", status: 404 };
  const barbers = await many(
    `SELECT b.*, u.email AS login_email
       FROM barbers b
       LEFT JOIN users u ON u.id = b.user_id
      WHERE b.shop_id = $1
      ORDER BY b.seat_number, b.created_at`,
    [shop.id]
  );
  return { shop, barbers };
}

export async function updateShop(shopId, ownerId, fields) {
  const shop = await shopOwnedBy(shopId, ownerId);
  if (!shop) return { error: "Shop not found", status: 404 };
  const { name, address, seats, open_hour, close_hour } = fields || {};
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
  return { shop: updated };
}

export async function deleteShop(shopId, ownerId) {
  const shop = await shopOwnedBy(shopId, ownerId);
  if (!shop) return { error: "Shop not found", status: 404 };
  await q("DELETE FROM shops WHERE id = $1", [shop.id]);
  return { ok: true };
}

export async function addBarber(shopId, ownerId, fields) {
  const shop = await shopOwnedBy(shopId, ownerId);
  if (!shop) return { error: "Shop not found", status: 404 };
  const { name, bio, photo_url, seat_number, login_email, login_password } =
    fields || {};
  if (!name) return { error: "name required", status: 400 };

  let userId = null;
  if (login_email && login_password) {
    if (login_password.length < 6)
      return { error: "barber password must be 6+ chars", status: 400 };
    const existing = await one("SELECT id FROM users WHERE email = $1", [
      login_email.toLowerCase(),
    ]);
    if (existing)
      return {
        error: "That email is already used by another account",
        status: 409,
      };
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
  return { barber };
}

export async function barberOwnedBy(barberId, ownerId) {
  return one(
    `SELECT b.* FROM barbers b
       JOIN shops sh ON sh.id = b.shop_id
       JOIN businesses biz ON biz.id = sh.business_id
      WHERE b.id = $1 AND biz.owner_id = $2`,
    [barberId, ownerId]
  );
}

export async function updateBarber(barberId, ownerId, fields) {
  const barber = await barberOwnedBy(barberId, ownerId);
  if (!barber) return { error: "Barber not found", status: 404 };
  const { name, bio, photo_url, seat_number } = fields || {};
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
  return { barber: updated };
}

export async function setBarberLogin(barberId, ownerId, { login_email, login_password }) {
  const barber = await barberOwnedBy(barberId, ownerId);
  if (!barber) return { error: "Barber not found", status: 404 };
  if (!login_email || !login_password)
    return { error: "email and password required", status: 400 };
  if (login_password.length < 6)
    return { error: "password must be 6+ chars", status: 400 };

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
      return {
        error: "That email is already used by another account",
        status: 409,
      };
    const u = await one(
      `INSERT INTO users (email, password_hash, role, name)
       VALUES ($1, $2, 'barber', $3) RETURNING id`,
      [email, hash, barber.name]
    );
    await q("UPDATE barbers SET user_id = $1 WHERE id = $2", [u.id, barber.id]);
  }
  return { ok: true };
}

export async function deleteBarber(barberId, ownerId) {
  const barber = await barberOwnedBy(barberId, ownerId);
  if (!barber) return { error: "Barber not found", status: 404 };
  await q("DELETE FROM barbers WHERE id = $1", [barber.id]);
  if (barber.user_id) await q("DELETE FROM users WHERE id = $1", [barber.user_id]);
  return { ok: true };
}

export async function getBarberPricing(barberId, ownerId) {
  const barber = await barberOwnedBy(barberId, ownerId);
  if (!barber) return { error: "Barber not found", status: 404 };
  const biz = await getOrCreateBusiness(ownerId);
  const services = await many(
    `SELECT s.id, s.name, s.duration_min, s.base_price,
            bs.price AS override_price
       FROM services s
       LEFT JOIN barber_services bs ON bs.service_id = s.id AND bs.barber_id = $1
      WHERE s.business_id = $2
      ORDER BY s.name`,
    [barber.id, biz.id]
  );
  return { barber, services };
}

export async function setBarberServicePrice(barberId, ownerId, { service_id, price }) {
  const barber = await barberOwnedBy(barberId, ownerId);
  if (!barber) return { error: "Barber not found", status: 404 };
  const sid = Number(service_id);
  if (!sid) return { error: "service_id required", status: 400 };
  const svc = await serviceOwnedBy(sid, ownerId);
  if (!svc) return { error: "Service not found", status: 404 };

  if (price === null || price === "" || price === undefined) {
    await q(
      "DELETE FROM barber_services WHERE barber_id = $1 AND service_id = $2",
      [barber.id, sid]
    );
    return { ok: true, cleared: true };
  }
  const p = Number(price);
  if (!Number.isFinite(p) || p < 0)
    return { error: "price must be a non-negative number", status: 400 };

  await q(
    `INSERT INTO barber_services (barber_id, service_id, price)
     VALUES ($1, $2, $3)
     ON CONFLICT (barber_id, service_id) DO UPDATE SET price = EXCLUDED.price`,
    [barber.id, sid, p]
  );
  return { ok: true };
}

export async function serviceOwnedBy(serviceId, ownerId) {
  return one(
    `SELECT s.* FROM services s
       JOIN businesses biz ON biz.id = s.business_id
      WHERE s.id = $1 AND biz.owner_id = $2`,
    [serviceId, ownerId]
  );
}

export async function listServices(ownerId) {
  const biz = await getOrCreateBusiness(ownerId);
  return many("SELECT * FROM services WHERE business_id = $1 ORDER BY name", [biz.id]);
}

export async function createService(ownerId, { name, duration_min, base_price }) {
  if (!name) return { error: "name required", status: 400 };
  const biz = await getOrCreateBusiness(ownerId);
  const svc = await one(
    `INSERT INTO services (business_id, name, duration_min, base_price)
     VALUES ($1, $2, $3, $4) RETURNING *`,
    [biz.id, name, Number(duration_min) || 30, Number(base_price) || 0]
  );
  return { service: svc };
}

export async function deleteService(serviceId, ownerId) {
  const svc = await serviceOwnedBy(serviceId, ownerId);
  if (!svc) return { error: "Service not found", status: 404 };
  await q("DELETE FROM services WHERE id = $1", [svc.id]);
  return { ok: true };
}

export async function dailyReport(shopId, ownerId, day) {
  const shop = await shopOwnedBy(shopId, ownerId);
  if (!shop) return { error: "Shop not found", status: 404 };
  const rows = await many(
    `SELECT b.id AS barber_id, b.name AS barber_name, b.seat_number,
            COALESCE(SUM(CASE WHEN bk.status='completed' THEN bk.price END), 0)::float AS completed_total,
            COALESCE(SUM(CASE WHEN bk.status IN ('booked','pending') THEN bk.price END), 0)::float AS pending_total,
            COUNT(CASE WHEN bk.status='completed' THEN 1 END)::int AS completed_count,
            COUNT(CASE WHEN bk.status IN ('booked','pending') THEN 1 END)::int AS pending_count
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
    (a, r) => {
      a.completed += r.completed_total;
      a.pending += r.pending_total;
      return a;
    },
    { completed: 0, pending: 0 }
  );
  return { day, shop, rows, totals };
}

export async function shopBookings(shopId, ownerId, day) {
  const shop = await shopOwnedBy(shopId, ownerId);
  if (!shop) return { error: "Shop not found", status: 404 };
  const bookings = await many(
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
  return { bookings };
}

export async function ownerUpdateBookingStatus(bookingId, ownerId, status) {
  if (!["pending", "booked", "completed", "cancelled", "declined"].includes(status))
    return { error: "invalid status", status: 400 };
  const booking = await one(
    `SELECT bk.*, b.user_id AS barber_user_id, b.name AS barber_name,
            s.name AS service_name
       FROM bookings bk
       JOIN barbers b ON b.id = bk.barber_id
       JOIN services s ON s.id = bk.service_id
       JOIN shops sh ON sh.id = bk.shop_id
       JOIN businesses biz ON biz.id = sh.business_id
      WHERE bk.id = $1 AND biz.owner_id = $2`,
    [bookingId, ownerId]
  );
  if (!booking) return { error: "Booking not found", status: 404 };
  const updated = await one(
    "UPDATE bookings SET status = $1 WHERE id = $2 RETURNING *",
    [status, bookingId]
  );

  // Customer-facing notifications
  const whenLabel = fmtTime(booking.start_at);
  const customerMsg = {
    booked: {
      kind: "booking_confirmed",
      title: `Your ${booking.service_name} is confirmed`,
      body: `${whenLabel} with ${booking.barber_name}`,
    },
    declined: {
      kind: "booking_declined",
      title: `Your booking was declined`,
      body: `${booking.service_name} · ${whenLabel}. Try another slot.`,
    },
    completed: {
      kind: "booking_completed",
      title: `Thanks for visiting!`,
      body: `Tap to rate your ${booking.service_name} with ${booking.barber_name}.`,
    },
    cancelled: {
      kind: "booking_cancelled",
      title: `Your booking was cancelled`,
      body: `${booking.service_name} · ${whenLabel}`,
    },
  }[status];
  if (customerMsg) {
    await notify({
      userId: booking.customer_id,
      ...customerMsg,
      href: "/my-bookings",
    });
  }

  // Notify the barber too when status moves to booked (they should know who's
  // coming in) or completed/cancelled.
  if (booking.barber_user_id && ["booked", "completed", "cancelled"].includes(status)) {
    await notify({
      userId: booking.barber_user_id,
      kind: `booking_${status}`,
      title: `Booking ${status}`,
      body: `${booking.service_name} · ${whenLabel}`,
      href: "/barber",
    });
  }

  return { booking: updated };
}

// Per-shop pending bookings (the verify queue for one location).
export async function pendingShopBookings(shopId, ownerId) {
  const shop = await shopOwnedBy(shopId, ownerId);
  if (!shop) return { error: "Shop not found", status: 404 };
  const bookings = await many(
    `SELECT bk.*, u.name AS customer_name, u.phone AS customer_phone,
            b.name AS barber_name, b.seat_number, s.name AS service_name
       FROM bookings bk
       JOIN users u ON u.id = bk.customer_id
       JOIN barbers b ON b.id = bk.barber_id
       JOIN services s ON s.id = bk.service_id
      WHERE bk.shop_id = $1 AND bk.status = 'pending'
      ORDER BY bk.start_at ASC`,
    [shop.id]
  );
  return { bookings };
}

// All pending bookings across this owner's businesses (top-level queue).
export async function pendingBookings(ownerId) {
  return many(
    `SELECT bk.*, u.name AS customer_name, u.phone AS customer_phone,
            b.name AS barber_name, b.seat_number, sh.name AS shop_name,
            s.name AS service_name
       FROM bookings bk
       JOIN users u ON u.id = bk.customer_id
       JOIN barbers b ON b.id = bk.barber_id
       JOIN shops sh ON sh.id = bk.shop_id
       JOIN businesses biz ON biz.id = sh.business_id
       JOIN services s ON s.id = bk.service_id
      WHERE biz.owner_id = $1 AND bk.status = 'pending'
      ORDER BY bk.start_at ASC`,
    [ownerId]
  );
}
