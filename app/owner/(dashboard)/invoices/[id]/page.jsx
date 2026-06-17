import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { getInvoiceForOwner } from "@/lib/services/invoices";
import InvoiceView from "@/components/InvoiceView";
import Icon from "@/components/Icon";

export const dynamic = "force-dynamic";

export default async function OwnerInvoiceDetail({ params }) {
  const user = await getCurrentUser();
  if (!user || user.role !== "owner") redirect("/owner/login");
  const { id } = await params;
  const invoice = await getInvoiceForOwner(user.id, Number(id));
  if (!invoice) notFound();
  return (
    <div className="flex flex-col gap-4">
      <Link
        href="/owner/invoices"
        className="inline-flex w-fit items-center gap-1 text-xs text-ink-400 hover:text-brand-500 print:hidden"
      >
        <Icon name="arrow" className="h-3.5 w-3.5 -scale-x-100" /> All invoices
      </Link>
      <InvoiceView invoice={invoice} role="owner" />
    </div>
  );
}
