import { test } from "node:test";
import assert from "node:assert/strict";
import {
  api,
  setApiWorkspaceScope,
  workspaceRequestHeaders,
} from "../src/modules/shared/infrastructure/api";
test("requests retain the rendered workspace until bootstrap reload, including after a switch response, and logout clears the binding", async () => {
  const previous = globalThis.fetch;
  const requests: { method: string | undefined; headers: Headers }[] = [];
  globalThis.fetch = (async (_url, options) => {
    requests.push({
      method: options?.method,
      headers: new Headers(options?.headers),
    });
    return new Response(JSON.stringify({ user: { tenantId: "new-space" } }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  }) as typeof fetch;
  try {
    setApiWorkspaceScope("old-space");
    await api("auth/workspaces/switch", "POST", { workspaceId: "new-space" });
    assert.equal(requests[0].headers.get("X-Compasso-Workspace"), "old-space");
    assert.equal(
      workspaceRequestHeaders()["X-Compasso-Workspace"],
      "old-space",
    );
    setApiWorkspaceScope("new-space");
    await api("settings", "PATCH", {});
    assert.equal(requests[1].headers.get("X-Compasso-Workspace"), "new-space");
    await api("auth/logout", "POST", {});
    assert.deepEqual(workspaceRequestHeaders(), {});
  } finally {
    globalThis.fetch = previous;
    setApiWorkspaceScope();
  }
});
