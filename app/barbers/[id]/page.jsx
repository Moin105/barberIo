import Link from "next/link";
import { notFound } from "next/navigation";
import { getBarberPublic } from "@/lib/services/public";
import { getCurrentUser } from "@/lib/auth";
import BookingPanel from "@/components/BookingPanel";
import Icon from "@/components/Icon";

export default async function BarberPage({ params }) {
  const { id } = await params;
  const data = await getBarberPublic(Number(id));
  if (!data) notFound();
  const me = await getCurrentUser();
  const { barber, services, rating, reviews } = data;

  return (
    <div className="flex flex-col gap-8">
      <div>
        <Link
          href={`/shops/${barber.shop_id}`}
          className="inline-flex items-center gap-1 text-xs text-ink-400 hover:text-brand-500"
        >
          <Icon name="arrow" className="h-3.5 w-3.5 -scale-x-100" /> Back to {barber.shop_name}
        </Link>
        <div className="mt-3 flex items-center gap-5">
          {barber.photo_url ? (
            <img
              src={barber.photo_url}
              alt={barber.name}
              className="h-20 w-20 rounded-md object-cover"
            />
          ) : (
            <div className="flex h-20 w-20 items-center justify-center rounded-md bg-brand-50 text-brand-700">
              <Icon name="user" className="h-10 w-10" />
            </div>
          )}
          <div>
            <h1 className="display text-3xl text-ink-900">{barber.name}</h1>
            <p className="text-sm text-ink-400">
              {barber.shop_name} · Seat {barber.seat_number} · {barber.shop_address || "—"}
            </p>
            <p className="mt-1 inline-flex items-center gap-1 text-sm">
              {rating.avg ? (
                <>
                  <Icon name="star" className="h-4 w-4 text-brass-500" filled />
                  <span className="font-semibold">{rating.avg.toFixed(1)}</span>
                  <span className="text-xs text-ink-400">({rating.count} reviews)</span>
                </>
              ) : (
                <span className="text-xs text-ink-400">No reviews yet</span>
              )}
            </p>
          </div>
        </div>
        {barber.bio && <p className="mt-4 max-w-2xl text-sm text-ink-700">{barber.bio}</p>}
      </div>

      <BookingPanel barber={barber} services={services} me={me} />

      <section>
        <h2 className="display mb-3 text-xl text-ink-900">Recent reviews</h2>
        {reviews.length === 0 ? (
          <div className="card text-center text-ink-400">No reviews yet.</div>
        ) : (
          <div className="flex flex-col gap-3">
            {reviews.map((r, i) => (
              <div key={i} className="card">
                <p className="flex items-center gap-0.5 text-brass-500">
                  {Array.from({ length: r.stars }).map((_, k) => (
                    <Icon key={k} name="star" className="h-4 w-4" filled />
                  ))}
                  <span className="ml-2 text-xs font-normal text-ink-400">— {r.customer_name}</span>
                </p>
                {r.comment && <p className="mt-2 text-sm text-ink-700">{r.comment}</p>}
                <p className="mt-1 text-xs text-ink-400">
                  {new Date(r.created_at).toLocaleDateString()}
                </p>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
