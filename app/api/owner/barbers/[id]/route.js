import { json, err, bodyOf, withAuth } from "@/lib/route";
import {
  getBarberPricing,
  updateBarber,
  deleteBarber,
} from "@/lib/services/owner";

export const GET = withAuth("owner", async (_req, { params, user }) => {
  const p = await params;
  const r = await getBarberPricing(Number(p.id), user.id);
  if (r.error) return err(r.error, r.status);
  return json(r);
});

export const PUT = withAuth("owner", async (req, { params, user }) => {
  const p = await params;
  const body = await bodyOf(req);
  const r = await updateBarber(Number(p.id), user.id, body);
  if (r.error) return err(r.error, r.status);
  return json(r);
});

export const DELETE = withAuth("owner", async (_req, { params, user }) => {
  const p = await params;
  const r = await deleteBarber(Number(p.id), user.id);
  if (r.error) return err(r.error, r.status);
  return json(r);
});

export const dynamic = "force-dynamic";
