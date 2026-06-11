import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";

export default async function AdminLayout({ children }) {
  const me = await getCurrentUser();
  if (!me) redirect("/admin/login");
  if (me.role !== "super_admin") redirect("/");

  return (
    <div className="grid gap-6 md:grid-cols-[15rem_1fr]">
      <aside className="card h-fit bg-ink-gradient text-white">
        <p className="pill-brand bg-brand-500/15 text-brand-100 border-brand-500/30 w-fit">
          🛡️ Super admin
        </p>
        <p className="mt-2 truncate font-bold">{me.name}</p>
        <p className="truncate text-xs text-white/60">{me.email}</p>
        <nav className="mt-4 grid gap-1 text-sm">
          <Link href="/admin" className="rounded-lg px-2.5 py-2 text-white/80 hover:bg-white/10 hover:text-white">
            📊 Overview
          </Link>
          <Link href="/admin/businesses" className="rounded-lg px-2.5 py-2 text-white/80 hover:bg-white/10 hover:text-white">
            🏪 Businesses
          </Link>
          <Link href="/admin/activity" className="rounded-lg px-2.5 py-2 text-white/80 hover:bg-white/10 hover:text-white">
            ⚡ Recent activity
          </Link>
        </nav>
      </aside>
      <section>{children}</section>
    </div>
  );
}
