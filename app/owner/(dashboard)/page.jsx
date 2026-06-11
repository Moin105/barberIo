import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import {
  getOwnerMe,
  listShops,
  listServices,
  dailyReport,
} from "@/lib/services/owner";
import Icon from "@/components/Icon";

const PLAN_LABEL = {
  free: { name: "Free", desc: "1 shop, up to 2 barbers", color: "bg-paper-100 text-ink-700" },
  starter: { name: "Starter", desc: "Small business", color: "bg-amber-50 text-amber-800" },
  pro: { name: "Pro", desc: "Unlimited everything", color: "bg-brand-50 text-brand-700" },
  enterprise: {
    name: "Enterprise",
    desc: "Chains & franchises",
    color: "bg-ink-gradient text-paper-50",
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
    <div className="flex flex-col gap-6">
      <section className="relative overflow-hidden rounded-2xl bg-ink-gradient p-6 text-paper-50">
        <div className="pointer-events-none absolute inset-0 bg-grid bg-[length:30px_30px] opacity-15" />
        <div className="pointer-events-none absolute right-0 top-0 h-full w-2 barber-pole" />
        <div className="relative flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <span className="pill inline-flex items-center gap-1.5 border-paper-50/20 bg-paper-50/10 text-paper-50">
              <Icon name="store" className="h-3.5 w-3.5" /> Owner dashboard
            </span>
            <h1 className="display mt-3 text-3xl">{me?.business?.name || "Your business"}</h1>
            <p className="text-sm text-paper-50/70">Here's how today is shaping up.</p>
          </div>
          <div className={`rounded-xl px-4 py-3 ${planInfo.color}`}>
            <p className="text-[10px] font-bold uppercase tracking-widest opacity-70">Plan</p>
            <p className="display text-2xl">
              {planInfo.name}{" "}
              {me?.subscription?.status !== "active" && (
                <span className="text-sm font-medium opacity-80">
                  · {me?.subscription?.status || "—"}
                </span>
              )}
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

      <div className="flex flex-wrap gap-3">
        <Stat label="Shops" v={shops.length} sub="locations" icon="store" />
        <Stat label="Services" v={services.length} sub="on your menu" icon="scissors" />
        <Stat
          label="Earned · today"
          v={`$${grandCompleted.toFixed(0)}`}
          sub={`$${grandPending.toFixed(0)} still in the chair`}
          icon="wallet"
          highlight
        />
        <Stat
          label="Forecast"
          v={`$${(grandCompleted + grandPending).toFixed(0)}`}
          sub="if every booking shows"
          icon="trend"
        />
      </div>

      <div className="flex items-center justify-between">
        <h2 className="display text-xl text-ink-900">Your shops</h2>
        <Link href="/owner/shops" className="btn-dark">
          Manage shops <Icon name="arrow" className="h-4 w-4" />
        </Link>
      </div>

      {shops.length === 0 ? (
        <div className="card flex flex-col items-center gap-3 text-center">
          <span className="flex h-12 w-12 items-center justify-center rounded-md bg-brand-50 text-brand-700">
            <Icon name="store" className="h-6 w-6" />
          </span>
          <div>
            <p className="display text-xl">Let's open your first shop.</p>
            <p className="mt-1 text-sm text-ink-400">
              Add a location, mark its seats, then invite your barbers.
            </p>
          </div>
          <Link href="/owner/shops" className="btn-primary">
            Add your first shop
          </Link>
        </div>
      ) : (
        <div className="flex flex-wrap gap-3">
          {shops.map((s, i) => {
            const r = reports[i];
            return (
              <Link
                href={`/owner/shops/${s.id}`}
                key={s.id}
                className="card card-hover block w-full md:w-[calc((100%-0.75rem)/2)]"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="font-bold">{s.name}</p>
                    <p className="truncate text-xs text-ink-400">{s.address || "No address"}</p>
                  </div>
                  <span className="pill-brand whitespace-nowrap">
                    {s.barber_count} barbers · {s.seats} seats
                  </span>
                </div>
                <div className="mt-3 flex gap-2 text-sm">
                  <div className="flex-1 rounded-md bg-emerald-50 px-3 py-2">
                    <p className="text-[10px] font-bold uppercase tracking-widest text-emerald-700">
                      Earned
                    </p>
                    <p className="display text-lg text-emerald-700">
                      ${r?.totals?.completed?.toFixed(2) || "0.00"}
                    </p>
                  </div>
                  <div className="flex-1 rounded-md bg-amber-50 px-3 py-2">
                    <p className="text-[10px] font-bold uppercase tracking-widest text-amber-700">
                      In progress
                    </p>
                    <p className="display text-lg text-amber-700">
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

function Stat({ label, v, sub, highlight, icon }) {
  return (
    <div
      className={`flex flex-1 basis-[200px] gap-3 rounded-xl p-4 shadow-soft ${
        highlight
          ? "bg-brand-gradient text-paper-50 border border-brand-600"
          : "border border-ink-100 bg-paper-50"
      }`}
    >
      <span
        className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-md ${
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
        <p className="display text-2xl tabular-nums">{v}</p>
        {sub && (
          <p className={`text-xs ${highlight ? "text-paper-50/80" : "text-ink-400"}`}>{sub}</p>
        )}
      </div>
    </div>
  );
}
