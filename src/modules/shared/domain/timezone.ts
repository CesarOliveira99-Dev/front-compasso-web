export const DEFAULT_TIMEZONE = 'America/Sao_Paulo';
export const TIMEZONES = [
  ['America/Sao_Paulo', 'Brasília / São Paulo'],
  ['America/Campo_Grande', 'Mato Grosso do Sul'],
  ['America/Cuiaba', 'Mato Grosso'],
  ['America/Manaus', 'Amazonas / Manaus'],
  ['America/Porto_Velho', 'Rondônia'],
  ['America/Boa_Vista', 'Roraima'],
  ['America/Rio_Branco', 'Acre'],
  ['America/Noronha', 'Fernando de Noronha'],
] as const;

export function inputInZone(iso: string, timezone: string): string {
  const parts = new Intl.DateTimeFormat('sv-SE', { timeZone: timezone, year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', hourCycle: 'h23' }).format(new Date(iso));
  return parts.replace(' ', 'T');
}

/** Reject nonexistent or ambiguous wall times rather than silently moving a booking. */
export function zonedInputToIso(value: string, timezone: string): string {
  if (!/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/.test(value)) throw new Error('Informe uma data e um horário válidos.');
  const wall = Date.parse(value + ':00Z');
  if (!Number.isFinite(wall)) throw new Error('Informe uma data e um horário válidos.');
  const offsets = new Set<number>();
  for (const hours of [-36, -12, 0, 12, 36]) {
    const instant = wall + hours * 3600000;
    const local = Date.parse(inputInZone(new Date(instant).toISOString(), timezone) + ':00Z');
    offsets.add(local - instant);
  }
  const matches = [...offsets].map(offset => wall - offset)
    .filter(instant => inputInZone(new Date(instant).toISOString(), timezone) === value);
  if (matches.length !== 1) throw new Error('Este horário não existe ou é ambíguo no fuso escolhido. Selecione outro horário.');
  return new Date(matches[0]).toISOString();
}

