'use client';
import { day, money, time } from '@/modules/shared/domain/format';
import {
  AddButton,
  Avatar,
  Badge,
  Empty,
  PageHeading,
  type SectionProps,
} from '@/modules/shared/presentation/ui';
import { Clock3, MoreHorizontal, Search } from 'lucide-react';
import { useState } from 'react';
import { openBooking } from './booking-dialog';
export function AppointmentsPage(props: SectionProps) {
  const [filter, setFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [date, setDate] = useState('');
  const [professionalId, setProfessionalId] = useState('');
  const admin = props.data.user.role === 'admin';
  const appointments = props.data.appointments
    .filter(
      (a) =>
        (filter === 'all' || a.status === filter) &&
        (!professionalId || (a.professionalId || 'principal') === professionalId) &&
        `${a.customerName} ${a.itemName}`.toLowerCase().includes(search.toLowerCase()) &&
        (!date ||
          new Intl.DateTimeFormat('sv-SE', { timeZone: 'America/Sao_Paulo' }).format(
            new Date(a.startsAt),
          ) === date),
    )
    .sort((a, b) => b.startsAt.localeCompare(a.startsAt));
  const change = (recordId: string, body: unknown, message: string) =>
    props
      .mutate(`appointments/${recordId}`, 'PATCH', body, message)
      .catch((e) => props.notify(e.message, true));
  return (
    <>
      <PageHeading
        eyebrow="UM ESPAÇO PARA CADA ENCONTRO"
        title={admin ? 'Sua agenda' : 'Meus agendamentos'}
        description="Os próximos passos e os cuidados que já fizeram parte da sua história."
        action={
          <AddButton onClick={() => openBooking(props).catch((e) => props.notify(e.message, true))}>
            Novo agendamento
          </AddButton>
        }
      />
      <div className="toolbar appointments-toolbar">
        <div className="tabs">
          {[
            ['all', 'Todos'],
            ['confirmed', 'Confirmados'],
            ['pending', 'Em triagem'],
            ['completed', 'Finalizados'],
          ].map(([key, label]) => (
            <button
              key={key}
              className={filter === key ? 'active' : ''}
              onClick={() => setFilter(key)}
            >
              {label}
            </button>
          ))}
        </div>
        <div className="toolbar-controls">
          <select
            aria-label="Filtrar por profissional"
            value={professionalId}
            onChange={(event) => setProfessionalId(event.target.value)}
          >
            <option value="">Todos os profissionais</option>
            {Array.from(
              new Map(
                props.data.appointments.map((a) => [
                  a.professionalId || 'principal',
                  a.professionalName || props.data.settings.name,
                ]),
              ).entries(),
            ).map(([id, name]) => (
              <option key={id} value={id}>
                {name}
              </option>
            ))}
          </select>
          <input
            type="date"
            aria-label="Filtrar por data"
            value={date}
            onChange={(e) => setDate(e.target.value)}
          />
          <label className="search-field">
            <Search size={16} />
            <input
              placeholder="Buscar atendimento…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </label>
        </div>
      </div>
      <section className="panel">
        {appointments.length ? (
          <div className="table-scroll">
            <table className="appointments-table">
              <thead>
                <tr>
                  <th>CLIENTE / SERVIÇO</th>
                  <th>DATA E HORÁRIO</th>
                  <th>VALOR</th>
                  <th>STATUS</th>
                  <th>PAGAMENTO</th>
                  <th>AÇÕES</th>
                </tr>
              </thead>
              <tbody>
                {appointments.map((a, index) => (
                  <tr key={a.id}>
                    <td data-label={admin ? 'Cliente / Serviço' : 'Serviço'}>
                      <div className="person-cell">
                        <Avatar name={a.customerName} color={index} />
                        <div>
                          <strong>{admin ? a.customerName : a.itemName}</strong>
                          <small>{admin ? a.itemName : props.data.settings.businessName}</small>
                        </div>
                      </div>
                    </td>
                    <td data-label="Data e horário">
                      <span className="table-date">
                        {day(a.startsAt)}
                        <small>{a.professionalName || props.data.settings.name}</small>
                        <small>
                          {time(a.startsAt)} — {time(a.endsAt)}
                        </small>
                      </span>
                    </td>
                    <td data-label="Valor">
                      <strong>{money(a.priceCents)}</strong>
                    </td>
                    <td data-label="Atendimento">
                      <Badge status={a.status} />
                    </td>
                    <td data-label="Pagamento">
                      <Badge status={a.paymentStatus} />
                    </td>
                    <td data-label="Ações">
                      <div className="row-actions">
                        {a.status === 'confirmed' && admin && (
                          <button
                            className="button secondary small"
                            onClick={() =>
                              change(
                                a.id,
                                { status: 'completed' },
                                'Atendimento finalizado. O cliente já pode avaliar.',
                              )
                            }
                          >
                            Finalizar
                          </button>
                        )}
                        {a.paymentStatus !== 'paid' && admin && a.status !== 'cancelled' && (
                          <button
                            className="text-button"
                            onClick={() =>
                              change(
                                a.id,
                                { paymentStatus: 'paid' },
                                'Pagamento registrado manualmente.',
                              )
                            }
                          >
                            Marcar pago
                          </button>
                        )}
                        {['confirmed', 'pending'].includes(a.status) && (
                          <button
                            className="icon-button"
                            aria-label="Opções do agendamento"
                            onClick={() =>
                              props.openDialog({
                                title: a.itemName,
                                description: `${a.customerName} • ${day(a.startsAt)} às ${time(a.startsAt)}`,
                                content: (
                                  <div className="form-grid">
                                    <p>{a.notes || 'Nenhuma observação registrada.'}</p>
                                    <button
                                      type="button"
                                      className="button primary"
                                      onClick={() =>
                                        openBooking(props, a.itemId, a).catch((error) =>
                                          props.notify(error.message, true),
                                        )
                                      }
                                    >
                                      Reagendar
                                    </button>
                                    <button
                                      type="button"
                                      className="button danger"
                                      onClick={() =>
                                        props.openDialog({
                                          title: 'Cancelar este agendamento?',
                                          description: 'O horário será liberado na agenda.',
                                          content: (
                                            <p>
                                              {a.itemName} • {a.customerName}
                                            </p>
                                          ),
                                          submitLabel: 'Confirmar cancelamento',
                                          onSubmit: async () => {
                                            await props.mutate(
                                              `appointments/${a.id}`,
                                              'PATCH',
                                              { status: 'cancelled' },
                                              'Agendamento cancelado.',
                                            );
                                          },
                                        })
                                      }
                                    >
                                      Cancelar agendamento
                                    </button>
                                  </div>
                                ),
                              })
                            }
                          >
                            <MoreHorizontal size={18} />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <Empty
            title="Nenhum encontro por aqui"
            description="Ajuste os filtros ou encontre um novo horário."
          />
        )}
      </section>
      <p className="page-footnote">
        <Clock3 size={14} />
        Horário de Brasília • Os horários são reservados na confirmação do agendamento.
      </p>
    </>
  );
}
