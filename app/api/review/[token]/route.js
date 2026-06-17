import { json, err, bodyOf, withTry } from "@/lib/route";
import { getBookingByToken, tokenState, redeemReviewToken } from "@/lib/services/reviews";

export const GET = withTry(async (_req, { params }) => {
  const p = await params;
  const bk = await getBookingByToken(p.token);
  const state = tokenState(bk);
  if (state === "invalid") return err("Invalid review link", 404);
  return json({
    state,
    booking: bk && {
      customer_name: bk.customer_name,
      barber_name: bk.barber_name,
      photo_url: bk.photo_url,
      shop_name: bk.shop_name,
      business_name: bk.business_name,
      service_name: bk.service_name,
      start_at: bk.start_at,
      price: bk.price,
      expires_at: bk.review_token_expires_at,
    },
  });
});

export const POST = withTry(async (req, { params }) => {
  const p = await params;
  const body = await bodyOf(req);
  const r = await redeemReviewToken({ token: p.token, ...body });
  if (r.error) return err(r.error, r.status);
  return json(r);
});

export const dynamic = "force-dynamic";
