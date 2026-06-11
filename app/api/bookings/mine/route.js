import { json, withAuth } from "@/lib/route";
import { myBookings } from "@/lib/services/bookings";

export const GET = withAuth("customer", async (_req, { user }) =>
  json({ bookings: await myBookings(user.id) })
);

export const dynamic = "force-dynamic";
