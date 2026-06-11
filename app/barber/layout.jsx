import { redirect } from "next/navigation";
import { getMe } from "@/lib/api";

export default async function BarberLayout({ children }) {
  const me = await getMe();
  if (!me) redirect("/barber/login");
  if (me.role !== "barber") redirect("/");
  return children;
}
