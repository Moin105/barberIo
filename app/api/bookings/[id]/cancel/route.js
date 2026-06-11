import { json, err, withAuth } from "@/lib/route";
import { cancelBooking } from "@/lib/services/bookings";

export const POST = withAuth("customer", async (_req, { params, user }) => {
  const p = await params;
  const r = await cancelBooking(user.id, Number(p.id));
  if (r.error) return err(r.error, r.status);
  return json(r);
});

export const dynamic = "force-dynamic";
