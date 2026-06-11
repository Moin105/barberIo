import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";

export default async function OwnerLayout({ children }) {
  const user = await getCurrentUser();
  if (!user) redirect("/owner/login");
  if (user.role !== "owner") redirect("/");

  return (
    <div className="grid gap-6 md:grid-cols-[15rem_1fr]">
      <aside className="card h-fit">
        <p className="pill-brand w-fit">🏪 Owner</p>
        <p className="mt-2 truncate font-bold">{user.name}</p>
        <p className="truncate text-xs text-ink-400">{user.email}</p>
        <nav className="mt-4 grid gap-1 text-sm">
          <Link href="/owner" className="rounded-lg px-2.5 py-2 text-ink-700 hover:bg-ink-50 hover:text-brand-500">
            🏠 Dashboard
          </Link>
          <Link href="/owner/shops" className="rounded-lg px-2.5 py-2 text-ink-700 hover:bg-ink-50 hover:text-brand-500">
            🏪 Shops & barbers
          </Link>
          <Link href="/owner/services" className="rounded-lg px-2.5 py-2 text-ink-700 hover:bg-ink-50 hover:text-brand-500">
            ✂️ Services
          </Link>
        </nav>
        <div className="mt-5 rounded-xl bg-brand-50 p-3 text-xs">
          <p className="font-bold text-brand-700">💡 Tip</p>
          <p className="mt-1 text-brand-700/80">
            Give every barber their own login from the shop page — they'll see who's in
            their chair next.
          </p>
        </div>
      </aside>
      <section>{children}</section>
    </div>
  );
}
