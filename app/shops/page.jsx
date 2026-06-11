import Link from "next/link";
import { listShopsPublic } from "@/lib/services/public";
import Icon from "@/components/Icon";

export default async function ShopsBrowse() {
  const shops = await listShopsPublic();

  return (
    <div className="flex flex-col gap-8">
      <div>
        <span className="eyebrow">Marketplace</span>
        <h1 className="display mt-2 text-4xl text-ink-900">Find a shop</h1>
        <p className="text-sm text-ink-400">Browse barber shops near you.</p>
      </div>

      {shops.length === 0 ? (
        <div className="card text-center text-ink-400">
          No shops yet. Check back later.
        </div>
      ) : (
        <div className="flex flex-wrap gap-3">
          {shops.map((s) => (
            <Link
              key={s.id}
              href={`/shops/${s.id}`}
              className="card card-hover relative block w-full overflow-hidden md:w-[calc((100%-0.75rem)/2)]"
            >
              <span className="pointer-events-none absolute inset-y-0 left-0 w-1 barber-pole" />
              <div className="flex items-start justify-between gap-3 pl-3">
                <div className="min-w-0">
                  <p className="display text-lg text-ink-900">{s.name}</p>
                  <p className="text-xs text-ink-400">{s.business_name}</p>
                  <p className="mt-1 truncate text-sm text-ink-700">{s.address || "—"}</p>
                </div>
                <span className="pill-brand whitespace-nowrap">
                  {s.barber_count} barbers
                </span>
              </div>
              <p className="mt-3 inline-flex items-center gap-1.5 pl-3 text-xs text-ink-400">
                <Icon name="clock" className="h-3.5 w-3.5" />
                Open {s.open_hour}:00 → {s.close_hour}:00
              </p>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
