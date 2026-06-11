import { json, err, withAuth } from "@/lib/route";
import { deleteService } from "@/lib/services/owner";

export const DELETE = withAuth("owner", async (_req, { params, user }) => {
  const p = await params;
  const r = await deleteService(Number(p.id), user.id);
  if (r.error) return err(r.error, r.status);
  return json(r);
});

export const dynamic = "force-dynamic";
