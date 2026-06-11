import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { platformStats, listBusinesses } from "@/lib/services/admin";
import Icon from "@/components/Icon";

export default async function AdminOverview() {
  const me = await getCurrentUser();
  if (!me || me.role !== "super_admin") redirect("/admin/login");

  const stats = await platformStats();
  const businesses = (await listBusinesses("")).slice(0, 6);
  const planPills = stats.plans || [];

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="section-title">Platform overview</h1>
        <p className="muted">A bird's-eye view of every shop, barber and booking on Clipper.</p>
      </div>

      <div className="flex flex-wrap gap-3">
        <Stat label="Owners" v={stats.owners} icon="user" />
        <Stat label="Customers" v={stats.customers} icon="users" />
        <Stat label="Barbers" v={stats.barbers} icon="scissors" />
        <Stat label="Shops" v={stats.shops} icon="store" />
        <Stat label="Bookings" v={stats.bookings} icon="calendar" />
        <Stat label="MRR" v={`$${(stats.mrr || 0).toFixed(0)}`} icon="trend" highlight />
      </div>

      <div className="card">
        <div className="flex items-center justify-between">
          <h2 className="display text-lg text-ink-900">Subscription mix</h2>
          <Link
            href="/admin/businesses"
            className="inline-flex items-center gap-1 text-xs font-semibold text-brand-500 hover:underline"
          >
            Manage all <Icon name="arrow" className="h-3.5 w-3.5" />
          </Link>
        </div>
        <div className="mt-4 flex flex-wrap gap-3">
          {["free", "starter", "pro", "enterprise"].map((p) => {
            const found = planPills.find((x) => x.plan === p);
            return (
              <div
                key={p}
                className="flex-1 basis-[140px] rounded-md border border-ink-100 p-3"
              >
                <p className="text-[10px] font-bold uppercase tracking-widest text-ink-400">{p}</p>
                <p className="display mt-1 text-2xl">{found?.n ?? 0}</p>
                <p className="text-xs text-ink-400">businesses</p>
              </div>
            );
          })}
        </div>
      </div>

      <div className="card">
        <div className="flex items-center justify-between">
          <h2 className="display text-lg text-ink-900">Latest businesses</h2>
          <Link
            href="/admin/businesses"
            className="inline-flex items-center gap-1 text-xs font-semibold text-brand-500 hover:underline"
          >
            View all <Icon name="arrow" className="h-3.5 w-3.5" />
          </Link>
        </div>
        <div className="mt-3 divide-y divide-ink-100">
          {businesses.length === 0 && (
            <p className="py-8 text-center text-sm text-ink-400">No businesses signed up yet.</p>
          )}
          {businesses.map((b) => (
            <div key={b.id} className="flex items-center gap-3 py-3 text-sm">
              <span className="flex h-9 w-9 items-center justify-center rounded-md bg-brand-50 text-brand-700">
                <Icon name="store" className="h-4 w-4" />
              </span>
              <div className="min-w-0 flex-1">
                <p className="truncate font-semibold">{b.name}</p>
                <p className="truncate text-xs text-ink-400">
                  {b.owner_name} · {b.owner_email}
                </p>
              </div>
              <span className="pill-slate hidden sm:inline-flex">{b.shop_count} shops</span>
              <span className={`pill ${planColor(b.plan)}`}>{b.plan}</span>
              <span className={`pill ${statusColor(b.status)}`}>{b.status || "—"}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function Stat({ label, v, highlight, icon }) {
  return (
    <div
      className={`flex flex-1 basis-[140px] items-center gap-3 rounded-xl p-4 shadow-soft ${
        highlight
          ? "border border-brand-600 bg-brand-gradient text-paper-50"
          : "border border-ink-100 bg-paper-50"
      }`}
    >
      <span
        className={`flex h-9 w-9 items-center justify-center rounded-md ${
          highlight ? "bg-paper-50/15 text-paper-50" : "bg-brand-50 text-brand-700"
        }`}
      >
        <Icon name={icon} className="h-4 w-4" />
      </span>
      <div className="min-w-0">
        <p
          className={`text-[10px] font-bold uppercase tracking-widest ${
            highlight ? "text-paper-50/80" : "text-ink-400"
          }`}
        >
          {label}
        </p>
        <p className="display text-xl tabular-nums">{v}</p>
      </div>
    </div>
  );
}

function planColor(p) {
  if (p === "free") return "pill-slate";
  if (p === "starter") return "pill-amber";
  if (p === "pro") return "pill-brand";
  if (p === "enterprise") return "pill bg-ink-gradient text-paper-50 border-ink-700";
  return "pill-slate";
}
function statusColor(s) {
  if (s === "active") return "pill-green";
  if (s === "past_due") return "pill-amber";
  if (s === "cancelled") return "pill-slate";
  return "pill-slate";
}
