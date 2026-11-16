'use client';
import { useId, useState } from 'react';
type Hours = {
  openingHour: number;
  closingHour: number;
  workDays: number[];
  weeklyHours?: { day: number; openingHour: number; closingHour: number }[];
};
export const clockLabel = (hour: number) =>
  `${String(Math.floor(hour)).padStart(2, '0')}:${String(Math.round((hour % 1) * 60)).padStart(2, '0')}`;
export function dayHours(value: Hours, day: number) {
  return value.weeklyHours
    ? value.weeklyHours.find((row) => row.day === day)
    : value.workDays.includes(day)
      ? { day, openingHour: value.openingHour, closingHour: value.closingHour }
      : undefined;
}
export function hoursFromForm(form: FormData) {
  const weeklyHours = JSON.parse(String(form.get('weeklyHours') || '[]')) as NonNullable<
    Hours['weeklyHours']
  >;
  return {
    weeklyHours,
    workDays: weeklyHours.map((row) => row.day),
    openingHour: weeklyHours.length
      ? Math.floor(Math.min(...weeklyHours.map((row) => row.openingHour)))
      : 0,
    closingHour: Math.ceil(Math.max(1, ...weeklyHours.map((row) => row.closingHour))),
  };
}
type DayRow = { day: number; enabled: boolean; openingHour: number; closingHour: number };
const dayNames = [
  'Domingo',
  'Segunda-feira',
  'Terça-feira',
  'Quarta-feira',
  'Quinta-feira',
  'Sexta-feira',
  'Sábado',
];
function TimeRange({
  value,
  label,
  onChange,
}: {
  value: { openingHour: number; closingHour: number };
  label: string;
  onChange: (patch: Partial<Pick<DayRow, 'openingHour' | 'closingHour'>>) => void;
}) {
  return (
    <div className="weekly-times">
      {(['openingHour', 'closingHour'] as const).map((key, index) => (
        <label key={key}>
          <span>{index ? 'Até' : 'Das'}</span>
          <input
            aria-label={`${index ? 'Fechamento' : 'Abertura'} ${label}`}
            type="time"
            required
            value={value[key] === 24 ? '00:00' : clockLabel(value[key])}
            onChange={(event) => {
              const [h, m] = event.target.value.split(':').map(Number);
              const hour = h + m / 60;
              onChange({ [key]: key === 'closingHour' && hour === 0 ? 24 : hour });
            }}
          />
        </label>
      ))}
      {value.closingHour === 24 && (
        <small className="weekly-store">Fecha à meia-noite, no fim deste dia.</small>
      )}
    </div>
  );
}
export function WeeklyHours({ initial, store }: { initial: Hours; store?: Hours }) {
  const modeId = useId();
  const [rows, setRows] = useState<DayRow[]>(() =>
    [1, 2, 3, 4, 5, 6, 0].map((day) => ({
      day,
      enabled: !!dayHours(initial, day),
      openingHour: dayHours(initial, day)?.openingHour ?? initial.openingHour,
      closingHour: dayHours(initial, day)?.closingHour ?? initial.closingHour,
    })),
  );
  const [mode, setMode] = useState<'fixed' | 'variable'>(() => {
    const days = initial.weeklyHours || [];
    return days.some(
      (day) => day.openingHour !== days[0].openingHour || day.closingHour !== days[0].closingHour,
    )
      ? 'variable'
      : 'fixed';
  });
  const [fixed, setFixed] = useState(() => {
    const first = rows.find((row) => row.enabled) || rows[0];
    return { openingHour: first.openingHour, closingHour: first.closingHour };
  });
  const selected = rows.filter((row) => row.enabled);
  const submitted = selected.map(({ day, openingHour, closingHour }) => ({
    day,
    ...(mode === 'fixed' ? fixed : { openingHour, closingHour }),
  }));
  function update(day: number, patch: Partial<DayRow>) {
    setRows((current) => current.map((row) => (row.day === day ? { ...row, ...patch } : row)));
  }
  function changeMode(next: 'fixed' | 'variable') {
    if (next === 'variable' && mode === 'fixed')
      setRows((current) => current.map((row) => ({ ...row, ...fixed })));
    setMode(next);
  }
  return (
    <fieldset className="weekly-hours">
      <legend>Horários de atendimento</legend>
      <div className="work-days">
        <span className="weekly-days-title">Dias de atendimento</span>
        <div className="work-days-scroll">
          {rows.map((row) => (
            <label className="work-day" key={row.day}>
              <input
                type="checkbox"
                aria-label={dayNames[row.day]}
                checked={row.enabled}
                onChange={(event) => update(row.day, { enabled: event.target.checked })}
              />
              <span>{['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'][row.day]}</span>
            </label>
          ))}
        </div>
      </div>
      <div className="weekly-mode" role="radiogroup" aria-label="Como definir os horários">
        <label>
          <input
            type="radio"
            name={modeId}
            checked={mode === 'fixed'}
            onChange={() => changeMode('fixed')}
          />
          Definir horário fixo para todos os dias selecionados
        </label>
        <label>
          <input
            type="radio"
            name={modeId}
            checked={mode === 'variable'}
            onChange={() => changeMode('variable')}
          />
          Definir horário variável por dia
        </label>
      </div>
      <input type="hidden" name="weeklyHours" value={JSON.stringify(submitted)} />
      {!selected.length ? (
        <p className="form-note">Selecione os dias em que haverá atendimento.</p>
      ) : mode === 'fixed' ? (
        <div className="weekly-hours-row">
          <TimeRange
            value={fixed}
            label="dos dias selecionados"
            onChange={(patch) => setFixed((current) => ({ ...current, ...patch }))}
          />
        </div>
      ) : (
        selected.map((row) => (
          <div className="weekly-hours-row" key={row.day}>
            <strong className="weekly-day">{dayNames[row.day]}</strong>
            <TimeRange
              value={row}
              label={dayNames[row.day]}
              onChange={(patch) => update(row.day, patch)}
            />
          </div>
        ))
      )}
      {store && (
        <div className="weekly-store-hours">
          <p className="form-note">
            Sua agenda considera apenas horários dentro do funcionamento da loja.
          </p>
          {selected.map((row) => {
            const bounds = dayHours(store, row.day);
            return (
              <small className="weekly-store" key={row.day}>
                {dayNames[row.day]} · Loja:{' '}
                {bounds
                  ? `${clockLabel(bounds.openingHour)} – ${clockLabel(bounds.closingHour)}`
                  : 'fechada'}
              </small>
            );
          })}
        </div>
      )}
    </fieldset>
  );
}
