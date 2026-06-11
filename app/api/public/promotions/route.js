import { json, withTry } from "@/lib/route";
import { listActivePromotions } from "@/lib/services/promotions";

export const GET = withTry(async () =>
  json({ promotions: await listActivePromotions(6) })
);

export const dynamic = "force-dynamic";
