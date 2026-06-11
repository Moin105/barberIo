import { json, err, bodyOf, withAuth } from "@/lib/route";
import { listServices, createService } from "@/lib/services/owner";

export const GET = withAuth("owner", async (_req, { user }) =>
  json({ services: await listServices(user.id) })
);

export const POST = withAuth("owner", async (req, { user }) => {
  const body = await bodyOf(req);
  const r = await createService(user.id, body);
  if (r.error) return err(r.error, r.status);
  return json(r);
});

export const dynamic = "force-dynamic";
