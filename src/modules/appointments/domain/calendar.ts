import type { Appointment } from '@/modules/shared/domain/models';

export type CalendarView = 'Dia' | 'Semana' | 'Mês';
export function dateFromKey(key: string): Date {
  return new Date(`${key}T12:00:00Z`);
}
export function dateKey(date: Date): string {
  return date.toISOString().slice(0, 10);
}
export function validDateKey(key: string): boolean {
  return (
    /^\d{4}-\d{2}-\d{2}$/.test(key) &&
    Number.isFinite(dateFromKey(key).getTime()) &&
    dateKey(dateFromKey(key)) === key
  );
}
export function dateInZone(date: Date, timezone: string): string {
  return new Intl.DateTimeFormat('sv-SE', {
    timeZone: timezone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(date);
}
export function addDays(key: string, count: number): string {
  const date = dateFromKey(key);
  date.setUTCDate(date.getUTCDate() + count);
  return dateKey(date);
}
export function weekStart(key: string): string {
  return addDays(key, -((dateFromKey(key).getUTCDay() + 6) % 7));
}
export function weekDays(key: string): string[] {
  const start = weekStart(key);
  return Array.from({ length: 7 }, (_, i) => addDays(start, i));
}
export function monthDays(month: string): string[] {
  const first = month + '-01',
    date = dateFromKey(first),
    last = dateKey(new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth() + 1, 0, 12)));
  const start = weekStart(first),
    end = addDays(weekStart(last), 6),
    days = [];
  for (let key = start; key <= end; key = addDays(key, 1)) days.push(key);
  return days;
}
export function monthWeeks(month: string): string[] {
  return monthDays(month).filter((_, i) => i % 7 === 0);
}
export function shiftMonth(month: string, amount: number): string {
  const date = dateFromKey(month + '-01');
  date.setUTCMonth(date.getUTCMonth() + amount);
  return dateKey(date).slice(0, 7);
}
export function calendarLabel(
  key: string,
  options: Intl.DateTimeFormatOptions = { day: '2-digit', month: 'long', year: 'numeric' },
): string {
  return dateFromKey(key).toLocaleDateString('pt-BR', { ...options, timeZone: 'UTC' });
}
export function weekLabel(key: string): string {
  const start = weekStart(key);
  return `${calendarLabel(start, { day: '2-digit', month: 'short' })} – ${calendarLabel(addDays(start, 6), { day: '2-digit', month: 'short', year: 'numeric' })}`;
}
export function clockMinutes(iso: string, timezone: string): number {
  const parts = new Intl.DateTimeFormat('en-GB', {
    timeZone: timezone,
    hour: '2-digit',
    minute: '2-digit',
    hourCycle: 'h23',
  }).formatToParts(new Date(iso));
  return (
    Number(parts.find((p) => p.type === 'hour')?.value) * 60 +
    Number(parts.find((p) => p.type === 'minute')?.value)
  );
}
export function clockLabel(iso: string, timezone: string): string {
  return new Date(iso).toLocaleTimeString('pt-BR', {
    timeZone: timezone,
    hour: '2-digit',
    minute: '2-digit',
  });
}
export interface CalendarPlacement {
  appointment: Appointment;
  lane: number;
  lanes: number;
}
/** Overlapping professionals get separate lanes; adjacent bookings may share one. */
export function appointmentLanes(appointments: Appointment[]): CalendarPlacement[] {
  const sorted = [...appointments].sort((a, b) => Date.parse(a.startsAt) - Date.parse(b.startsAt));
  const result: CalendarPlacement[] = [];
  let cluster: CalendarPlacement[] = [],
    ends: number[] = [],
    clusterEnd = -Infinity;
  function flush() {
    for (const item of cluster) item.lanes = ends.length;
    result.push(...cluster);
    cluster = [];
    ends = [];
  }
  for (const appointment of sorted) {
    const start = Date.parse(appointment.startsAt),
      end = Date.parse(appointment.endsAt);
    if (start >= clusterEnd) {
      flush();
      clusterEnd = end;
    }
    let lane = ends.findIndex((value) => value <= start);
    if (lane < 0) lane = ends.length;
    ends[lane] = end;
    clusterEnd = Math.max(clusterEnd, end);
    cluster.push({ appointment, lane, lanes: 1 });
  }
  flush();
  return result;
}
