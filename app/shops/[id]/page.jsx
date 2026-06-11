import Link from "next/link";
import { notFound } from "next/navigation";
import { getShopPublic } from "@/lib/services/public";
import Icon from "@/components/Icon";

export default async function ShopPublic({ params }) {
  const { id } = await params;
  const data = await getShopPublic(Number(id));
  if (!data) notFound();
  const { shop, barbers } = data;

  return (
    <div className="flex flex-col gap-8">
      <div>
        <Link
          href="/shops"
          className="inline-flex items-center gap-1 text-xs text-ink-400 hover:text-brand-500"
        >
          <Icon name="arrow" className="h-3.5 w-3.5 -scale-x-100" /> All shops
        </Link>
        <h1 className="display mt-2 text-4xl text-ink-900">{shop.name}</h1>
        <p className="text-sm text-ink-400">
          {shop.business_name} · {shop.address || "—"}
        </p>
        <p className="mt-1 inline-flex items-center gap-1.5 text-xs text-ink-400">
          <Icon name="clock" className="h-3.5 w-3.5" />
          Open {shop.open_hour}:00 → {shop.close_hour}:00
        </p>
      </div>

      <div>
        <h2 className="display mb-3 text-xl text-ink-900">Our barbers</h2>
        {barbers.length === 0 ? (
          <div className="card text-center text-ink-400">No barbers listed.</div>
        ) : (
          <div className="flex flex-wrap gap-3">
            {barbers.map((b) => (
              <Link
                key={b.id}
                href={`/barbers/${b.id}`}
                className="card card-hover flex w-full gap-4 md:w-[calc((100%-0.75rem)/2)]"
              >
                {b.photo_url ? (
                  <img
                    src={b.photo_url}
                    alt={b.name}
                    className="h-16 w-16 rounded-md object-cover"
                  />
                ) : (
                  <div className="flex h-16 w-16 items-center justify-center rounded-md bg-brand-50 text-brand-700">
                    <Icon name="user" className="h-7 w-7" />
                  </div>
                )}
                <div className="min-w-0 flex-1">
                  <p className="display text-lg text-ink-900">{b.name}</p>
                  <p className="text-[10px] uppercase tracking-widest text-ink-400">
                    Seat {b.seat_number}
                  </p>
                  {b.bio && <p className="mt-1 line-clamp-2 text-xs text-ink-400">{b.bio}</p>}
                  <p className="mt-2 inline-flex items-center gap-1 text-sm">
                    {b.rating_avg ? (
                      <>
                        <Icon name="star" className="h-4 w-4 text-brass-500" filled />
                        <span className="font-semibold">{b.rating_avg.toFixed(1)}</span>
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
