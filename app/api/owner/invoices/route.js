import { json, withAuth } from "@/lib/route";
import { listOwnerInvoices } from "@/lib/services/invoices";

export const GET = withAuth("owner", async (req, { user }) => {
  const url = new URL(req.url);
  const r = await listOwnerInvoices(user.id, {
    from: url.searchParams.get("from") || null,
    to: url.searchParams.get("to") || null,
    barberId: url.searchParams.get("barber") || null,
  });
  return json(r);
});

export const dynamic = "force-dynamic";
