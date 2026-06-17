import { one, many } from "../db";
import { getOrCreateBusiness } from "./owner";

export async function listOwnerInvoices(ownerId, { from, to, barberId } = {}) {
  const biz = await getOrCreateBusiness(ownerId);
  const params = [biz.id];
  const where = ["i.business_id = $1"];
  if (from) {
    params.push(from);
    where.push(`i.issued_at >= $${params.length}::timestamptz`);
  }
  if (to) {
    params.push(to);
    where.push(`i.issued_at <= $${params.length}::timestamptz`);
  }
  if (barberId) {
    params.push(Number(barberId));
    where.push(`i.barber_id = $${params.length}`);
  }
  const rows = await many(
    `SELECT i.*,
            u.name AS customer_name,
            b.name AS barber_name, b.seat_number,
            s.name AS service_name,
            sh.name AS shop_name
       FROM invoices i
       JOIN bookings bk ON bk.id = i.booking_id
       JOIN users u ON u.id = i.customer_id
       JOIN barbers b ON b.id = i.barber_id
       JOIN services s ON s.id = bk.service_id
       JOIN shops sh ON sh.id = bk.shop_id
      WHERE ${where.join(" AND ")}
      ORDER BY i.issued_at DESC
      LIMIT 200`,
    params
  );
  const totals = rows.reduce(
    (a, r) => {
      a.subtotal += Number(r.subtotal);
      a.tax += Number(r.tax_amount);
      a.total += Number(r.total);
      return a;
    },
    { subtotal: 0, tax: 0, total: 0 }
  );
  return { invoices: rows, totals };
}

async function _fullInvoice(where, params) {
  return one(
    `SELECT i.*,
            u.name AS customer_name, u.email AS customer_email, u.phone AS customer_phone,
            b.name AS barber_name, b.seat_number,
            s.name AS service_name, s.duration_min,
            sh.name AS shop_name, sh.address AS shop_address,
            biz.name AS business_name,
            bk.start_at, bk.end_at, bk.id AS booking_id
       FROM invoices i
       JOIN bookings bk ON bk.id = i.booking_id
       JOIN users u ON u.id = i.customer_id
       JOIN barbers b ON b.id = i.barber_id
       JOIN services s ON s.id = bk.service_id
       JOIN shops sh ON sh.id = bk.shop_id
       JOIN businesses biz ON biz.id = i.business_id
      WHERE ${where}`,
    params
  );
}

export async function getInvoiceForOwner(ownerId, id) {
  const biz = await getOrCreateBusiness(ownerId);
  return _fullInvoice("i.id = $1 AND i.business_id = $2", [id, biz.id]);
}

export async function getInvoiceForCustomerByBooking(customerId, bookingId) {
  return _fullInvoice("i.booking_id = $1 AND i.customer_id = $2", [bookingId, customerId]);
}
