import { useState } from 'react';
import type { Appointment } from '@/modules/shared/domain/models';
import { day, money, time } from '@/modules/shared/domain/format';
import { Badge, Field, type SectionProps } from '@/modules/shared/presentation/ui';
import { openBooking } from './booking-dialog';

export function openStaffAppointment(props: SectionProps, appointment: Appointment) {
  props.openDialog({
    title: appointment.customerName,
    description: `${appointment.itemName} · ${day(appointment.startsAt)} · ${time(appointment.startsAt)}–${time(appointment.endsAt)}`,
    content: ({ close }) => (
      <StaffAppointmentDetails props={props} appointment={appointment} close={close} />
    ),
  });
}
function StaffAppointmentDetails({
  props,
  appointment,
  close,
}: {
  props: SectionProps;
  appointment: Appointment;
  close: () => void;
}) {
  const [busy, setBusy] = useState(false);
  const admin = props.data.user.role === 'admin';
  const active = ['confirmed', 'pending'].includes(appointment.status);
  const change = async (body: unknown, message: string) => {
    if (busy) return;
    setBusy(true);
    try {
      await props.mutate(`appointments/${appointment.id}`, 'PATCH', body, message);
      close();
    } catch (error) {
      props.notify((error as Error).message, true);
    } finally {
      setBusy(false);
    }
  };
  return (
    <div className="form-grid staff-appointment-detail">
      <Badge status={appointment.status} />
      <p>Profissional: {appointment.professionalName || props.data.settings.name}</p>
      <p>{appointment.notes || 'Sem observações.'}</p>
      {admin && (
        <p>
          {money(appointment.priceCents)} · <Badge status={appointment.paymentStatus} />
        </p>
      )}
      <div className="calendar-dialog-actions">
        {appointment.status === 'confirmed' && (
          <button
            disabled={busy}
            type="button"
            className="button primary"
            onClick={() =>
              change(
                { status: 'completed' },
                'Atendimento concluído. O pagamento continua separado.',
              )
            }
          >
            Concluir atendimento
          </button>
        )}
        {active && (
          <button
            disabled={busy}
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
        )}
        {active && (
          <button
            disabled={busy}
            type="button"
            className="button secondary"
            onClick={() =>
              props.openDialog({
                title: 'Cancelar atendimento?',
                description: 'O horário será liberado para novas reservas.',
                content: (
                  <p>
                    {appointment.itemName} · {appointment.customerName}
                  </p>
                ),
                submitLabel: 'Confirmar cancelamento',
                onSubmit: async () => {
                  await props.mutate(
                    `appointments/${appointment.id}`,
                    'PATCH',
                    { status: 'cancelled' },
                    'Agendamento cancelado.',
                  );
                },
              })
            }
          >
            Cancelar
          </button>
        )}
        {admin && appointment.status !== 'cancelled' && appointment.paymentStatus !== 'paid' && (
          <button
            disabled={busy}
            type="button"
            className="button secondary"
            onClick={() => change({ paymentStatus: 'paid' }, 'Pagamento registrado manualmente.')}
          >
            Registrar pagamento
          </button>
        )}
        <button
          disabled={busy}
          type="button"
          className="button secondary"
          onClick={() =>
            props.openDialog({
              title: `Mensagem para ${appointment.customerName}`,
              content: (
                <div className="form-grid">
                  <Field label="Assunto">
                    <input name="title" required minLength={2} maxLength={100} />
                  </Field>
                  <Field label="Mensagem">
                    <textarea name="message" required minLength={3} maxLength={2000} />
                  </Field>
                </div>
              ),
              onSubmit: async (form) => {
                await props.mutate(
                  'notifications/message',
                  'POST',
                  {
                    customerId: appointment.customerId,
                    title: form.get('title'),
                    message: form.get('message'),
                  },
                  'Notificação enviada.',
                );
              },
            })
          }
        >
          Enviar mensagem
        </button>
      </div>
    </div>
  );
}
