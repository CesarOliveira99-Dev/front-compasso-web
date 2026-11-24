import { test } from "node:test";
import assert from "node:assert/strict";
import {
  proxyVisitor,
  proxyHeaders,
} from "../src/modules/bff/domain/proxy-proof";
import { createHmac } from "node:crypto";
const secret = "test-only-proxy-secret-0123456789abcdef";
test("visitor cookies cannot choose or impersonate another anonymous bucket", () => {
  const a = proxyVisitor(undefined, secret),
    b = proxyVisitor(undefined, secret);
  assert.notEqual(a.id, b.id);
  assert.equal(proxyVisitor(a.cookie, secret).id, a.id);
  assert.equal(proxyVisitor(a.cookie, secret).created, false);
  assert.notEqual(
    proxyVisitor(
      a.cookie.replace(/^./, a.cookie[0] === "a" ? "b" : "a"),
      secret,
    ).id,
    a.id,
  );
  assert.notEqual(proxyVisitor(a.cookie + ".extra", secret).id, a.id);
  assert.notEqual(proxyVisitor(a.cookie, secret + "other").id, a.id);
});
test("BFF proof includes only a pseudonymous identifier and signs the target", () => {
  const id = "v1:" + "a".repeat(64),
    time = 1800000000000,
    path = "/v1/auth/me",
    headers = proxyHeaders(id, "GET", path, secret, time);
  assert.deepEqual(Object.keys(headers).sort(), [
    "X-Compasso-Proxy-Signature",
    "X-Compasso-Proxy-Time",
    "X-Compasso-Visitor",
  ]);
  assert.equal(
    headers["X-Compasso-Proxy-Signature"],
    createHmac("sha256", secret)
      .update(`proxy-v1\n${time}\nGET\n${path}\n${id}`)
      .digest("hex"),
  );
  assert.ok(!JSON.stringify(headers).includes(secret));
});
