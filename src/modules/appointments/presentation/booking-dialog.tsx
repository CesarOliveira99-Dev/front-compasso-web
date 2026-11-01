import { inputToIso, localInput } from '@/modules/shared/domain/format';
import type { Customer } from '@/modules/shared/domain/models';
import { api } from '@/modules/shared/infrastructure/api';
import { Field, text, type SectionProps } from '@/modules/shared/presentation/ui';
export async function openBooking(props: SectionProps, initialItemId?: string) {
  const customers = props.data.user.role === 'admin' ? await api<Customer[]>('customers') : [];
  const services = props.data.catalog.filter((item) => item.kind === 'service' && item.active);
  if (!services.length) {
    props.notify('Cadastre um serviço ativo antes de agendar.', true);
    return;
  }
  props.openDialog({
    title: 'Um novo encontro',
    description: 'Escolha o serviço e encontre um espaço na agenda.',
    submitLabel: 'Confirmar agendamento',
    content: (
      <div className="form-grid">
        <Field label="Serviço">
          <select name="itemId" defaultValue={initialItemId || services[0].id}>
            {services.map((item) => (
              <option value={item.id} key={item.id}>
                {item.name} • {item.durationMinutes} min
              </option>
            ))}
          </select>
        </Field>
        {props.data.user.role === 'admin' && (
          <Field label="Cliente">
            <select name="customerId" required>
              <option value="">Selecione um cliente</option>
              {customers.map((customer) => (
                <option value={customer.id} key={customer.id}>
                  {customer.name}
                </option>
              ))}
            </select>
          </Field>
        )}
        <Field
          label="Data e horário"
          hint="Horário de Brasília. A disponibilidade é conferida na confirmação."
        >
          <input type="datetime-local" name="startsAt" required min={localInput()} />
        </Field>
        <Field
          label="Conte o que você precisa"
          hint="Para serviços com triagem, descreva sua necessidade antes da aprovação."
        >
          <textarea
            name="notes"
            rows={4}
            maxLength={2000}
            placeholder="Preferências, necessidades ou algo que devemos saber…"
          />
        </Field>
      </div>
    ),
    onSubmit: async (form) => {
      await props.mutate(
        'appointments',
        'POST',
        {
          itemId: text(form, 'itemId'),
          customerId: text(form, 'customerId') || undefined,
          startsAt: inputToIso(text(form, 'startsAt')),
          notes: text(form, 'notes'),
        },
        'Agendamento registrado com sucesso.',
      );
    },
  });
}
