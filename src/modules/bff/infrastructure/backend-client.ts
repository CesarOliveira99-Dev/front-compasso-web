import { cookies } from "next/headers";
import { proxyHeaders, proxyVisitor } from "../domain/proxy-proof";
import "server-only";
const backendUrl = process.env.BACKEND_URL || "http://127.0.0.1:4000/v1";
export async function backend(
  path: string,
  init?: RequestInit,
): Promise<Response> {
  const store = await cookies(),
    token = store.get("compasso_session")?.value,
    secret = process.env.BFF_PROXY_SECRET;
  if (process.env.NODE_ENV === "production" && (!secret || secret.length < 32))
    throw new Error("Configure BFF_PROXY_SECRET no frontend e na API.");
  const url = new URL(`${backendUrl}/${path}`),
    headers = new Headers(init?.headers),
    method = init?.method || "GET";
  // Network headers supplied by a caller never select another visitor's budget.
  for (const key of [
    "x-compasso-visitor",
    "x-compasso-proxy-time",
    "x-compasso-proxy-signature",
    "x-forwarded-for",
    "x-real-ip",
    "forwarded",
    "authorization",
  ])
    headers.delete(key);
  headers.set(
    "Content-Type",
    headers.get("Content-Type") || "application/json",
  );
  if (token) headers.set("Authorization", `Bearer ${token}`);
  if (secret && secret.length >= 32) {
    const visitor = proxyVisitor(store.get("compasso_visitor")?.value, secret);
    // Public media can be cached; never attach a visitor cookie to that response.
    const publicMedia = path.startsWith("media/") && method === "GET";
    if (visitor.created && !publicMedia)
      store.set("compasso_visitor", visitor.cookie, {
        httpOnly: true,
        sameSite: "lax",
        secure: process.env.NODE_ENV === "production",
        path: "/",
        maxAge: 86400,
      });
    for (const [key, value] of Object.entries(
      proxyHeaders(visitor.id, method, url.pathname + url.search, secret),
    ))
      headers.set(key, value);
  }
  return fetch(url, {
    ...init,
    cache: "no-store",
    signal: AbortSignal.timeout(25000),
    headers,
  });
}
