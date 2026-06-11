import { json, err, bodyOf, withAuth } from "@/lib/route";
import { rateBooking } from "@/lib/services/bookings";

export const POST = withAuth("customer", async (req, { params, user }) => {
  const p = await params;
  const body = await bodyOf(req);
  const r = await rateBooking(user.id, Number(p.id), body);
  if (r.error) return err(r.error, r.status);
  return json(r);
});

export const dynamic = "force-dynamic";
