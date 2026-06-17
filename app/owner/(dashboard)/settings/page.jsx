import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { getOwnerMe } from "@/lib/services/owner";
import OwnerSettings from "@/components/OwnerSettings";

export const dynamic = "force-dynamic";

export default async function SettingsPage() {
  const user = await getCurrentUser();
  if (!user || user.role !== "owner") redirect("/owner/login");
  const me = await getOwnerMe(user.id);
  return <OwnerSettings me={me} />;
}
