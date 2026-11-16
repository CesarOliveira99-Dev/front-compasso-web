import { strict as assert } from 'node:assert';
import { test } from 'node:test';
import {
  addDays,
  appointmentLanes,
  dateInZone,
  monthDays,
  monthWeeks,
  shiftMonth,
  validDateKey,
  weekDays,
} from '../src/modules/appointments/domain/calendar';
import { greetingForHour } from '../src/modules/shared/domain/greeting';
import type { Appointment } from '../src/modules/shared/domain/models';

test('calendar crosses years, includes Sunday and handles leap years', () => {
  assert.deepEqual(weekDays('2027-01-01'), [
    '2026-12-28',
    '2026-12-29',
    '2026-12-30',
    '2026-12-31',
    '2027-01-01',
    '2027-01-02',
    '2027-01-03',
  ]);
  assert.equal(addDays('2028-02-28', 1), '2028-02-29');
  assert.equal(validDateKey('2027-02-29'), false);
  assert.equal(validDateKey('invalid'), false);
  assert.equal(shiftMonth('2026-12', 1), '2027-01');
  const cells = monthDays('2026-11');
  assert.equal(cells.length, 42);
  assert.equal(cells[0], '2026-10-26');
  assert.equal(cells.at(-1), '2026-12-06');
  assert.equal(monthWeeks('2026-11').length, 6);
});
test('store timezone controls the displayed day around midnight and DST', () => {
  assert.equal(dateInZone(new Date('2026-11-05T01:00:00Z'), 'America/Sao_Paulo'), '2026-11-04');
  assert.equal(addDays('2026-03-08', 1), '2026-03-09');
});
test('overlap lanes keep simultaneous bookings separate and reuse adjacent slots', () => {
  const make = (id: string, start: string, end: string) =>
    ({ id, startsAt: `2026-11-05T${start}:00Z`, endsAt: `2026-11-05T${end}:00Z` }) as Appointment;
  const positions = appointmentLanes([
    make('c', '10:00', '11:00'),
    make('b', '09:30', '10:30'),
    make('a', '09:00', '10:00'),
    make('d', '11:00', '12:00'),
  ]);
  assert.deepEqual(
    positions.map((p) => [p.appointment.id, p.lane, p.lanes]),
    [
      ['a', 0, 2],
      ['b', 1, 2],
      ['c', 0, 2],
      ['d', 0, 1],
    ],
  );
  assert.deepEqual(appointmentLanes([]), []);
});
test('greeting changes at local morning, afternoon and evening boundaries', () => {
  assert.deepEqual([0, 4, 5, 11, 12, 17, 18, 23].map(greetingForHour), [
    'Boa noite',
    'Boa noite',
    'Bom dia',
    'Bom dia',
    'Boa tarde',
    'Boa tarde',
    'Boa noite',
    'Boa noite',
  ]);
});
