import Link from "next/link";
import { apiJson, getMe } from "@/lib/api";
import { redirect } from "next/navigation";
import MyBookingsList from "@/components/MyBookingsList";

export default async function MyBookings() {
  const me = await getMe();
  if (!me) redirect("/login");
  if (me.role !== "customer") redirect("/");

  const data = await apiJson("/bookings/mine");
  return <MyBookingsList bookings={data?.bookings || []} />;
}
