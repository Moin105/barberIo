import { json, err, bodyOf, withAuth } from "@/lib/route";
import { barberUpdateBookingStatus } from "@/lib/services/barber";

export const PATCH = withAuth("barber", async (req, { params, user }) => {
  const p = await params;
  const body = await bodyOf(req);
  const r = await barberUpdateBookingStatus(user.id, Number(p.id), body?.status);
  if (r.error) return err(r.error, r.status);
  return json(r);
});

export const dynamic = "force-dynamic";
