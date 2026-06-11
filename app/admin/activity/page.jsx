import { recentActivity } from "@/lib/services/admin";

export default async function AdminActivity() {
  const items = await recentActivity();

  return (
    <div className="grid gap-6">
      <div>
        <h1 className="section-title">Recent activity</h1>
        <p className="muted">Last 20 bookings across every shop on Clipper.</p>
      </div>

      <div className="card divide-y divide-ink-100 p-0">
        {items.length === 0 && (
          <p className="py-10 text-center text-sm text-ink-400">No activity yet.</p>
        )}
        {items.map((a) => (
          <div key={`${a.kind}-${a.id}`} className="flex items-center gap-4 px-5 py-3 text-sm">
            <div className="grid h-9 w-9 place-items-center rounded-lg bg-ink-50">
              {a.status === "completed" ? "✅" : a.status === "cancelled" ? "🚫" : "📅"}
            </div>
            <div className="flex-1">
              <p className="font-semibold">
                {a.customer_name} <span className="text-ink-400">booked with</span> {a.barber_name}
              </p>
              <p className="text-xs text-ink-400">{a.business_name}</p>
            </div>
            <span className="font-bold">${a.price.toFixed(2)}</span>
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
            <span className="text-xs text-ink-400">
              {new Date(a.created_at).toLocaleString([], {
                month: "short",
                day: "numeric",
                hour: "2-digit",
                minute: "2-digit",
              })}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
