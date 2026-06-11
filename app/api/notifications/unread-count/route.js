import { json, withAuth } from "@/lib/route";
import { unreadCount } from "@/lib/services/notifications";

export const GET = withAuth(null, async (_req, { user }) =>
  json({ count: await unreadCount(user.id) })
);

export const dynamic = "force-dynamic";
