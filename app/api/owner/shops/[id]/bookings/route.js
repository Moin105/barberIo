import { json, err, withAuth } from "@/lib/route";
import { shopBookings } from "@/lib/services/owner";

export const GET = withAuth("owner", async (req, { params, user }) => {
  const p = await params;
  const url = new URL(req.url);
  const day = url.searchParams.get("day") || new Date().toISOString().slice(0, 10);
  const r = await shopBookings(Number(p.id), user.id, day);
  if (r.error) return err(r.error, r.status);
  return json(r);
});

export const dynamic = "force-dynamic";
