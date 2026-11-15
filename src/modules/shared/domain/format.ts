import { DEFAULT_TIMEZONE, inputInZone, zonedInputToIso } from './timezone';
export const money = (cents: number) =>
  new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(cents / 100);
export const time = (date: string, timezone = DEFAULT_TIMEZONE) =>
  new Date(date).toLocaleTimeString('pt-BR', {
    hour: '2-digit',
    minute: '2-digit',
    timeZone: timezone,
  });
export const day = (date: string, timezone = DEFAULT_TIMEZONE) =>
  new Date(date.length === 10 ? `${date}T12:00:00Z` : date).toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: 'short',
    timeZone: date.length === 10 ? 'UTC' : timezone,
  });
export const initials = (name: string) =>
  name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((s) => s[0])
    .join('')
    .toUpperCase();
export const statusLabel: Record<string, string> = {
  pending: 'Pendente',
  confirmed: 'Confirmado',
  completed: 'Finalizado',
  cancelled: 'Cancelado',
  no_show: 'Não compareceu',
  paid: 'Pago',
  approved: 'Aprovada',
  declined: 'Recusada',
  active: 'Ativo',
  reminded: 'Lembrete enviado',
};
export function localInput(iso?: string, timezone = DEFAULT_TIMEZONE): string {
  return inputInZone(iso || new Date().toISOString(), timezone);
}
export function inputToIso(value: string, timezone = DEFAULT_TIMEZONE): string {
  return zonedInputToIso(value, timezone);
}

export function formatsForZone(timezone = DEFAULT_TIMEZONE) {
  return { time: (value: string) => time(value, timezone), day: (value: string) => day(value, timezone),
    localInput: (value?: string) => localInput(value, timezone), inputToIso: (value: string) => inputToIso(value, timezone) };
}

