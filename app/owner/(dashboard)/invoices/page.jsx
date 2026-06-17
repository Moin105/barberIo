import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { listOwnerInvoices } from "@/lib/services/invoices";
import InvoicesList from "@/components/InvoicesList";

export const dynamic = "force-dynamic";

export default async function InvoicesPage({ searchParams }) {
  const user = await getCurrentUser();
  if (!user || user.role !== "owner") redirect("/owner/login");
  const sp = await searchParams;
  const data = await listOwnerInvoices(user.id, {
    from: sp?.from || null,
    to: sp?.to || null,
    barberId: sp?.barber || null,
  });
  return <InvoicesList data={data} initial={{ from: sp?.from || "", to: sp?.to || "" }} />;
}
