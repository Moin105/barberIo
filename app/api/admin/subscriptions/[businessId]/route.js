import { json, err, bodyOf, withAuth } from "@/lib/route";
import { updateSubscription } from "@/lib/services/admin";

export const PUT = withAuth("super_admin", async (req, { params }) => {
  const p = await params;
  const body = await bodyOf(req);
  const r = await updateSubscription(Number(p.businessId), body);
  if (r.error) return err(r.error, r.status);
  return json(r);
});

export const dynamic = "force-dynamic";
