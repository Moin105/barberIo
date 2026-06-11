import { apiJson } from "@/lib/api";
import BarberDashboard from "@/components/BarberDashboard";

export default async function BarberHome({ searchParams }) {
  const sp = await searchParams;
  const day = sp?.day || new Date().toISOString().slice(0, 10);

  const schedule = await apiJson(`/barber/schedule?day=${day}`);
  const stats = await apiJson(`/barber/stats`);

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
