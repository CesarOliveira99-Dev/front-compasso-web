import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { StorePlans, type PlanStatus } from '../src/modules/settings/presentation/store-plans';

const deadline = Date.parse('2026-11-19T15:00:00Z');
const plan = { id: 'essencial', name: 'Essencial', priceCents: 5990, employees: 1, monthlyEmails: 100, dailyEmails: 10 };
function render(mode: 'active' | 'expired', graceEndsAt?: number) {
  const status: PlanStatus = {
    billingEnabled: true, plans: [plan], employeesUsed: 0, setupPending: false,
    entitlement: { mode, plan: mode === 'active' ? plan : null, expiresAt: mode === 'active' ? deadline : null, graceEndsAt },
    subscription: { status: 'authorized', planId: 'essencial' },
    emailUsage: { daily: { used: 0, limit: 10 }, monthly: { used: 0, limit: 100 } },
  };
  return renderToStaticMarkup(createElement(StorePlans, { status, props: {} as never, busy: false, refresh() {} }));
}
test('grace notice renders the deadline in Brasilia and does not label grace as paid time', () => {
  const html = render('active', deadline);
  assert.match(html, /Identificamos uma pendência em seu pagamento\. Regularize seu plano até: 19\/11\/2026/);
  assert.match(html, /Acesso temporário até 19\/11\/2026/);
  assert.doesNotMatch(html, /Período pago até|HTTP|rejected/);
});
test('expired access renders the restriction and recovery removes the pending notice', () => {
  assert.match(render('expired'), /Seu período de uso terminou/);
  const recovered = render('active');
  assert.match(recovered, /Plano Essencial ativo/);
  assert.doesNotMatch(recovered, /Identificamos uma pendência|Acesso temporário/);
});

