import { notFound, redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import {
  getShopDetail,
  dailyReport,
  shopBookings,
  listServices,
} from "@/lib/services/owner";
import ShopManager from "@/components/ShopManager";

export default async function ShopDetail({ params, searchParams }) {
  const user = await getCurrentUser();
  if (!user || user.role !== "owner") redirect("/owner/login");

  const { id } = await params;
  const sp = await searchParams;
  const day = sp?.day || new Date().toISOString().slice(0, 10);

  const data = await getShopDetail(Number(id), user.id);
  if (data.error) notFound();
  const report = await dailyReport(Number(id), user.id, day);
  const bookings = await shopBookings(Number(id), user.id, day);
  const services = await listServices(user.id);

  return (
    <ShopManager
      shop={data.shop}
      barbers={data.barbers}
      services={services}
      report={report}
      bookings={bookings?.bookings || []}
      day={day}
    />
  );
}
