import { json, withAuth } from "@/lib/route";
import { markAllRead } from "@/lib/services/notifications";

export const POST = withAuth(null, async (_req, { user }) => {
  await markAllRead(user.id);
  return json({ ok: true });
});

export const dynamic = "force-dynamic";
