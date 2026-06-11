import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { listOwnerPromotions } from "@/lib/services/promotions";
import PromotionsManager from "@/components/PromotionsManager";

export const dynamic = "force-dynamic";

export default async function PromotionsPage() {
  const user = await getCurrentUser();
  if (!user || user.role !== "owner") redirect("/owner/login");
  const promotions = await listOwnerPromotions(user.id);
  return <PromotionsManager initial={promotions} />;
}
