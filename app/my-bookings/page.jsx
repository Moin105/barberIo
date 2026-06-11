import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { myBookings } from "@/lib/services/bookings";
import MyBookingsList from "@/components/MyBookingsList";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function MyBookings() {
  const me = await getCurrentUser();
  if (!me) redirect("/login");
  if (me.role !== "customer") redirect("/");
  const bookings = await myBookings(me.id);
  return <MyBookingsList bookings={bookings} />;
}
