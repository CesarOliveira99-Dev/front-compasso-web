import { createHmac, randomBytes, timingSafeEqual } from "node:crypto";
const sign = (value: string, secret: string) =>
  createHmac("sha256", secret).update(value).digest("hex");
/** Visitor cookies and proxy claims have distinct signatures and are never an authorization credential. */
export function proxyVisitor(cookie: string | undefined, secret: string) {
  const [id, mac, ...extra] = (cookie || "").split(".");
  if (
    !extra.length &&
    /^[a-f0-9]{64}$/.test(id || "") &&
    /^[a-f0-9]{64}$/.test(mac || "") &&
    timingSafeEqual(
      Buffer.from(sign("visitor-v1\n" + id, secret), "hex"),
      Buffer.from(mac, "hex"),
    )
  )
    return {
      cookie: cookie!,
      id: "v1:" + sign("bucket-v1\n" + id, secret),
      created: false,
    };
  const next = randomBytes(32).toString("hex");
  return {
    cookie: next + "." + sign("visitor-v1\n" + next, secret),
    id: "v1:" + sign("bucket-v1\n" + next, secret),
    created: true,
  };
}
export function proxyHeaders(
  id: string,
  method: string,
  path: string,
  secret: string,
  now = Date.now(),
) {
  const time = String(now);
  return {
    "X-Compasso-Visitor": id,
    "X-Compasso-Proxy-Time": time,
    "X-Compasso-Proxy-Signature": sign(
      `proxy-v1\n${time}\n${method.toUpperCase()}\n${path}\n${id}`,
      secret,
    ),
  };
}
