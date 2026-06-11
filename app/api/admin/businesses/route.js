import { json, withAuth } from "@/lib/route";
import { listBusinesses } from "@/lib/services/admin";

export const GET = withAuth("super_admin", async (req) => {
  const url = new URL(req.url);
  const q = url.searchParams.get("q") || "";
  return json({ businesses: await listBusinesses(q) });
});

export const dynamic = "force-dynamic";
