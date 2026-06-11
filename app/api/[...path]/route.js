const API = process.env.API_URL || "http://localhost:4000";

const HOP_BY_HOP = new Set([
  "connection",
  "keep-alive",
  "proxy-authenticate",
  "proxy-authorization",
  "te",
  "trailer",
  "transfer-encoding",
  "upgrade",
  "host",
  "content-length",
]);

async function handler(req, ctx) {
  const params = await ctx.params;
  const subPath = "/" + (params.path || []).join("/");
  const url = new URL(req.url);
  const target = `${API}${subPath}${url.search}`;

  const headers = new Headers();
  for (const [k, v] of req.headers) {
    if (!HOP_BY_HOP.has(k.toLowerCase())) headers.set(k, v);
  }

  const init = {
    method: req.method,
    headers,
    redirect: "manual",
  };
  if (!["GET", "HEAD"].includes(req.method)) {
    init.body = await req.arrayBuffer();
  }

  let upstream;
  try {
    upstream = await fetch(target, init);
  } catch (e) {
    return new Response(
      JSON.stringify({ error: "Backend unreachable. Is the server running?" }),
      { status: 502, headers: { "content-type": "application/json" } }
    );
  }

  const respHeaders = new Headers();
  for (const [k, v] of upstream.headers) {
    if (!HOP_BY_HOP.has(k.toLowerCase())) respHeaders.append(k, v);
  }

  return new Response(upstream.body, {
    status: upstream.status,
    headers: respHeaders,
  });
}

export const GET = handler;
export const POST = handler;
export const PUT = handler;
export const PATCH = handler;
export const DELETE = handler;
export const dynamic = "force-dynamic";
