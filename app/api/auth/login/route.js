import { json, err, bodyOf, withTry } from "@/lib/route";
import { loginUser } from "@/lib/services/auth";
import { createSession } from "@/lib/auth";

export const POST = withTry(async (req) => {
  const body = await bodyOf(req);
  const r = await loginUser(body);
  if (r.error) return err(r.error, r.status);
  await createSession(r.user.id);
  return json({ user: r.user });
});

export const dynamic = "force-dynamic";
