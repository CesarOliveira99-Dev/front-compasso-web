import { test } from "node:test";
import assert from "node:assert/strict";
import { isWorkspacePath } from "../src/modules/bff/domain/workspace-route";
test("staff tool proxy accepts only supported paths without traversal or unrelated routes", () => {
  for (const path of [
    "preferences",
    "analytics",
    "export",
    "contacts",
    "customers",
    "customers/a-b",
    "customers/a-b/reward",
    "customers/a-b/redeem",
    "appointments/a-b/style",
  ])
    assert.equal(isWorkspacePath(`workspace/${path}`), true, path);
  for (const path of [
    "workspace",
    "workspace/admin",
    "workspace/customers/../settings",
    "workspace/customers/a/password",
    "workspace/appointments/a",
    "workspace/export/extra",
    "payments/subscribe",
  ])
    assert.equal(isWorkspacePath(path), false, path);
});
