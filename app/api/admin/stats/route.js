import { json, withAuth } from "@/lib/route";
import { platformStats } from "@/lib/services/admin";

export const GET = withAuth("super_admin", async () => json(await platformStats()));

export const dynamic = "force-dynamic";
