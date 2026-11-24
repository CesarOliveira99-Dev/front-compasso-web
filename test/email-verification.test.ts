import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { EmailVerification } from '../src/modules/identity/presentation/email-verification';

test('verified accounts show confirmation instead of requesting another email', () => {
  const html = renderToStaticMarkup(createElement(EmailVerification, { verified: true }));
  assert.match(html, /E-mail confirmado/);
  assert.doesNotMatch(html, /Enviar link de confirmação/);
});

test('unverified accounts retain the explicit confirmation request', () => {
  const html = renderToStaticMarkup(createElement(EmailVerification, { verified: false }));
  assert.match(html, /Confirme seu e-mail/);
  assert.match(html, /Enviar link de confirmação/);
});
