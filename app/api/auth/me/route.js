import { json, withAuth } from "@/lib/route";

export const GET = withAuth(null, async (_req, { user }) => json({ user }));

export const dynamic = "force-dynamic";
