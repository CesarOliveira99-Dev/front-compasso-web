import { test } from "node:test";
import assert from "node:assert/strict";
import { greetingForDate } from "../src/modules/shared/domain/greeting";
test("Solo greetings follow Brasília boundaries regardless of the device timezone", () => {
  for (const [iso, expected] of [
    ["2026-11-13T07:59:00Z", "Boa noite"],
    ["2026-11-13T08:00:00Z", "Bom dia"],
    ["2026-11-13T14:59:00Z", "Bom dia"],
    ["2026-11-13T15:00:00Z", "Boa tarde"],
    ["2026-11-13T20:59:00Z", "Boa tarde"],
    ["2026-11-13T21:00:00Z", "Boa noite"],
  ])
    assert.equal(greetingForDate(new Date(iso), "America/Sao_Paulo"), expected);
});
