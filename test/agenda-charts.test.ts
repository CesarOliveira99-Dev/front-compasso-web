import { test } from "node:test";
import assert from "node:assert/strict";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { AgendaPie } from "../src/modules/workspace/presentation/agenda-charts";
test("pie charts show a meaningful empty state and accessible counts without NaN", () => {
  const empty = renderToStaticMarkup(
    createElement(AgendaPie, {
      title: "Clientes",
      description: "Clientes únicos",
      rows: [],
    }),
  );
  assert.match(empty, /Sem dados/);
  assert.doesNotMatch(empty, /NaN|conic-gradient/);
  const html = renderToStaticMarkup(
    createElement(AgendaPie, {
      title: "Clientes",
      description: "Clientes únicos",
      rows: [
        { id: "a", name: "Primeira visita", count: 1, color: "#397c96" },
        { id: "b", name: "Já retornaram", count: 3, color: "#4d8658" },
      ],
    }),
  );
  assert.match(html, /Total: 4/);
  assert.match(html, /25%/);
  assert.match(html, /75%/);
  assert.match(html, /aria-pressed="false"/);
});
test("large service distributions preserve totals when grouped into Others and escape labels", () => {
  const rows = Array.from({ length: 8 }, (_, i) => ({
    id: String(i),
    name: i === 0 ? "<script>Serviço</script>" : "Serviço " + i,
    count: 1,
    color: "#397c96",
  }));
  const html = renderToStaticMarkup(
    createElement(AgendaPie, {
      title: "Serviços",
      description: "Solicitações",
      rows,
    }),
  );
  assert.match(html, /Total: 8/);
  assert.match(html, /Outros: 3/);
  assert.match(html, /37,5%/);
  assert.doesNotMatch(html, /<script>/);
});
