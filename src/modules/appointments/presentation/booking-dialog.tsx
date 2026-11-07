import type { Appointment, Customer, Professional } from '@/modules/shared/domain/models';
import { api } from '@/modules/shared/infrastructure/api';
import type { SectionProps } from '@/modules/shared/presentation/ui';
import { BookingFlow } from './booking-flow';
export async function openBooking(
  props: SectionProps,
  initialItemId?: string,
  appointment?: Appointment,
) {
  if (initialItemId && !props.data.catalog.some((item) => item.id === initialItemId && item.kind === 'service' && item.active)) {
    props.notify('Este serviço não está mais disponível para agendar.', true);
    return;
  }
  const professionals = await api<Professional[]>('professionals');
  const customers =
    props.data.user.role === 'admin' && !appointment ? await api<Customer[]>('customers') : [];
  if (!props.data.catalog.some((item) => item.kind === 'service' && item.active)) {
    props.notify('Cadastre um serviço ativo antes de agendar.', true);
    return;
  }
  props.openDialog({
    title: appointment ? 'Escolher um novo horário' : 'Agendar um cuidado',
    description: 'Uma escolha de cada vez, no seu compasso.',
    content: ({ close, setBusy }) => (
      <BookingFlow
        {...props}
        professionals={professionals}
        customers={customers}
        initialItemId={initialItemId}
        appointment={appointment}
        close={close}
        setDialogBusy={setBusy}
      />
    ),
  });
}
