'use client';
import { day } from '@/modules/shared/domain/format';
import type { Loyalty, Order } from '@/modules/shared/domain/models';
import { api } from '@/modules/shared/infrastructure/api';
import {
  AddButton,
  Badge,
  Empty,
  Field,
  PageHeading,
  ResourceState,
  text,
  useResource,
  type SectionProps,
} from '@/modules/shared/presentation/ui';
import { CalendarHeart, RefreshCw } from 'lucide-react';
export function LoyaltyPage(props: SectionProps) {
  const resource = useResource<Loyalty[]>('loyalty', props.revision);
  const admin = props.data.user.role === 'admin';
  async function plan() {
    const orders = await api<Order[]>('orders');
    const eligibleIds = new Set([
      ...props.data.appointments.filter((a) => a.status === 'completed').map((a) => a.itemId),
      ...orders
        .filter((o) => o.status === 'completed')
        .flatMap((o) => o.items.map((i) => i.itemId)),
    ]);
    const eligible = props.data.catalog.filter((i) => eligibleIds.has(i.id));
    if (!eligible.length) {
      props.notify(
        'Você poderá programar um retorno após concluir seu primeiro atendimento ou pedido.',
      );
      return;
    }
    props.openDialog({
      title: 'Um próximo cuidado para lembrar',
      description: 'Você escolhe quando voltar. Nós lembramos você.',
      content: (
        <div className="form-grid">
          <Field label="O que você gostaria de repetir?">
            <select name="itemId">
              {eligible.map((item) => (
                <option value={item.id} key={item.id}>
                  {item.name}
                </option>
              ))}
            </select>
          </Field>
          <Field label="Quando deseja receber o lembrete?">
            <input name="nextDate" type="date" required min={props.data.dashboard.date} />
          </Field>
          <Field label="Uma observação para o seu próximo encontro">
            <textarea name="note" rows={3} maxLength={500} />
          </Field>
          <p className="form-note">
            O lembrete não cria uma compra nem reserva um horário automaticamente. Você confirma uma
            nova solicitação quando desejar.
          </p>
        </div>
      ),
      submitLabel: 'Programar meu lembrete',
      onSubmit: async (form) => {
        await props.mutate(
          'loyalty',
          'POST',
          {
            itemId: text(form, 'itemId'),
            nextDate: text(form, 'nextDate'),
            note: text(form, 'note'),
          },
          'Seu próximo cuidado já tem um lembrete.',
        );
      },
    });
  }
  return (
    <>
      <PageHeading
        eyebrow="CUIDADO QUE CONTINUA"
        title={admin ? 'Retornos e fidelidade' : 'Meus próximos cuidados'}
        description="Bons encontros merecem acontecer de novo, no tempo de cada pessoa."
        action={
          !admin && (
            <AddButton onClick={() => plan().catch((e) => props.notify(e.message, true))}>
              Programar retorno
            </AddButton>
          )
        }
      />
      <ResourceState {...resource} />
      <div className="loyalty-banner">
        <CalendarHeart size={38} strokeWidth={1.2} />
        <div>
          <h2>Um cuidado hoje. Um reencontro amanhã.</h2>
          <p>
            Lembretes sazonais para repetir serviços e produtos, sem compromisso ou cobrança
            automática.
          </p>
        </div>
      </div>
      <div className="request-grid">
        {resource.value?.map((loyalty) => (
          <article className="panel loyalty-card" key={loyalty.id}>
            <span className="stat-icon sage">
              <RefreshCw size={20} />
            </span>
            <h3>{loyalty.itemName}</h3>
            <p>
              Lembrete em <strong>{day(loyalty.nextDate)}</strong>
            </p>
            {loyalty.note && <p>{loyalty.note}</p>}
            <Badge status={loyalty.status} />
            {!admin && (
              <button className="button secondary full" onClick={() => props.navigate('catalog')}>
                Solicitar novamente
              </button>
            )}
          </article>
        ))}
      </div>
      {!resource.loading && !resource.value?.length && (
        <Empty
          title="Todo reencontro começa com vontade de voltar"
          description="Depois de concluir uma solicitação, escolha quando gostaria de repeti-la."
        />
      )}
    </>
  );
}
