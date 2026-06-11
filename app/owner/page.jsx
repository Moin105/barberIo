import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import {
  getOwnerMe,
  listShops,
  listServices,
  dailyReport,
} from "@/lib/services/owner";

const PLAN_LABEL = {
  free: { name: "Free", desc: "1 shop, up to 2 barbers", color: "bg-ink-50 text-ink-700" },
  starter: { name: "Starter", desc: "Small business", color: "bg-amber-50 text-amber-800" },
  pro: { name: "Pro", desc: "Unlimited everything", color: "bg-brand-50 text-brand-700" },
  enterprise: {
    name: "Enterprise",
    desc: "Chains & franchises",
    color: "bg-ink-gradient text-white",
  },
};

export default async function OwnerDashboard() {
  const user = await getCurrentUser();
  if (!user || user.role !== "owner") redirect("/owner/login");

  const me = await getOwnerMe(user.id);
  const shops = await listShops(user.id);
  const services = await listServices(user.id);
  const today = new Date().toISOString().slice(0, 10);
  const reports = await Promise.all(
    shops.map((s) => dailyReport(s.id, user.id, today))
  );

  const grandCompleted = reports.reduce((a, r) => a + (r?.totals?.completed || 0), 0);
  const grandPending = reports.reduce((a, r) => a + (r?.totals?.pending || 0), 0);
  const planInfo = PLAN_LABEL[me?.subscription?.plan || "free"];

  return (
    <div className="grid gap-6">
      <section className="relative overflow-hidden rounded-3xl bg-ink-gradient p-6 text-white">
        <div className="absolute inset-0 bg-grid bg-[length:30px_30px] opacity-15" />
        <div className="absolute right-0 top-0 h-full w-3 barber-pole" />
        <div className="relative flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="pill bg-white/15 text-white border-white/20 w-fit">🏪 Owner dashboard</p>
            <h1 className="mt-2 text-3xl font-extrabold">{me?.business?.name || "Your business"}</h1>
            <p className="text-sm text-white/70">Here's how today is shaping up.</p>
          </div>
          <div className={`rounded-2xl px-4 py-3 ${planInfo.color}`}>
            <p className="text-[10px] font-bold uppercase tracking-widest opacity-70">Plan</p>
            <p className="text-xl font-extrabold">
              {planInfo.name}{" "}
              <span className="text-sm font-medium opacity-80">
                {me?.subscription?.status === "active" ? "" : `· ${me?.subscription?.status || "—"}`}
              </span>
            </p>
            <p className="text-xs opacity-80">{planInfo.desc}</p>
            {me?.subscription?.current_period_end && me.subscription.plan !== "free" && (
              <p className="mt-1 text-[10px] uppercase tracking-widest opacity-70">
                renews {new Date(me.subscription.current_period_end).toLocaleDateString()}
              </p>
            )}
          </div>
        </div>
      </section>

      <div className="grid gap-3 sm:grid-cols-4">
        <Stat label="Shops" v={shops.length} sub="locations" />
        <Stat label="Services" v={services.length} sub="on your menu" />
        <Stat
          label={`Earned · today`}
          v={`$${grandCompleted.toFixed(0)}`}
          sub={`$${grandPending.toFixed(0)} still in the chair`}
          highlight
        />
        <Stat
          label="Forecast"
          v={`$${(grandCompleted + grandPending).toFixed(0)}`}
          sub="if every booking shows"
        />
      </div>

      <div className="flex items-center justify-between">
        <h2 className="font-bold">Your shops</h2>
        <Link href="/owner/shops" className="btn-dark">
          Manage shops →
        </Link>
      </div>

      {shops.length === 0 ? (
        <div className="card text-center">
          <p className="text-2xl">🏪</p>
          <p className="mt-1 font-bold">Let's open your first shop.</p>
          <p className="text-sm text-ink-400">
            Add a location, mark its seats, then invite your barbers.
          </p>
          <Link href="/owner/shops" className="btn-primary mt-3 inline-flex">
            Add your first shop
          </Link>
        </div>
      ) : (
        <div className="grid gap-3 md:grid-cols-2">
          {shops.map((s, i) => {
            const r = reports[i];
            return (
              <Link
                href={`/owner/shops/${s.id}`}
                key={s.id}
                className="card card-hover block"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <p className="font-bold">{s.name}</p>
                    <p className="text-xs text-ink-400">{s.address || "No address"}</p>
                  </div>
                  <span className="pill-brand">
                    {s.barber_count} barbers · {s.seats} seats
                  </span>
                </div>
                <div className="mt-3 grid grid-cols-2 gap-2 text-sm">
                  <div className="rounded-lg bg-emerald-50 px-3 py-2">
                    <p className="text-[10px] font-bold uppercase tracking-widest text-emerald-700">
                      Earned
                    </p>
                    <p className="text-lg font-extrabold text-emerald-700">
                      ${r?.totals?.completed?.toFixed(2) || "0.00"}
                    </p>
                  </div>
                  <div className="rounded-lg bg-amber-50 px-3 py-2">
                    <p className="text-[10px] font-bold uppercase tracking-widest text-amber-700">
                      In progress
                    </p>
                    <p className="text-lg font-extrabold text-amber-700">
                      ${r?.totals?.pending?.toFixed(2) || "0.00"}
                    </p>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}

function Stat({ label, v, sub, highlight }) {
  return (
    <div
      className={`rounded-2xl p-4 shadow-soft ${
        highlight
          ? "bg-brand-gradient text-white border border-brand-600"
          : "bg-white border border-ink-100"
      }`}
    >
      <p
        className={`text-[10px] font-bold uppercase tracking-widest ${
          highlight ? "text-white/80" : "text-ink-400"
        }`}
      >
        {label}
      </p>
      <p className="mt-1 text-2xl font-extrabold tabular-nums">{v}</p>
      {sub && (
        <p className={`text-xs ${highlight ? "text-white/80" : "text-ink-400"}`}>{sub}</p>
      )}
    </div>
  );
}
