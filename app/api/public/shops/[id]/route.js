import { json, err, withTry } from "@/lib/route";
import { getShopPublic } from "@/lib/services/public";

export const GET = withTry(async (_req, { params }) => {
  const p = await params;
  const r = await getShopPublic(Number(p.id));
  if (!r) return err("Not found", 404);
  return json(r);
});

export const dynamic = "force-dynamic";
