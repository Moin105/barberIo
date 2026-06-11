import { json, withAuth } from "@/lib/route";
import { listNotifications } from "@/lib/services/notifications";

export const GET = withAuth(null, async (_req, { user }) =>
  json({ notifications: await listNotifications(user.id) })
);

export const dynamic = "force-dynamic";
