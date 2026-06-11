import { json, err, bodyOf, withAuth } from "@/lib/route";
import { getShopDetail, updateShop, deleteShop } from "@/lib/services/owner";

export const GET = withAuth("owner", async (_req, { params, user }) => {
  const p = await params;
  const r = await getShopDetail(Number(p.id), user.id);
  if (r.error) return err(r.error, r.status);
  return json(r);
});

export const PUT = withAuth("owner", async (req, { params, user }) => {
  const p = await params;
  const body = await bodyOf(req);
  const r = await updateShop(Number(p.id), user.id, body);
  if (r.error) return err(r.error, r.status);
  return json(r);
});

export const DELETE = withAuth("owner", async (_req, { params, user }) => {
  const p = await params;
  const r = await deleteShop(Number(p.id), user.id);
  if (r.error) return err(r.error, r.status);
  return json(r);
});

export const dynamic = "force-dynamic";
