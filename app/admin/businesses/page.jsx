import { listBusinesses } from "@/lib/services/admin";
import BusinessesTable from "@/components/BusinessesTable";

export default async function AdminBusinesses({ searchParams }) {
  const sp = await searchParams;
  const q = sp?.q || "";
  const businesses = await listBusinesses(q);
  return <BusinessesTable initial={businesses} initialQuery={q} />;
}
