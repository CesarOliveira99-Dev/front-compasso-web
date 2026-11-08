'use client';
import { useState } from 'react';
import { ArrowUpRight, CalendarDays, Clock3, Plus } from 'lucide-react';
import { openBooking } from '@/modules/appointments/presentation/booking-dialog';
import { day, time } from '@/modules/shared/domain/format';
import { Badge, Empty, PageHeading, type SectionProps } from '@/modules/shared/presentation/ui';
import type { Appointment } from '@/modules/shared/domain/models';

export function PulseOverview(props: SectionProps) {
  const today = props.data.dashboard.date;
  const [date, setDate] = useState(today);
  const dates = Array.from({ length: 7 }, (_, index) => {
    const value = new Date(`${date}T12:00:00Z`);
    value.setUTCDate(value.getUTCDate() - 3 + index);
    return value;
  });
  const dateFormatter = new Intl.DateTimeFormat('sv-SE', {
    timeZone: props.data.settings.timezone,
  });
  const appointments = props.data.appointments
    .filter((appointment) => dateFormatter.format(new Date(appointment.startsAt)) === date)
    .sort((a, b) => a.startsAt.localeCompare(b.startsAt));
  const confirmed = appointments.filter((appointment) => appointment.status === 'confirmed');
  const firstTime = confirmed[0]?.startsAt;
  const lanes = [
    {
      name: 'Em seguida',
      items: confirmed.filter((appointment) => appointment.startsAt === firstTime),
    },
    {
      name: 'Mais tarde',
      items: confirmed.filter((appointment) => appointment.startsAt !== firstTime),
    },
    {
      name: 'A confirmar',
      items: appointments.filter((appointment) => appointment.status === 'pending'),
    },
  ];
  function showAppointment(appointment: Appointment) {
    props.openDialog({
      title: appointment.customerName,
      description: `${appointment.itemName} · ${day(appointment.startsAt)}`,
      content: (
        <div className="form-grid">
          <p>
            {time(appointment.startsAt)} — {time(appointment.endsAt)} ·{' '}
            {appointment.professionalName || props.data.settings.name}
          </p>
          <Badge status={appointment.status} />
          <p>{appointment.notes || 'Sem observações.'}</p>
          <button
            type="button"
            className="button secondary"
            onClick={() =>
              openBooking(props, appointment.itemId, appointment).catch((error) =>
                props.notify(error.message, true),
              )
            }
          >
            Reagendar
          </button>
        </div>
      ),
    });
  }
  return (
    <section className="pulse-overview">
      <PageHeading
        eyebrow={props.data.settings.businessName}
        title="Seu dia, em ordem."
        description="Atendimentos, equipe e próximos passos."
        action={
          <button
            className="button primary"
            onClick={() => openBooking(props).catch((error) => props.notify(error.message, true))}
          >
            <Plus size={17} /> Novo atendimento
          </button>
        }
      />
      <div className="pulse-agenda-toolbar">
        <div>
          <CalendarDays size={17} />
          <strong>{day(`${date}T12:00:00-03:00`)}</strong>
        </div>
        <div>
          <button className="button secondary small" onClick={() => setDate(today)}>
            Hoje
          </button>
          <input
            type="date"
            aria-label="Data da agenda"
            value={date}
            required
            onChange={(event) => {
              if (event.target.value) setDate(event.target.value);
            }}
          />
        </div>
      </div>
      <div className="pulse-date-strip" aria-label="Dias da agenda">
        {dates.map((value) => {
          const key = value.toISOString().slice(0, 10);
          return (
            <button key={key} aria-pressed={key === date} onClick={() => setDate(key)}>
              <span>
                {value.toLocaleDateString('pt-BR', { weekday: 'short', timeZone: 'UTC' })}
              </span>
              <strong>{value.getUTCDate()}</strong>
            </button>
          );
        })}
      </div>
      <div className="pulse-agenda-summary" aria-live="polite">
        <span>
          <strong>{confirmed.length}</strong> confirmados
        </span>
        <span>
          <strong>{lanes[2].items.length}</strong> em triagem
        </span>
        <span>
          <strong>
            {appointments.filter((appointment) => appointment.status === 'completed').length}
          </strong>{' '}
          concluídos
        </span>
      </div>
      <div className="pulse-board">
        {lanes.map((lane) => (
          <section className="pulse-lane" key={lane.name}>
            <div className="pulse-lane-heading">
              <h2>{lane.name}</h2>
              <span>{lane.items.length}</span>
            </div>
            {lane.items.length ? (
              lane.items.map((appointment) => (
                <button
                  className="pulse-appointment"
                  key={appointment.id}
                  onClick={() => showAppointment(appointment)}
                >
                  <div className="pulse-card-time">
                    <strong>{time(appointment.startsAt)}</strong>
                    <ArrowUpRight size={17} />
                  </div>
                  <div>
                    <h3>{appointment.customerName}</h3>
                    <p>{appointment.itemName}</p>
                  </div>
                  <div className="pulse-card-footer">
                    <span>
                      <Clock3 size={14} />{' '}
                      {Math.round(
                        (Date.parse(appointment.endsAt) - Date.parse(appointment.startsAt)) / 60000,
                      )}{' '}
                      min
                    </span>
                    <span>{appointment.professionalName || props.data.settings.name}</span>
                  </div>
                  <Badge status={appointment.status} />
                </button>
              ))
            ) : (
              <Empty title="Agenda livre" description="Nenhum atendimento nesta etapa." />
            )}
          </section>
        ))}
      </div>
      <button className="button secondary" onClick={() => props.navigate('appointments')}>
        Ver agenda completa <ArrowUpRight size={16} />
      </button>
    </section>
  );
}
