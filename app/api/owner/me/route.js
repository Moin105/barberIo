import { json, withAuth } from "@/lib/route";
import { getOwnerMe } from "@/lib/services/owner";

export const GET = withAuth("owner", async (_req, { user }) =>
  json(await getOwnerMe(user.id))
);

export const dynamic = "force-dynamic";
