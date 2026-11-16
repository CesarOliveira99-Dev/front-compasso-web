import { test } from 'node:test';
import assert from 'node:assert/strict';
import { formatsForZone } from '../src/modules/shared/domain/format';
import { zonedInputToIso } from '../src/modules/shared/domain/timezone';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { TimezoneProvider, useTimeFormats } from '../src/modules/shared/presentation/timezone';

test('workspace time is independent of device time, including MS and Acre', () => {
  const sp = formatsForZone('America/Sao_Paulo'), ms = formatsForZone('America/Campo_Grande');
  assert.equal(sp.inputToIso('2026-11-15T09:00'), '2026-11-15T12:00:00.000Z');
  assert.equal(ms.inputToIso('2026-11-15T09:00'), '2026-11-15T13:00:00.000Z');
  assert.equal(ms.time('2026-11-15T12:00:00Z'), '08:00');
  assert.equal(ms.localInput('2026-11-15T13:00:00Z'), '2026-11-15T09:00');
  assert.equal(formatsForZone('America/Rio_Branco').inputToIso('2026-11-15T09:00'), '2026-11-15T14:00:00.000Z');
  assert.notEqual(ms.day('2026-11-15T03:30:00Z'), sp.day('2026-11-15T03:30:00Z'));
});
test('DST gaps and duplicated times fail instead of silently shifting appointments', () => {
  assert.throws(() => zonedInputToIso('2026-03-08T02:30', 'America/New_York'), /não existe ou é ambíguo/);
  assert.throws(() => zonedInputToIso('2026-11-01T01:30', 'America/New_York'), /não existe ou é ambíguo/);
  assert.throws(() => zonedInputToIso('2026-02-30T09:00', 'America/Campo_Grande'));
});

test('rendered workspace uses its own provider and date-only values never drift', () => {
  function Clock() { const { time } = useTimeFormats(); return createElement('time', null, time('2026-11-15T12:00:00Z')); }
  const html = renderToStaticMarkup(createElement(TimezoneProvider, { timezone: 'America/Campo_Grande', children: createElement(Clock) }));
  assert.match(html, /08:00/);
  assert.equal(formatsForZone('Pacific/Kiritimati').day('2026-11-15'), formatsForZone('America/Sao_Paulo').day('2026-11-15'));
});

