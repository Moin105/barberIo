import { one, many } from "../db";

export async function listShopsPublic() {
  return many(
    `SELECT sh.id, sh.name, sh.address, sh.seats, sh.open_hour, sh.close_hour,
            biz.name AS business_name,
            (SELECT COUNT(*)::int FROM barbers b WHERE b.shop_id = sh.id) AS barber_count
       FROM shops sh
       JOIN businesses biz ON biz.id = sh.business_id
      ORDER BY sh.name`
  );
}

export async function getShopPublic(shopId) {
  const shop = await one(
    `SELECT sh.*, biz.name AS business_name
       FROM shops sh JOIN businesses biz ON biz.id = sh.business_id
      WHERE sh.id = $1`,
    [shopId]
  );
  if (!shop) return null;
  const barbers = await many(
    `SELECT b.*,
            (SELECT AVG(stars)::float FROM ratings r WHERE r.barber_id = b.id) AS rating_avg,
            (SELECT COUNT(*)::int FROM ratings r WHERE r.barber_id = b.id) AS rating_count
       FROM barbers b WHERE b.shop_id = $1 ORDER BY b.seat_number, b.name`,
    [shop.id]
  );
  return { shop, barbers };
}

export async function getBarberPublic(barberId) {
  const barber = await one(
    `SELECT b.*, sh.id AS shop_id, sh.name AS shop_name, sh.address AS shop_address,
            sh.open_hour, sh.close_hour, sh.seats
       FROM barbers b
       JOIN shops sh ON sh.id = b.shop_id
      WHERE b.id = $1`,
    [barberId]
  );
  if (!barber) return null;
  const services = await many(
    `SELECT s.id, s.name, s.duration_min,
            COALESCE(bs.price, s.base_price)::float AS price
       FROM services s
       LEFT JOIN barber_services bs ON bs.service_id = s.id AND bs.barber_id = $1
      WHERE s.business_id = (SELECT business_id FROM shops WHERE id = $2)
      ORDER BY s.name`,
    [barberId, barber.shop_id]
  );
  const rating = await one(
    `SELECT AVG(stars)::float AS avg, COUNT(*)::int AS count
       FROM ratings WHERE barber_id = $1`,
    [barberId]
  );
  const reviews = await many(
    `SELECT r.stars, r.comment, r.created_at, u.name AS customer_name
       FROM ratings r JOIN users u ON u.id = r.customer_id
      WHERE r.barber_id = $1
      ORDER BY r.created_at DESC LIMIT 10`,
    [barberId]
  );
  return { barber, services, rating, reviews };
}

export async function barberAvailability(barberId, day, duration) {
  const barber = await one(
    `SELECT b.*, sh.open_hour, sh.close_hour, sh.seats
       FROM barbers b JOIN shops sh ON sh.id = b.shop_id WHERE b.id = $1`,
    [barberId]
  );
  if (!barber) return null;
  const dur = Math.max(15, Number(duration) || 30);
  const taken = await many(
    `SELECT start_at, end_at FROM bookings
      WHERE barber_id = $1 AND start_at::date = $2::date AND status != 'cancelled'`,
    [barberId, day]
  );
  const slots = [];
  const open = barber.open_hour;
  const close = barber.close_hour;
  const step = 30;
  const dayStart = new Date(`${day}T00:00:00`);
  for (let h = open * 60; h + dur <= close * 60; h += step) {
    const s = new Date(dayStart.getTime() + h * 60_000);
    const e = new Date(s.getTime() + dur * 60_000);
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
  return { day, duration: dur, slots };
}
