import { apiJson } from "@/lib/api";
import BusinessesTable from "@/components/BusinessesTable";

export default async function AdminBusinesses({ searchParams }) {
  const sp = await searchParams;
  const q = sp?.q || "";
  const data = await apiJson(`/admin/businesses${q ? `?q=${encodeURIComponent(q)}` : ""}`);
  return <BusinessesTable initial={data?.businesses || []} initialQuery={q} />;
}
