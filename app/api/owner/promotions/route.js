import { json, err, bodyOf, withAuth } from "@/lib/route";
import { listOwnerPromotions, createPromotion } from "@/lib/services/promotions";

export const GET = withAuth("owner", async (_req, { user }) =>
  json({ promotions: await listOwnerPromotions(user.id) })
);

export const POST = withAuth("owner", async (req, { user }) => {
  const body = await bodyOf(req);
  const r = await createPromotion(user.id, body);
  if (r.error) return err(r.error, r.status);
  return json(r);
});

export const dynamic = "force-dynamic";
