import { json, err, bodyOf, withAuth } from "@/lib/route";
import { ownerUpdateBookingStatus } from "@/lib/services/owner";

export const PATCH = withAuth("owner", async (req, { params, user }) => {
  const p = await params;
  const body = await bodyOf(req);
  const r = await ownerUpdateBookingStatus(Number(p.id), user.id, body?.status);
  if (r.error) return err(r.error, r.status);
  return json(r);
});

export const dynamic = "force-dynamic";
