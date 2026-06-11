import { json, err, withTry } from "@/lib/route";
import { getBarberPublic } from "@/lib/services/public";

export const GET = withTry(async (_req, { params }) => {
  const p = await params;
  const r = await getBarberPublic(Number(p.id));
  if (!r) return err("Not found", 404);
  return json(r);
});

export const dynamic = "force-dynamic";
