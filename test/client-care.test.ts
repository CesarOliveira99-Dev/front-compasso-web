import { test } from "node:test";
import assert from "node:assert/strict";
import { reminderError } from "../src/modules/workspace/presentation/care-types";
import { isWorkspacePath } from "../src/modules/bff/domain/workspace-route";
test("reminder fields validate immediately and do not accept private data or malformed tokens", () => {
  assert.equal(
    reminderError(
      "Olá {nome}, {servico} dia {data} às {horario} com {profissional} em {estabelecimento}",
    ),
    "",
  );
  for (const template of [
    "",
    "{telefone}",
    "{observacoes}",
    "{{nome}}",
    "{nome",
    "nome}",
    "x".repeat(1501),
  ])
    assert.ok(reminderError(template), template);
});
test("BFF only forwards supported care resources, not arbitrary commands or traversal", () => {
  for (const path of [
    "template",
    "returns",
    "blocks",
    "blocks/abc",
    "series",
    "customers/abc",
    "appointments/abc/reminder",
    "appointments/abc/missed",
    "waitlist",
    "waitlist/abc",
    "waitlist/abc/slots",
    "waitlist/abc/book",
  ])
    assert.equal(isWorkspacePath("workspace/care/" + path), true, path);
  for (const path of [
    "",
    "admin",
    "customers/abc/private",
    "template/extra",
    "appointments/abc/delete",
    "waitlist/../settings",
    "waitlist/abc/send",
    "blocks/abc/extra",
  ])
    assert.equal(isWorkspacePath("workspace/care/" + path), false, path);
});
