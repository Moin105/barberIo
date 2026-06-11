import { one, many } from "../db";

export const PLAN_PRICES = { free: 0, starter: 19, pro: 49, enterprise: 199 };

export async function platformStats() {
  const owners = await one("SELECT COUNT(*)::int AS n FROM users WHERE role = 'owner'");
  const customers = await one("SELECT COUNT(*)::int AS n FROM users WHERE role = 'customer'");
  const barbers = await one("SELECT COUNT(*)::int AS n FROM users WHERE role = 'barber'");
  const shops = await one("SELECT COUNT(*)::int AS n FROM shops");
  const bookings = await one("SELECT COUNT(*)::int AS n FROM bookings");
  const mrr = await one(
    `SELECT COALESCE(SUM(monthly_amount),0)::float AS v
       FROM subscriptions WHERE status = 'active'`
  );
  const plans = await many(
    `SELECT plan, COUNT(*)::int AS n FROM subscriptions GROUP BY plan ORDER BY plan`
  );
  return {
    owners: owners.n,
    customers: customers.n,
    barbers: barbers.n,
    shops: shops.n,
    bookings: bookings.n,
    mrr: mrr.v,
    plans,
  };
}

export async function listBusinesses(search) {
  const params = [];
  let where = "";
  if (search) {
    params.push(`%${search.toLowerCase()}%`);
    where = `WHERE LOWER(biz.name) LIKE $1 OR LOWER(u.email) LIKE $1 OR LOWER(u.name) LIKE $1`;
  }
  return many(
    `SELECT biz.id, biz.name, biz.created_at,
            u.id AS owner_id, u.name AS owner_name, u.email AS owner_email,
            sub.plan, sub.status, sub.monthly_amount::float AS monthly_amount,
            sub.current_period_end,
            (SELECT COUNT(*)::int FROM shops WHERE business_id = biz.id) AS shop_count,
            (SELECT COUNT(*)::int FROM barbers b JOIN shops s ON s.id = b.shop_id WHERE s.business_id = biz.id) AS barber_count,
            (SELECT COUNT(*)::int FROM bookings bk JOIN shops s ON s.id = bk.shop_id WHERE s.business_id = biz.id) AS booking_count
       FROM businesses biz
       JOIN users u ON u.id = biz.owner_id
       LEFT JOIN subscriptions sub ON sub.business_id = biz.id
       ${where}
       ORDER BY biz.created_at DESC`,
    params
  );
}

export async function updateSubscription(bizId, { plan, status }) {
  if (plan && !PLAN_PRICES.hasOwnProperty(plan))
    return { error: "invalid plan", status: 400 };
  if (status && !["active", "past_due", "cancelled"].includes(status))
    return { error: "invalid status", status: 400 };

  const sub = await one("SELECT id FROM subscriptions WHERE business_id = $1", [bizId]);
  if (!sub) {
    const created = await one(
      `INSERT INTO subscriptions (business_id, plan, status, monthly_amount, updated_at)
       VALUES ($1, $2, $3, $4, NOW()) RETURNING *`,
      [bizId, plan || "free", status || "active", PLAN_PRICES[plan || "free"]]
    );
    return { subscription: created };
  }
  const updated = await one(
    `UPDATE subscriptions
        SET plan = COALESCE($1, plan),
            status = COALESCE($2, status),
            monthly_amount = COALESCE($3, monthly_amount),
            updated_at = NOW()
      WHERE business_id = $4 RETURNING *`,
    [plan, status, plan ? PLAN_PRICES[plan] : null, bizId]
  );
  return { subscription: updated };
}

export async function recentActivity() {
  return many(
    `SELECT 'booking' AS kind, bk.id, bk.created_at,
            biz.name AS business_name,
            u.name AS customer_name,
            b.name AS barber_name,
            bk.price::float AS price,
            bk.status
       FROM bookings bk
       JOIN shops sh ON sh.id = bk.shop_id
       JOIN businesses biz ON biz.id = sh.business_id
       JOIN users u ON u.id = bk.customer_id
       JOIN barbers b ON b.id = bk.barber_id
      ORDER BY bk.created_at DESC LIMIT 20`
  );
}
