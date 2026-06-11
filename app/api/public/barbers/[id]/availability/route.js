import { json, err, withTry } from "@/lib/route";
import { barberAvailability } from "@/lib/services/public";

export const GET = withTry(async (req, { params }) => {
  const p = await params;
  const url = new URL(req.url);
  const day = url.searchParams.get("day") || new Date().toISOString().slice(0, 10);
  const duration = url.searchParams.get("duration");
  const r = await barberAvailability(Number(p.id), day, duration);
  if (!r) return err("Not found", 404);
  return json(r);
});

export const dynamic = "force-dynamic";
