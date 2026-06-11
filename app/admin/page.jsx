import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { platformStats, listBusinesses } from "@/lib/services/admin";

export default async function AdminOverview() {
  const me = await getCurrentUser();
  if (!me || me.role !== "super_admin") redirect("/admin/login");

  const stats = await platformStats();
  const businesses = (await listBusinesses("")).slice(0, 6);
  const planPills = stats.plans || [];

  return (
    <div className="grid gap-6">
      <div>
        <h1 className="section-title">Platform overview</h1>
        <p className="muted">A bird's-eye view of every shop, barber and booking on Clipper.</p>
      </div>

      <div className="grid gap-3 sm:grid-cols-3 lg:grid-cols-6">
        <Stat label="Owners" v={stats.owners} />
        <Stat label="Customers" v={stats.customers} />
        <Stat label="Barbers" v={stats.barbers} />
        <Stat label="Shops" v={stats.shops} />
        <Stat label="Bookings" v={stats.bookings} />
        <Stat label="MRR" v={`$${(stats.mrr || 0).toFixed(0)}`} highlight />
      </div>

      <div className="card">
        <div className="flex items-center justify-between">
          <h2 className="font-bold">Subscription mix</h2>
          <Link href="/admin/businesses" className="text-xs font-semibold text-brand-500 hover:underline">
            Manage all →
          </Link>
        </div>
        <div className="mt-4 grid gap-3 sm:grid-cols-4">
          {["free", "starter", "pro", "enterprise"].map((p) => {
            const found = planPills.find((x) => x.plan === p);
            return (
              <div key={p} className="rounded-xl border border-ink-100 p-3">
                <p className="text-xs font-bold uppercase tracking-widest text-ink-400">{p}</p>
                <p className="mt-1 text-2xl font-extrabold">{found?.n ?? 0}</p>
                <p className="text-xs text-ink-400">businesses</p>
              </div>
            );
          })}
        </div>
      </div>

      <div className="card">
        <div className="flex items-center justify-between">
          <h2 className="font-bold">Latest businesses</h2>
          <Link href="/admin/businesses" className="text-xs font-semibold text-brand-500 hover:underline">
            View all →
          </Link>
        </div>
        <div className="mt-3 divide-y divide-ink-100">
          {businesses.length === 0 && (
            <p className="py-8 text-center text-sm text-ink-400">No businesses signed up yet.</p>
          )}
          {businesses.map((b) => (
            <div key={b.id} className="flex items-center gap-4 py-3 text-sm">
              <div className="grid h-9 w-9 place-items-center rounded-lg bg-brand-50">💈</div>
              <div className="flex-1">
                <p className="font-semibold">{b.name}</p>
                <p className="text-xs text-ink-400">
                  {b.owner_name} · {b.owner_email}
                </p>
              </div>
              <span className="pill-slate">{b.shop_count} shops</span>
              <span className={`pill ${planColor(b.plan)}`}>{b.plan}</span>
              <span className={`pill ${statusColor(b.status)}`}>{b.status || "—"}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function Stat({ label, v, highlight }) {
  return (
    <div
      className={`rounded-2xl p-4 shadow-soft ${
        highlight
          ? "bg-brand-gradient text-white border border-brand-600"
          : "bg-white border border-ink-100"
      }`}
    >
      <p className={`text-[10px] font-bold uppercase tracking-widest ${highlight ? "text-white/80" : "text-ink-400"}`}>
        {label}
      </p>
      <p className="mt-1 text-2xl font-extrabold">{v}</p>
    </div>
  );
}

function planColor(p) {
  if (p === "free") return "pill-slate";
  if (p === "starter") return "pill-amber";
  if (p === "pro") return "pill-brand";
  if (p === "enterprise") return "pill bg-ink-gradient text-white border-ink-700";
  return "pill-slate";
}
function statusColor(s) {
  if (s === "active") return "pill-green";
  if (s === "past_due") return "pill-amber";
  if (s === "cancelled") return "pill-slate";
  return "pill-slate";
}
