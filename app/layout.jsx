import "./globals.css";
import Link from "next/link";
import Logo from "@/components/Logo";
import Icon from "@/components/Icon";
import { getMe } from "@/lib/api";

export const metadata = {
  title: "Clipper — The Operating System for Barber Shops",
  description:
    "Multi-shop CMS for barber businesses: shops, seats, barbers, bookings and daily totals — all in one place.",
};

const ROLE_HOME = {
  super_admin: { href: "/admin", label: "Admin console" },
  owner: { href: "/owner", label: "Owner dashboard" },
  barber: { href: "/barber", label: "My schedule" },
  customer: { href: "/my-bookings", label: "My bookings" },
};

export default async function RootLayout({ children }) {
  const user = await getMe();
  const home = user ? ROLE_HOME[user.role] : null;

  return (
    <html lang="en">
      <body className="flex min-h-screen flex-col">
        <header className="sticky top-0 z-30 border-b border-ink-100/70 bg-paper-50/85 backdrop-blur">
          <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-6 py-3.5">
            <Logo />
            <nav className="flex items-center gap-3 text-sm">
              {!user && (
                <>
                  <Link href="/shops" className="hidden text-ink-700 hover:text-brand-500 sm:inline">
                    Find a shop
                  </Link>
                  <Link href="/login" className="hidden text-ink-700 hover:text-brand-500 sm:inline">
                    Sign in
                  </Link>
                  <Link href="/owner/signup" className="btn-primary">
                    Open your shop
                  </Link>
                </>
              )}
              {user && (
                <>
                  {user.role === "customer" && (
                    <Link href="/shops" className="hidden text-ink-700 hover:text-brand-500 sm:inline">
                      Browse shops
                    </Link>
                  )}
                  {home && (
                    <Link href={home.href} className="btn-ghost">
                      {home.label}
                    </Link>
                  )}
                  <Link
                    href="/logout"
                    className="inline-flex items-center gap-1 text-xs text-ink-400 hover:text-ink-900"
                    title="Sign out"
                  >
                    <Icon name="x" className="h-3.5 w-3.5" />
                    Sign out
                  </Link>
                </>
              )}
            </nav>
          </div>
        </header>

        <main className="mx-auto w-full max-w-6xl flex-1 px-6 py-8">{children}</main>

        <footer className="mt-auto border-t border-ink-100/60 bg-paper-50/60">
          <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-3 px-6 py-6 text-xs text-ink-400 sm:flex-row">
            <p>© {new Date().getFullYear()} Clipper. Built for barbers, by barbers.</p>
            <div className="flex flex-wrap gap-4">
              <Link href="/shops" className="hover:text-brand-500">For customers</Link>
              <Link href="/owner/signup" className="hover:text-brand-500">For owners</Link>
              <Link href="/barber/login" className="hover:text-brand-500">Barber login</Link>
              <Link href="/admin/login" className="hover:text-brand-500">Admin</Link>
            </div>
          </div>
        </footer>
      </body>
    </html>
  );
}
