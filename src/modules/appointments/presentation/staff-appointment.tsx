import { ClientSnapshot, ReminderComposer, ReturnRuleForm } from '@/modules/workspace/presentation/client-care';
import { useResource } from "@/modules/shared/presentation/ui";
import type { AgendaPreferences } from "@/modules/workspace/presentation/tools-types";
import { useState } from "react";
import type { Appointment } from "@/modules/shared/domain/models";
import { day, money, time } from "@/modules/shared/domain/format";
import {
  Badge,
  Field,
  type SectionProps,
} from "@/modules/shared/presentation/ui";
import { openBooking } from "./booking-dialog";
import { WhatsAppLink } from "@/modules/shared/presentation/whatsapp-link";
import { CustomerDossierPanel } from "@/modules/workspace/presentation/customer-dossier";
import type { CustomerDossier } from "@/modules/workspace/presentation/tools-types";

export function openStaffAppointment(
  props: SectionProps,
  appointment: Appointment,
) {
  props.openDialog({
    title: appointment.customerName,
    description: `${appointment.itemName} · ${day(appointment.startsAt)} · ${time(appointment.startsAt)}–${time(appointment.endsAt)}`,
    content: ({ close }) => (
      <StaffAppointmentDetails
        props={props}
        appointment={appointment}
        close={close}
      />
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
  const customer = useResource<CustomerDossier>(
    `workspace/customers/${appointment.customerId}`,
    props.revision,
  );
  const preferences = useResource<AgendaPreferences>(
    "workspace/preferences",
    props.revision,
  );
  const admin = props.data.user.role === "admin";
  const active = ["confirmed", "pending"].includes(appointment.status);
  const change = async (body: unknown, message: string) => {
    if (busy) return;
    setBusy(true);
    try {
      await props.mutate(
        `appointments/${appointment.id}`,
        "PATCH",
        body,
        message,
      );
      close();
    } catch (error) {
      props.notify((error as Error).message, true);
    } finally {
      setBusy(false);
    }
  };
  return (
    <div className="form-grid staff-appointment-detail">
      <Badge status={appointment.attendanceOutcome === "no_show" ? "no_show" : appointment.status} />
      <WhatsAppLink phone={customer.value?.customer.phone} />
      <ClientSnapshot customerId={appointment.customerId} revision={props.revision} />
      <ReturnRuleForm props={props} customerId={appointment.customerId} itemId={appointment.itemId} professionalId={appointment.professionalId} />
      {active && <ReminderComposer appointment={appointment} props={props} />}
      {active && Date.parse(appointment.startsAt) <= Date.now() && <button className="button secondary" disabled={busy} onClick={()=>props.openDialog({title:"Registrar não comparecimento?",description:"O registro será separado de cancelamentos e não mudará o pagamento.",content:<p>{appointment.customerName}</p>,submitLabel:"Registrar falta",onSubmit:async()=>{await props.mutate(`workspace/care/appointments/${appointment.id}/missed`,"POST",{},"Falta registrada.");}})}>Registrar falta</button>}
      {preferences.value && (
        <Field label="Categoria e cor">
          <select
            aria-label="Categoria do atendimento"
            defaultValue={appointment.categoryId || ""}
            disabled={busy}
            onChange={async (event) => {
              setBusy(true);
              try {
                await props.mutate(
                  `workspace/appointments/${appointment.id}/style`,
                  "PUT",
                  { categoryId: event.target.value || null },
                  "Categoria atualizada.",
                );
                close();
              } catch (error) {
                props.notify((error as Error).message, true);
              } finally {
                setBusy(false);
              }
            }}
          >
            <option value="">Sem categoria</option>
            {preferences.value.categories.map((category) => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </select>
        </Field>
      )}
      <button
        className="button secondary"
        onClick={() => {
          props.openDialog({
            title: `Ficha de ${appointment.customerName}`,
            content: (
              <CustomerDossierPanel
                customerId={appointment.customerId}
                props={props}
              />
            ),
          });
        }}
      >
        Abrir ficha do cliente
      </button>
      <p>
        Profissional: {appointment.professionalName || props.data.settings.name}
      </p>
      <p>{appointment.notes || "Sem observações."}</p>
      {admin && (
        <p>
          {money(appointment.priceCents)} ·{" "}
          <Badge status={appointment.paymentStatus} />
        </p>
      )}
      <div className="calendar-dialog-actions">
        {appointment.status === "confirmed" && (
          <button
            disabled={busy}
            type="button"
            className="button primary"
            onClick={() =>
              change(
                { status: "completed" },
                "Atendimento concluído. O pagamento continua separado.",
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
              openBooking(props, appointment.itemId, appointment).catch(
                (error) => props.notify(error.message, true),
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
                title: "Cancelar atendimento?",
                description: "O horário será liberado para novas reservas.",
                content: (
                  <p>
                    {appointment.itemName} · {appointment.customerName}
                  </p>
                ),
                submitLabel: "Confirmar cancelamento",
                onSubmit: async () => {
                  await props.mutate(
                    `appointments/${appointment.id}`,
                    "PATCH",
                    { status: "cancelled" },
                    "Agendamento cancelado.",
                  );
                },
              })
            }
          >
            Cancelar
          </button>
        )}
        {admin &&
          appointment.status !== "cancelled" &&
          appointment.paymentStatus !== "paid" && (
            <button
              disabled={busy}
              type="button"
              className="button secondary"
              onClick={() =>
                change(
                  { paymentStatus: "paid" },
                  "Pagamento registrado manualmente.",
                )
              }
            >
              Registrar pagamento
            </button>
          )}
        {props.data.settings.workspaceMode !== "solo" && (
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
                      <input
                        name="title"
                        required
                        minLength={2}
                        maxLength={100}
                      />
                    </Field>
                    <Field label="Mensagem">
                      <textarea
                        name="message"
                        required
                        minLength={3}
                        maxLength={2000}
                      />
                    </Field>
                  </div>
                ),
                onSubmit: async (form) => {
                  await props.mutate(
                    "notifications/message",
                    "POST",
                    {
                      customerId: appointment.customerId,
                      title: form.get("title"),
                      message: form.get("message"),
                    },
                    "Notificação enviada.",
                  );
                },
              })
            }
          >
            Enviar mensagem
          </button>
        )}
      </div>
    </div>
  );
}
