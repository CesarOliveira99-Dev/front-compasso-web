'use client';
import { useState } from 'react';
import type { Professional } from '@/modules/shared/domain/models';
import { Field } from '@/modules/shared/presentation/ui';
export function ScheduleExceptions({ professional }: { professional?: Professional }) {
  const [breaks, setBreaks] = useState(professional?.breaks || []);
  const [daysOff, setDaysOff] = useState(professional?.daysOff || []);
  const [date, setDate] = useState('');
  return (
    <section className="form-grid" aria-label="Intervalos e folgas">
      <input type="hidden" name="breaks" value={JSON.stringify(breaks)} />
      <input type="hidden" name="daysOff" value={JSON.stringify(daysOff)} />
      <h3>Intervalos e folgas</h3>
      <p className="form-note">
        Bloqueie um período em uma data específica ou deixe a data vazia para repetir diariamente.
        Atendimentos já confirmados precisam ser remanejados na agenda.
      </p>
      {breaks.map((interval, index) => (
        <div className="form-row" key={index}>
          <Field label="Data do bloqueio (opcional)">
            <input
              type="date"
              value={interval.date || ''}
              onChange={(event) =>
                setBreaks(
                  breaks.map((value, at) =>
                    at === index ? { ...value, date: event.target.value || undefined } : value,
                  ),
                )
              }
            />
          </Field>
          <Field label="Início do intervalo">
            <input
              type="time"
              required
              value={interval.start}
              onChange={(event) =>
                setBreaks(
                  breaks.map((value, at) =>
                    at === index ? { ...value, start: event.target.value } : value,
                  ),
                )
              }
            />
          </Field>
          <Field label="Fim do intervalo">
            <input
              type="time"
              required
              value={interval.end}
              onChange={(event) =>
                setBreaks(
                  breaks.map((value, at) =>
                    at === index ? { ...value, end: event.target.value } : value,
                  ),
                )
              }
            />
          </Field>
          <button
            type="button"
            className="text-button"
            aria-label={`Remover intervalo ${index + 1}`}
            onClick={() => setBreaks(breaks.filter((_, at) => at !== index))}
          >
            Remover
          </button>
        </div>
      ))}
      <button
        type="button"
        className="button secondary"
        disabled={breaks.length >= 8}
        onClick={() => setBreaks([...breaks, { start: '12:00', end: '13:00' }])}
      >
        Adicionar bloqueio de horário
      </button>
      <Field label="Dia de folga">
        <input type="date" value={date} onChange={(event) => setDate(event.target.value)} />
      </Field>
      <button
        type="button"
        className="button secondary"
        disabled={!date || daysOff.includes(date) || daysOff.length >= 366}
        onClick={() => {
          setDaysOff([...daysOff, date].sort());
          setDate('');
        }}
      >
        Adicionar folga
      </button>
      {daysOff.map((day) => (
        <div className="order-line" key={day}>
          <span>{day.split('-').reverse().join('/')}</span>
          <button
            type="button"
            className="text-button"
            aria-label={`Remover folga ${day}`}
            onClick={() => setDaysOff(daysOff.filter((value) => value !== day))}
          >
            Remover folga
          </button>
        </div>
      ))}
    </section>
  );
}
