import { json, withAuth } from "@/lib/route";
import { markRead } from "@/lib/services/notifications";

export const POST = withAuth(null, async (_req, { params, user }) => {
  const p = await params;
  await markRead(user.id, Number(p.id));
  return json({ ok: true });
});

export const dynamic = "force-dynamic";
