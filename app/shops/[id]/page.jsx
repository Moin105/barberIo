import Link from "next/link";
import { notFound } from "next/navigation";
import { getShopPublic } from "@/lib/services/public";

export default async function ShopPublic({ params }) {
  const { id } = await params;
  const data = await getShopPublic(Number(id));
  if (!data) notFound();
  const { shop, barbers } = data;

  return (
    <div className="grid gap-6">
      <div>
        <Link href="/shops" className="text-xs text-ink-400 hover:text-brand-500">
          ← All shops
        </Link>
        <h1 className="text-3xl font-bold">{shop.name}</h1>
        <p className="text-sm text-ink-400">
          {shop.business_name} · {shop.address || "—"}
        </p>
        <p className="mt-1 text-xs text-ink-400">
          Open {shop.open_hour}:00 → {shop.close_hour}:00
        </p>
      </div>

      <div>
        <h2 className="mb-3 text-lg font-semibold">Our barbers</h2>
        {barbers.length === 0 ? (
          <div className="card text-center text-ink-400">No barbers listed.</div>
        ) : (
          <div className="grid gap-3 md:grid-cols-2">
            {barbers.map((b) => (
              <Link
                key={b.id}
                href={`/barbers/${b.id}`}
                className="card card-hover flex gap-4"
              >
                {b.photo_url ? (
                  <img
                    src={b.photo_url}
                    alt={b.name}
                    className="h-16 w-16 rounded-full object-cover"
                  />
                ) : (
                  <div className="flex h-16 w-16 items-center justify-center rounded-full bg-brand-50 text-2xl">
                    💈
                  </div>
                )}
                <div className="flex-1">
                  <p className="font-semibold">{b.name}</p>
                  <p className="text-[10px] uppercase tracking-widest text-ink-400">
                    Seat {b.seat_number}
                  </p>
                  {b.bio && <p className="mt-1 text-xs text-ink-400">{b.bio}</p>}
                  <p className="mt-2 text-sm">
                    {b.rating_avg ? (
                      <>
                        ⭐ {b.rating_avg.toFixed(1)}{" "}
                        <span className="text-xs text-ink-400">({b.rating_count})</span>
                      </>
                    ) : (
                      <span className="text-xs text-ink-400">No ratings yet</span>
                    )}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
