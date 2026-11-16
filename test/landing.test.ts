import { test } from "node:test";
import assert from "node:assert/strict";
import { renderToStaticMarkup } from "react-dom/server";
import { createElement } from "react";
import { LandingPage } from "../src/modules/marketing/presentation/landing-page";
test("presentation describes actual offers and separates free customers from store and private Solo signup", () => {
  const html = renderToStaticMarkup(createElement(LandingPage));
  for (const value of [
    "/entrar",
    "/descobrir",
    "/cadastro?modalidade=solo",
    "/cadastro?modalidade=loja",
    "59,90",
    "79,90",
    "99,90",
    "R$15",
    "R$110",
    "R$25,00",
    "14 dias",
    "Interface real do Compasso",
  ])
    assert.ok(html.includes(value), value);
  assert.equal((html.match(/<h1[ >]/g) || []).length, 1);
  assert.ok(!html.includes("<form"));
  assert.ok(!html.includes('name="password"'));
  assert.ok(html.includes("sem cartão obrigatório"));
});
test("presentation navigation targets exist and does not promise automated WhatsApp or fabricated testimonials", () => {
  const html = renderToStaticMarkup(createElement(LandingPage));
  for (const id of [
    "conteudo",
    "como-funciona",
    "para-voce",
    "planos",
    "duvidas",
    "plano-solo",
    "planos-loja",
  ])
    assert.ok(html.includes(`id="${id}"`), id);
  assert.ok(html.includes("O envio é confirmado por você no WhatsApp."));
  assert.ok(html.includes("dados de demonstração"));
  assert.ok(!html.includes("38%"));
  assert.ok(!html.includes("depoimento"));
});
