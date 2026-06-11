import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { listServices } from "@/lib/services/owner";
import ServicesManager from "@/components/ServicesManager";

export default async function ServicesPage() {
  const user = await getCurrentUser();
  if (!user || user.role !== "owner") redirect("/owner/login");
  const services = await listServices(user.id);
  return <ServicesManager initialServices={services} />;
}
