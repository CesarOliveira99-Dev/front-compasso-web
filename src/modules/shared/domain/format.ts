export const money = (cents: number) =>
  new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(cents / 100);
export const time = (date: string) =>
  new Date(date).toLocaleTimeString('pt-BR', {
    hour: '2-digit',
    minute: '2-digit',
    timeZone: 'America/Sao_Paulo',
  });
export const day = (date: string) =>
  new Date(date.length === 10 ? `${date}T12:00:00-03:00` : date).toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: 'short',
    timeZone: 'America/Sao_Paulo',
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
export function localInput(iso?: string): string {
  const date = iso ? new Date(iso) : new Date();
  const parts = new Intl.DateTimeFormat('sv-SE', {
    timeZone: 'America/Sao_Paulo',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    hourCycle: 'h23',
  }).format(date);
  return parts.replace(' ', 'T');
}
export function inputToIso(value: string): string {
  return new Date(`${value}:00-03:00`).toISOString();
}
