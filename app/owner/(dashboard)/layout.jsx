import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import Icon from "@/components/Icon";

export default async function OwnerLayout({ children }) {
  const user = await getCurrentUser();
  if (!user) redirect("/owner/login");
  if (user.role !== "owner") redirect("/");

  const nav = [
    { href: "/owner", label: "Dashboard", icon: "home" },
    { href: "/owner/shops", label: "Shops & barbers", icon: "store" },
    { href: "/owner/services", label: "Services", icon: "scissors" },
  ];

  return (
    <div className="flex flex-col gap-6 md:flex-row">
      <aside className="card h-fit w-full md:w-60 md:shrink-0">
        <span className="pill-brand inline-flex w-fit items-center gap-1.5">
          <Icon name="store" className="h-3.5 w-3.5" /> Owner
        </span>
        <p className="mt-3 truncate font-bold">{user.name}</p>
        <p className="truncate text-xs text-ink-400">{user.email}</p>
        <nav className="mt-4 flex flex-col gap-0.5 text-sm">
          {nav.map((n) => (
            <Link
              key={n.href}
              href={n.href}
              className="flex items-center gap-2 rounded-md px-2.5 py-2 text-ink-700 hover:bg-paper-100 hover:text-brand-500"
            >
              <Icon name={n.icon} className="h-4 w-4" />
              {n.label}
            </Link>
          ))}
        </nav>
        <div className="mt-5 rounded-md border border-brand-100 bg-brand-50/60 p-3 text-xs">
          <p className="font-bold uppercase tracking-widest text-brand-700">Tip</p>
          <p className="mt-1 text-brand-700/80">
            Give every barber their own login from the shop page — they'll see who's in
            their chair next.
          </p>
        </div>
      </aside>
      <section className="min-w-0 flex-1">{children}</section>
    </div>
  );
}
