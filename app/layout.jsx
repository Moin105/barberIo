import "./globals.css";
import Link from "next/link";
import Logo from "@/components/Logo";
import { getMe } from "@/lib/api";

export const metadata = {
  title: "Clipper — The OS for Barber Shops",
  description:
    "Multi-shop CMS for barber businesses: barbers, seats, services, bookings, and end-of-day totals — all in one platform.",
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
      <body>
        <header className="sticky top-0 z-30 border-b border-ink-100/70 bg-white/85 backdrop-blur">
          <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-6 py-3.5">
            <Logo />
            <nav className="flex items-center gap-3 text-sm">
              {!user && (
                <>
                  <Link href="/shops" className="hidden sm:inline text-ink-700 hover:text-brand-500">
                    Find a shop
                  </Link>
                  <Link href="/login" className="hidden sm:inline text-ink-700 hover:text-brand-500">
                    Sign in
                  </Link>
                  <Link href="/owner/signup" className="btn-primary">
                    Get started
                  </Link>
                </>
              )}
              {user && (
                <>
                  {user.role === "customer" && (
                    <Link href="/shops" className="hidden sm:inline text-ink-700 hover:text-brand-500">
                      Browse shops
                    </Link>
                  )}
                  {home && (
                    <Link href={home.href} className="btn-ghost">
                      {home.label}
                    </Link>
                  )}
                  <Link href="/logout" className="text-ink-400 hover:text-ink-900 text-xs">
                    Sign out
                  </Link>
                </>
              )}
            </nav>
          </div>
        </header>
        <main className="mx-auto w-full max-w-6xl px-6 py-8">{children}</main>
        <footer className="border-t border-ink-100/60 bg-white/60">
          <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-3 px-6 py-6 text-xs text-ink-400 sm:flex-row">
            <p>© {new Date().getFullYear()} Clipper. Built for barbers, by barbers.</p>
            <div className="flex gap-4">
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
