import { json, withAuth } from "@/lib/route";
import { recentActivity } from "@/lib/services/admin";

export const GET = withAuth("super_admin", async () =>
  json({ activity: await recentActivity() })
);

export const dynamic = "force-dynamic";
