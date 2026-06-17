import { json, err, bodyOf, withAuth } from "@/lib/route";
import { updateBusinessTax } from "@/lib/services/owner";

export const PUT = withAuth("owner", async (req, { user }) => {
  const body = await bodyOf(req);
  const r = await updateBusinessTax(user.id, body);
  if (r.error) return err(r.error, r.status);
  return json(r);
});

export const dynamic = "force-dynamic";
