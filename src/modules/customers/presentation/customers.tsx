'use client';
import { WhatsAppLink } from '@/modules/shared/presentation/whatsapp-link';
import { money } from '@/modules/shared/domain/format';
import type { Customer } from '@/modules/shared/domain/models';
import {
  Avatar,
  Empty,
  Field,
  PageHeading,
  ResourceState,
  text,
  useResource,
  type SectionProps,
} from '@/modules/shared/presentation/ui';
import { MessageCircle, Search, Send, UserPlus } from 'lucide-react';
import { useState } from 'react';
export function CustomersPage(props: SectionProps) {
  const resource = useResource<Customer[]>('customers', props.revision);
  const [search, setSearch] = useState('');
  const customers =
    resource.value?.filter((c) =>
      `${c.name} ${c.email} ${c.phone}`.toLowerCase().includes(search.toLowerCase()),
    ) || [];
  function message(customer: Customer) {
    props.openDialog({
      title: `Uma mensagem para ${customer.name.split(' ')[0]}`,
      description: 'Uma conexão que continua além do atendimento.',
      content: (
        <div className="form-grid">
          <Field label="Assunto">
            <input
              name="title"
              required
              minLength={2}
              maxLength={100}
              placeholder="Um cuidado especial para você"
            />
          </Field>
          <Field label="Sua mensagem">
            <textarea
              name="message"
              rows={5}
              required
              minLength={3}
              maxLength={2000}
              placeholder="Olá! Que tal conversarmos sobre seu último atendimento?"
            />
          </Field>
          <p className="form-note">
            A mensagem será entregue nas notificações do cliente dentro do Compasso.
          </p>
          <WhatsAppLink phone={customer.phone} label="Abrir conversa no WhatsApp" />
        </div>
      ),
      submitLabel: 'Enviar na plataforma',
      onSubmit: async (form) => {
        await props.mutate(
          'notifications/message',
          'POST',
          { customerId: customer.id, title: text(form, 'title'), message: text(form, 'message') },
          'Mensagem enviada nas notificações do cliente.',
        );
      },
    });
  }
  return (
    <>
      <PageHeading
        eyebrow="PESSOAS, NÃO APENAS CADASTROS"
        title="Seus clientes"
        description="Conexões que você cultiva, um atendimento de cada vez."
        action={
          <button
            className="button secondary"
            onClick={() =>
              props.openDialog({
                title: 'Convide um novo cliente',
                content: (
                  <div className="form-grid">
                    <p>
                      Peça ao cliente para criar uma conta na página de entrada do Compasso,
                      selecionando “Sou cliente”.
                    </p>
                    <Field label="Nome do estabelecimento">
                      <input readOnly value={props.data.settings.businessName} />
                    </Field>
                    <button
                      type="button"
                      className="button primary"
                      onClick={() =>
                        navigator.clipboard
                          .writeText(
                            `${window.location.origin} — encontre ${props.data.settings.businessName} pelo nome`,
                          )
                          .then(() => props.notify('Convite copiado.'))
                          .catch(() => props.notify('Copie o nome do estabelecimento acima.'))
                      }
                    >
                      Copiar convite
                    </button>
                  </div>
                ),
              })
            }
          >
            <UserPlus size={17} />
            Convidar cliente
          </button>
        }
      />
      <div className="toolbar">
        <span className="muted">{resource.value?.length || 0} pessoas na sua história</span>
        <label className="search-field">
          <Search size={17} />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar nome, e-mail ou telefone…"
          />
        </label>
      </div>
      <ResourceState {...resource} />
      <div className="customer-grid">
        {customers.map((customer, index) => (
          <article className="panel customer-card" key={customer.id}>
            <div className="customer-top">
              <Avatar name={customer.name} size="large" color={index} />
              <button
                className="icon-button"
                aria-label={`Enviar mensagem para ${customer.name}`}
                onClick={() => message(customer)}
              >
                <MessageCircle size={19} />
              </button>
            </div>
            <h3>{customer.name}</h3>
            <p>{customer.email}</p>
            <small>{customer.phone}</small>
            <div className="customer-metrics">
              <div>
                <strong>{customer.visits}</strong>
                <span>atendimentos concluídos</span>
              </div>
              <div>
                <strong>{money(customer.totalCents)}</strong>
                <span>em pedidos pagos</span>
              </div>
            </div>
            <button className="button secondary full" onClick={() => message(customer)}>
              <Send size={15} />
              Enviar mensagem
            </button>
          </article>
        ))}
      </div>
      {!resource.loading && !resource.error && !customers.length && (
        <Empty
          title="Suas próximas conexões começam aqui"
          description="Convide seus clientes para se cadastrarem na sua loja."
        />
      )}
    </>
  );
}
