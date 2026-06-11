import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";

export default async function BarberLayout({ children }) {
  const me = await getCurrentUser();
  if (!me) redirect("/barber/login");
  if (me.role !== "barber") redirect("/");
  return children;
}
