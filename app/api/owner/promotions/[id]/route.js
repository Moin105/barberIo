import { json, err, bodyOf, withAuth } from "@/lib/route";
import { updatePromotion, deletePromotion } from "@/lib/services/promotions";

export const PUT = withAuth("owner", async (req, { params, user }) => {
  const p = await params;
  const body = await bodyOf(req);
  const r = await updatePromotion(user.id, Number(p.id), body);
  if (r.error) return err(r.error, r.status);
  return json(r);
});

export const DELETE = withAuth("owner", async (_req, { params, user }) => {
  const p = await params;
  const r = await deletePromotion(user.id, Number(p.id));
  if (r.error) return err(r.error, r.status);
  return json(r);
});

export const dynamic = "force-dynamic";
