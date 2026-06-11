import { json, withTry } from "@/lib/route";
import { listShopsPublic } from "@/lib/services/public";

export const GET = withTry(async () => json({ shops: await listShopsPublic() }));

export const dynamic = "force-dynamic";
