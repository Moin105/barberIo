import { one, many, q } from "../db";

export async function notify({ userId, kind, title, body, href }) {
  if (!userId) return null;
  return one(
    `INSERT INTO notifications (user_id, kind, title, body, href)
     VALUES ($1, $2, $3, $4, $5) RETURNING *`,
    [userId, kind, title, body || null, href || null]
  );
}

export async function notifyMany(userIds, payload) {
  const fresh = userIds.filter((id, i, arr) => id && arr.indexOf(id) === i);
  return Promise.all(fresh.map((uid) => notify({ ...payload, userId: uid })));
}

export async function unreadCount(userId) {
  const r = await one(
    "SELECT COUNT(*)::int AS n FROM notifications WHERE user_id = $1 AND read_at IS NULL",
    [userId]
  );
  return r?.n || 0;
}

export async function listNotifications(userId, limit = 25) {
  return many(
    `SELECT * FROM notifications
      WHERE user_id = $1
      ORDER BY created_at DESC LIMIT $2`,
    [userId, limit]
  );
}

export async function markRead(userId, id) {
  await q(
    "UPDATE notifications SET read_at = NOW() WHERE id = $1 AND user_id = $2 AND read_at IS NULL",
    [id, userId]
  );
  return { ok: true };
}

export async function markAllRead(userId) {
  await q(
    "UPDATE notifications SET read_at = NOW() WHERE user_id = $1 AND read_at IS NULL",
    [userId]
  );
  return { ok: true };
}
