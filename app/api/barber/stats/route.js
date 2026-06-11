import { json, err, withAuth } from "@/lib/route";
import { barberStats } from "@/lib/services/barber";

export const GET = withAuth("barber", async (_req, { user }) => {
  const r = await barberStats(user.id);
  if (r.error) return err(r.error, r.status);
  return json(r);
});

export const dynamic = "force-dynamic";
