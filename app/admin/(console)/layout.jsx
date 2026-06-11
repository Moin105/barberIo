import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import Icon from "@/components/Icon";

export default async function AdminLayout({ children }) {
  const me = await getCurrentUser();
  if (!me) redirect("/admin/login");
  if (me.role !== "super_admin") redirect("/");

  const nav = [
    { href: "/admin", label: "Overview", icon: "trend" },
    { href: "/admin/businesses", label: "Businesses", icon: "store" },
    { href: "/admin/activity", label: "Recent activity", icon: "bolt" },
  ];

  return (
    <div className="flex flex-col gap-6 md:flex-row">
      <aside className="card h-fit w-full bg-ink-gradient text-paper-50 md:w-60 md:shrink-0">
        <span className="inline-flex w-fit items-center gap-1.5 rounded-full border border-brand-500/40 bg-brand-500/15 px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-widest text-brand-200">
          <Icon name="shield" className="h-3.5 w-3.5" /> Super admin
        </span>
        <p className="mt-3 truncate font-bold">{me.name}</p>
        <p className="truncate text-xs text-paper-50/60">{me.email}</p>
        <nav className="mt-4 flex flex-col gap-0.5 text-sm">
          {nav.map((n) => (
            <Link
              key={n.href}
              href={n.href}
              className="flex items-center gap-2 rounded-md px-2.5 py-2 text-paper-50/80 hover:bg-paper-50/10 hover:text-paper-50"
            >
              <Icon name={n.icon} className="h-4 w-4" />
              {n.label}
            </Link>
          ))}
        </nav>
      </aside>
      <section className="min-w-0 flex-1">{children}</section>
    </div>
  );
}
