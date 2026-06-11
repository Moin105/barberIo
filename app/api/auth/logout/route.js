import { json } from "@/lib/route";
import { destroySession } from "@/lib/auth";

export const POST = async () => {
  destroySession();
  return json({ ok: true });
};

export const dynamic = "force-dynamic";
