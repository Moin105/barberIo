import { getBookingByToken, tokenState } from "@/lib/services/reviews";
import ReviewForm from "@/components/ReviewForm";
import Icon from "@/components/Icon";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function ReviewPage({ params }) {
  const { token } = await params;
  const bk = await getBookingByToken(token);
  const state = tokenState(bk);

  if (state === "invalid")
    return <StateCard kind="error" title="Invalid review link" body="Check the QR code at the shop and try again." />;
  if (state === "not_completed")
    return (
      <StateCard
        kind="info"
        title="Visit not yet complete"
        body="Your barber will complete the visit at the chair and the QR will unlock then."
      />
    );
  if (state === "consumed")
    return (
      <StateCard
        kind="ok"
        title="Already reviewed"
        body="Thanks — only one review per visit. See you next time."
      />
    );
  if (state === "expired")
    return (
      <StateCard
        kind="error"
        title="Review link expired"
        body="Reviews lock 24 hours after the visit. Drop a kind word with your barber directly."
      />
    );

  return <ReviewForm token={token} booking={bk} />;
}

function StateCard({ kind, title, body }) {
  const tone =
    kind === "ok"
      ? "border-emerald-200 bg-emerald-50 text-emerald-900"
      : kind === "error"
      ? "border-brand-200 bg-brand-50 text-brand-700"
      : "border-amber-200 bg-amber-50 text-amber-900";
  return (
    <div className="mx-auto max-w-md py-10">
      <div className={`card border ${tone} text-center`}>
        <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-md bg-paper-50 text-ink-900">
          <Icon name={kind === "ok" ? "check" : kind === "error" ? "x" : "clock"} className="h-6 w-6" />
        </span>
        <h1 className="display mt-3 text-2xl">{title}</h1>
        <p className="mt-1 text-sm">{body}</p>
        <Link href="/shops" className="btn-dark mt-5 inline-flex">
          Browse other shops
        </Link>
      </div>
    </div>
  );
}
