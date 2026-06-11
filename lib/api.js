import { cookies, headers } from "next/headers";

const API = process.env.API_URL || "http://localhost:4000";

export async function api(path, init = {}) {
  const cookieStr = cookies().toString();
  const res = await fetch(`${API}${path}`, {
    ...init,
    headers: {
      "content-type": "application/json",
      ...(init.headers || {}),
      cookie: cookieStr,
    },
    cache: "no-store",
  });
  return res;
}

export async function apiJson(path, init) {
  const res = await api(path, init);
  if (!res.ok) return null;
  return res.json();
}

export async function getMe() {
  const res = await api("/auth/me");
  if (!res.ok) return null;
  const json = await res.json();
  return json.user;
}
