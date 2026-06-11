import { json, err, bodyOf, withAuth } from "@/lib/route";
import { createBooking } from "@/lib/services/bookings";

export const POST = withAuth("customer", async (req, { user }) => {
  const body = await bodyOf(req);
  const r = await createBooking(user.id, body);
  if (r.error) return err(r.error, r.status);
  return json(r);
});

export const dynamic = "force-dynamic";
