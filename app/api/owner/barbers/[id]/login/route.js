import { json, err, bodyOf, withAuth } from "@/lib/route";
import { setBarberLogin } from "@/lib/services/owner";

export const POST = withAuth("owner", async (req, { params, user }) => {
  const p = await params;
  const body = await bodyOf(req);
  const r = await setBarberLogin(Number(p.id), user.id, body);
  if (r.error) return err(r.error, r.status);
  return json(r);
});

export const dynamic = "force-dynamic";
