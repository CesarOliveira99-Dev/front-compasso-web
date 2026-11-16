import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { LastVisitCard, type LastVisit } from '../src/modules/dashboard/presentation/last-visit';

const visit: LastVisit = { key: 'fixture', appointmentId: 'one', service: { id: 'service', name: 'Corte de cabelo', image: '/api/media/fixture', available: true }, store: { slug: 'aurora', name: 'Estúdio Aurora' }, professionalName: 'Ana Oliveira', startsAt: '2026-11-07T13:30:00Z', timezone: 'America/Sao_Paulo', review: null };
function render(value = visit) { return renderToStaticMarkup(createElement(LastVisitCard, { visit: value, busy: false, onDismiss() {}, onReview() {}, onBook() {} })); }
test('latest visit card presents service photo, store, professional, local date and direct actions', () => {
  const html = render();
  for (const text of ['Seu último atendimento', 'Corte de cabelo', 'Estúdio Aurora', 'Ana Oliveira', '07 de novembro de 2026', '10:30', 'Avaliar', 'Agendar novamente', 'Fechar card do último atendimento']) assert.ok(html.includes(text), text);
  assert.ok(html.includes('/api/media/fixture'));
});
test('reviewed visit replaces review action and unavailable service disables new booking', () => {
  const html = render({ ...visit, service: { ...visit.service, available: false, image: undefined }, review: { rating: 4 } });
  assert.ok(html.includes('Avaliado'));
  assert.ok(!html.includes('>Avaliar</button>'));
  assert.ok(html.includes('disabled'));
  assert.ok(html.includes('não está disponível'));
});
