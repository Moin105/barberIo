import Link from "next/link";
import { notFound } from "next/navigation";
import { apiJson, getMe } from "@/lib/api";
import BookingPanel from "@/components/BookingPanel";

export default async function BarberPage({ params }) {
  const { id } = await params;
  const data = await apiJson(`/public/barbers/${id}`);
  if (!data) notFound();
  const me = await getMe();
  const { barber, services, rating, reviews } = data;

  return (
    <div className="grid gap-6">
      <div>
        <Link
          href={`/shops/${barber.shop_id}`}
          className="text-xs text-ink-400 hover:text-brand-500"
        >
          ← Back to {barber.shop_name}
        </Link>
        <div className="mt-2 flex items-center gap-4">
          {barber.photo_url ? (
            <img
              src={barber.photo_url}
              alt={barber.name}
              className="h-20 w-20 rounded-full object-cover"
            />
          ) : (
            <div className="flex h-20 w-20 items-center justify-center rounded-full bg-slate-200 text-3xl">
              💈
            </div>
          )}
          <div>
            <h1 className="text-3xl font-bold">{barber.name}</h1>
            <p className="text-sm text-slate-600">
              {barber.shop_name} · {barber.shop_address || "—"}
            </p>
            <p className="mt-1 text-sm">
              {rating.avg ? (
                <>
                  ⭐ {rating.avg.toFixed(1)}{" "}
                  <span className="text-xs text-slate-500">({rating.count} reviews)</span>
                </>
              ) : (
                <span className="text-xs text-slate-500">No reviews yet</span>
              )}
            </p>
          </div>
        </div>
        {barber.bio && <p className="mt-4 text-sm text-slate-700">{barber.bio}</p>}
      </div>

      <BookingPanel
        barber={barber}
        services={services}
        me={me}
      />

      <section>
        <h2 className="mb-3 text-lg font-semibold">Recent reviews</h2>
        {reviews.length === 0 ? (
          <div className="card text-center text-slate-600">No reviews yet.</div>
        ) : (
          <div className="grid gap-3">
            {reviews.map((r, i) => (
              <div key={i} className="card">
                <p className="text-sm font-semibold">
                  {"⭐".repeat(r.stars)}{" "}
                  <span className="ml-2 font-normal text-slate-600">— {r.customer_name}</span>
                </p>
                {r.comment && <p className="mt-1 text-sm text-slate-700">{r.comment}</p>}
                <p className="mt-1 text-xs text-slate-400">
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
