import { one, many, q } from "../db";
import { getOrCreateBusiness } from "./owner";

export async function listOwnerPromotions(ownerId) {
  const biz = await getOrCreateBusiness(ownerId);
  return many(
    `SELECT * FROM promotions WHERE business_id = $1 ORDER BY created_at DESC`,
    [biz.id]
  );
}

export async function createPromotion(ownerId, data) {
  const biz = await getOrCreateBusiness(ownerId);
  const { title, body, image_url, cta_label, cta_href, starts_at, ends_at, active } = data || {};
  if (!title || !body)
    return { error: "title and body are required", status: 400 };
  const row = await one(
    `INSERT INTO promotions
       (business_id, title, body, image_url, cta_label, cta_href, starts_at, ends_at, active)
     VALUES ($1, $2, $3, $4, $5, $6,
             COALESCE($7::timestamptz, NOW()),
             $8::timestamptz,
             COALESCE($9::boolean, true))
     RETURNING *`,
    [
      biz.id,
      title,
      body,
      image_url || null,
      cta_label || null,
      cta_href || null,
      starts_at || null,
      ends_at || null,
      active,
    ]
  );
  return { promotion: row };
}

export async function updatePromotion(ownerId, id, patch) {
  const biz = await getOrCreateBusiness(ownerId);
  const promo = await one(
    "SELECT * FROM promotions WHERE id = $1 AND business_id = $2",
    [id, biz.id]
  );
  if (!promo) return { error: "Promotion not found", status: 404 };
  const { title, body, image_url, cta_label, cta_href, starts_at, ends_at, active } = patch || {};
  const updated = await one(
    `UPDATE promotions SET
        title       = COALESCE($1, title),
        body        = COALESCE($2, body),
        image_url   = COALESCE($3, image_url),
        cta_label   = COALESCE($4, cta_label),
        cta_href    = COALESCE($5, cta_href),
        starts_at   = COALESCE($6::timestamptz, starts_at),
        ends_at     = COALESCE($7::timestamptz, ends_at),
        active      = COALESCE($8::boolean, active)
      WHERE id = $9 RETURNING *`,
    [
      title ?? null,
      body ?? null,
      image_url ?? null,
      cta_label ?? null,
      cta_href ?? null,
      starts_at ?? null,
      ends_at ?? null,
      typeof active === "boolean" ? active : null,
      id,
    ]
  );
  return { promotion: updated };
}

export async function deletePromotion(ownerId, id) {
  const biz = await getOrCreateBusiness(ownerId);
  const r = await one(
    "DELETE FROM promotions WHERE id = $1 AND business_id = $2 RETURNING id",
    [id, biz.id]
  );
  if (!r) return { error: "Promotion not found", status: 404 };
  return { ok: true };
}

export async function listActivePromotions(limit = 6) {
  return many(
    `SELECT p.id, p.title, p.body, p.image_url, p.cta_label, p.cta_href,
            p.starts_at, p.ends_at,
            biz.name AS business_name, biz.id AS business_id
       FROM promotions p
       JOIN businesses biz ON biz.id = p.business_id
      WHERE p.active = TRUE
        AND (p.starts_at IS NULL OR p.starts_at <= NOW())
        AND (p.ends_at   IS NULL OR p.ends_at   >  NOW())
      ORDER BY p.created_at DESC
      LIMIT $1`,
    [limit]
  );
}
