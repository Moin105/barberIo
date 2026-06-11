import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { listShops } from "@/lib/services/owner";
import NewShopForm from "@/components/NewShopForm";

export default async function ShopsPage() {
  const user = await getCurrentUser();
  if (!user || user.role !== "owner") redirect("/owner/login");
  const shops = await listShops(user.id);

  return (
    <div className="grid gap-6">
      <div>
        <h1 className="section-title">Shops</h1>
        <p className="muted">Each shop has its own barbers and seats.</p>
      </div>

      {shops.length === 0 ? (
        <div className="card text-center text-ink-400">No shops yet.</div>
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
                <p className="text-xs text-ink-400">{s.address || "—"}</p>
              </div>
              <div className="text-right text-xs text-ink-400">
                <p>{s.barber_count} barbers</p>
                <p>
                  {s.seats} seats · {s.open_hour}:00–{s.close_hour}:00
                </p>
              </div>
            </Link>
          ))}
        </div>
      )}

      <NewShopForm />
    </div>
  );
}
