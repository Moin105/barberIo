import Link from "next/link";
import { apiJson } from "@/lib/api";
import NewShopForm from "@/components/NewShopForm";

export default async function ShopsPage() {
  const data = await apiJson("/owner/shops");
  const shops = data?.shops || [];

  return (
    <div className="grid gap-6">
      <div>
        <h1 className="text-2xl font-bold">Shops</h1>
        <p className="text-sm text-slate-600">Each shop has its own barbers and seats.</p>
      </div>

      {shops.length === 0 ? (
        <div className="card text-center text-slate-600">No shops yet.</div>
      ) : (
        <div className="grid gap-3">
          {shops.map((s) => (
            <Link
              key={s.id}
              href={`/owner/shops/${s.id}`}
              className="card card-hover flex items-center justify-between"
            >
              <div>
                <p className="font-semibold">{s.name}</p>
                <p className="text-xs text-slate-500">{s.address || "—"}</p>
              </div>
              <div className="text-right text-xs text-slate-500">
                <p>{s.barber_count} barbers</p>
                <p>{s.seats} seats · {s.open_hour}:00–{s.close_hour}:00</p>
              </div>
            </Link>
          ))}
        </div>
      )}

      <NewShopForm />
    </div>
  );
}
