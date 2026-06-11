import Link from "next/link";
import { apiJson } from "@/lib/api";

export default async function ShopsBrowse() {
  const data = await apiJson("/public/shops");
  const shops = data?.shops || [];

  return (
    <div className="grid gap-6">
      <div>
        <h1 className="text-3xl font-bold">Find a shop</h1>
        <p className="text-sm text-slate-600">Browse barber shops near you.</p>
      </div>

      {shops.length === 0 ? (
        <div className="card text-center text-slate-600">
          No shops yet. Check back later.
        </div>
      ) : (
        <div className="grid gap-3 md:grid-cols-2">
          {shops.map((s) => (
            <Link
              key={s.id}
              href={`/shops/${s.id}`}
              className="card card-hover block"
            >
              <div className="flex items-start justify-between">
                <div>
                  <p className="font-semibold">{s.name}</p>
                  <p className="text-xs text-slate-500">{s.business_name}</p>
                  <p className="mt-1 text-sm text-slate-600">{s.address || "—"}</p>
                </div>
                <span className="pill">{s.barber_count} barbers</span>
              </div>
              <p className="mt-3 text-xs text-slate-500">
                Open {s.open_hour}:00 → {s.close_hour}:00
              </p>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
