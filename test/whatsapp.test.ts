import { test } from "node:test";
import assert from "node:assert/strict";
import { whatsappUrl } from "../src/modules/shared/domain/whatsapp";
test("manual WhatsApp links normalize Brazilian numbers including area code 55 without duplicating country code", () => {
  assert.equal(whatsappUrl("(18) 99749-9717"), "https://wa.me/5518997499717");
  assert.equal(
    whatsappUrl("+55 (18) 99749-9717"),
    "https://wa.me/5518997499717",
  );
  assert.equal(whatsappUrl("(55) 99999-1234"), "https://wa.me/5555999991234");
  assert.equal(whatsappUrl("1133334444"), "https://wa.me/551133334444");
  assert.equal(
    whatsappUrl("1133334444", "Olá & tudo bem?"),
    "https://wa.me/551133334444?text=Ol%C3%A1%20%26%20tudo%20bem%3F",
  );
});
test("missing, malformed or unsupported numbers never generate a conversation link", () => {
  for (const value of [
    undefined,
    null,
    "",
    "123",
    "javascript:12345678901",
    "+1 234 567 890123",
    "12345678901234",
  ])
    assert.equal(whatsappUrl(value), undefined);
});
