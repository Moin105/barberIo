import { json, err, withAuth } from "@/lib/route";
import { barberSchedule } from "@/lib/services/barber";

export const GET = withAuth("barber", async (req, { user }) => {
  const url = new URL(req.url);
  const day = url.searchParams.get("day") || new Date().toISOString().slice(0, 10);
  const r = await barberSchedule(user.id, day);
  if (r.error) return err(r.error, r.status);
  return json(r);
});

export const dynamic = "force-dynamic";
