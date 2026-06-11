import { json, err, bodyOf, withAuth } from "@/lib/route";
import { listShops, createShop } from "@/lib/services/owner";

export const GET = withAuth("owner", async (_req, { user }) =>
  json({ shops: await listShops(user.id) })
);

export const POST = withAuth("owner", async (req, { user }) => {
  const body = await bodyOf(req);
  const r = await createShop(user.id, body);
  if (r.error) return err(r.error, r.status);
  return json(r);
});

export const dynamic = "force-dynamic";
