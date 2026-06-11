import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { barberSchedule, barberStats } from "@/lib/services/barber";
import BarberDashboard from "@/components/BarberDashboard";

export default async function BarberHome({ searchParams }) {
  const me = await getCurrentUser();
  if (!me) redirect("/barber/login");
  if (me.role !== "barber") redirect("/");

  const sp = await searchParams;
  const day = sp?.day || new Date().toISOString().slice(0, 10);
  const schedule = await barberSchedule(me.id, day);
  const stats = await barberStats(me.id);

  return (
    <BarberDashboard
      day={day}
      barber={schedule?.barber}
      bookings={schedule?.bookings || []}
      summary={schedule?.summary}
      stats={stats}
    />
  );
}
