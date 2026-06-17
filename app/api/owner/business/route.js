import { json, err, bodyOf, withAuth } from "@/lib/route";
import { one } from "@/lib/db";
import { getOrCreateBusiness } from "@/lib/services/owner";

export const PUT = withAuth("owner", async (req, { user }) => {
  const body = await bodyOf(req);
  const name = (body?.name || "").trim();
  if (!name) return err("name required", 400);
  if (name.length > 80) return err("name too long", 400);
  const biz = await getOrCreateBusiness(user.id);
  const updated = await one(
    "UPDATE businesses SET name = $1 WHERE id = $2 RETURNING *",
    [name, biz.id]
  );
  return json({ business: updated });
});

export const dynamic = "force-dynamic";
