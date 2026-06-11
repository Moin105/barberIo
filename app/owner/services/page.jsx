import { apiJson } from "@/lib/api";
import ServicesManager from "@/components/ServicesManager";

export default async function ServicesPage() {
  const data = await apiJson("/owner/services");
  return <ServicesManager initialServices={data?.services || []} />;
}
