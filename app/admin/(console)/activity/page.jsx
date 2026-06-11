import { recentActivity } from "@/lib/services/admin";
import Icon from "@/components/Icon";

const STATUS_ICON = {
  completed: { name: "check", className: "bg-emerald-50 text-emerald-700" },
  cancelled: { name: "x", className: "bg-paper-100 text-ink-400" },
  booked: { name: "calendar", className: "bg-amber-50 text-amber-700" },
};

export default async function AdminActivity() {
  const items = await recentActivity();

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="section-title">Recent activity</h1>
        <p className="muted">Last 20 bookings across every shop on Clipper.</p>
      </div>

      <div className="card divide-y divide-ink-100 p-0">
        {items.length === 0 && (
          <p className="py-10 text-center text-sm text-ink-400">No activity yet.</p>
        )}
        {items.map((a) => {
          const s = STATUS_ICON[a.status] || STATUS_ICON.booked;
          return (
            <div key={`${a.kind}-${a.id}`} className="flex items-center gap-3 px-5 py-3 text-sm">
              <span className={`flex h-9 w-9 items-center justify-center rounded-md ${s.className}`}>
                <Icon name={s.name} className="h-4 w-4" />
              </span>
              <div className="min-w-0 flex-1">
                <p className="truncate font-semibold">
                  {a.customer_name} <span className="text-ink-400">booked with</span>{" "}
                  {a.barber_name}
                </p>
                <p className="truncate text-xs text-ink-400">{a.business_name}</p>
              </div>
              <span className="display whitespace-nowrap text-base">${a.price.toFixed(2)}</span>
              <span
                className={`pill ${
                  a.status === "completed"
                    ? "pill-green"
                    : a.status === "cancelled"
                    ? "pill-slate"
                    : "pill-amber"
                }`}
              >
                {a.status}
              </span>
              <span className="hidden text-xs text-ink-400 sm:inline">
                {new Date(a.created_at).toLocaleString([], {
                  month: "short",
                  day: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
