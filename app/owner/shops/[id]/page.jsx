import Link from "next/link";
import { notFound } from "next/navigation";
import { apiJson } from "@/lib/api";
import ShopManager from "@/components/ShopManager";

export default async function ShopDetail({ params, searchParams }) {
  const { id } = await params;
  const sp = await searchParams;
  const day = sp?.day || new Date().toISOString().slice(0, 10);

  const data = await apiJson(`/owner/shops/${id}`);
  if (!data) notFound();
  const report = await apiJson(`/owner/shops/${id}/report?day=${day}`);
  const bookings = await apiJson(`/owner/shops/${id}/bookings?day=${day}`);
  const servicesData = await apiJson("/owner/services");

  return (
    <ShopManager
      shop={data.shop}
      barbers={data.barbers}
      services={servicesData?.services || []}
      report={report}
      bookings={bookings?.bookings || []}
      day={day}
    />
  );
}
