'use client';
import { day, money } from '@/modules/shared/domain/format';
import type { Expense, Wallet as WalletData } from '@/modules/shared/domain/models';
import {
  Badge,
  Field,
  Empty,
  PageHeading,
  PanelHeading,
  ResourceState,
  useResource,
  type SectionProps,
} from '@/modules/shared/presentation/ui';
import { ArrowDownLeft, Clock3, Plus, TrendingUp, Wallet } from 'lucide-react';
import { useState } from 'react';
export function WalletPage(props: SectionProps) {
  const [days, setDays] = useState(30);
  const [tab, setTab] = useState('received');
  const resource = useResource<WalletData>(`insights/wallet?days=${days}`, props.revision);
  const wallet = resource.value;
  const categories = {
    supplies: 'Materiais e produtos',
    rent: 'Aluguel',
    utilities: 'Contas e serviços',
    other: 'Outros',
  };
  function expenseDialog(expense?: Expense) {
    const expenseId = expense?.id || crypto.randomUUID();
    props.openDialog({
      title: expense ? 'Editar despesa paga' : 'Registrar despesa paga',
      description:
        'Registre somente gastos já pagos pela empresa. Eles serão descontados dos recebimentos do período.',
      submitLabel: expense ? 'Salvar despesa' : 'Registrar despesa',
      content: (
        <div className="form-grid">
          <Field label="Descrição">
            <input
              name="description"
              required
              minLength={2}
              maxLength={150}
              defaultValue={expense?.description}
              placeholder="Ex.: Materiais para atendimento"
            />
          </Field>
          <Field label="Categoria">
            <select name="category" defaultValue={expense?.category || 'supplies'}>
              {Object.entries(categories).map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
          </Field>
          <div className="form-row">
            <Field label="Valor pago (R$)">
              <input
                name="amount"
                type="number"
                min="0.01"
                max="1000000"
                step="0.01"
                required
                defaultValue={expense ? expense.amountCents / 100 : undefined}
              />
            </Field>
            <Field label="Data do pagamento">
              <input
                name="paidOn"
                type="date"
                required
                max={props.data.dashboard.date}
                defaultValue={expense?.paidOn || props.data.dashboard.date}
              />
            </Field>
          </div>
        </div>
      ),
      onSubmit: async (form) => {
        await props.mutate(
          `insights/expenses/${expenseId}`,
          'PUT',
          {
            description: String(form.get('description') || '').trim(),
            category: String(form.get('category')),
            amountCents: Math.round(Number(form.get('amount')) * 100),
            paidOn: String(form.get('paidOn')),
          },
          'Despesa salva.',
        );
      },
    });
  }
  function removeExpense(expense: Expense) {
    props.openDialog({
      title: 'Excluir despesa?',
      description: 'O saldo do período será recalculado. Esta ação não movimenta dinheiro.',
      content: (
        <p>
          {expense.description} · {money(expense.amountCents)}
        </p>
      ),
      submitLabel: 'Excluir despesa',
      onSubmit: async () => {
        await props.mutate(`insights/expenses/${expense.id}`, 'DELETE', {}, 'Despesa excluída.');
      },
    });
  }
  return (
    <>
      <PageHeading
        eyebrow="CLAREZA PARA CRESCER"
        title="Finanças da empresa"
        description="Acompanhe recebimentos, despesas pagas e o saldo do período."
        action={
          <select
            className="period-select"
            aria-label="Período da carteira"
            value={days}
            onChange={(e) => setDays(Number(e.target.value))}
          >
            <option value={30}>Últimos 30 dias</option>
            <option value={60}>Últimos 60 dias</option>
            <option value={90}>Últimos 90 dias</option>
            <option value={180}>Últimos 6 meses</option>
            <option value={365}>Último ano</option>
            <option value={3650}>Todo o histórico (até 10 anos)</option>
          </select>
        }
      />
      <ResourceState {...resource} />
      {wallet && (
        <>
          <section className="panel finance-summary">
            <PanelHeading
              title="Recebimentos e despesas"
              detail={`${day(wallet.periodStart + 'T12:00:00Z')} a ${day(wallet.periodEnd + 'T12:00:00Z')} · por data de pagamento`}
            />
            <div className="stats-grid">
              <article className="stat-card">
                <span className="stat-label">Recebido no período</span>
                <strong className="money-stat">{money(wallet.cashReceivedCents)}</strong>
                <span className="stat-detail">Serviços e produtos com pagamento registrado</span>
              </article>
              <article className="stat-card">
                <span className="stat-label">Despesas pagas</span>
                <strong className="money-stat">{money(wallet.expenseCents)}</strong>
                <span className="stat-detail">Gastos cadastrados no período</span>
              </article>
              <article className="stat-card">
                <span className="stat-label">Saldo do período</span>
                <strong className="money-stat">{money(wallet.balanceCents)}</strong>
                <span className="stat-detail">Recebido menos despesas pagas</span>
              </article>
            </div>
            {wallet.undatedReceivedCents > 0 && (
              <p className="page-footnote">
                Há {money(wallet.undatedReceivedCents)} em pagamentos antigos sem data registrada.
                Eles não entram no saldo por período.
              </p>
            )}
          </section>
          <section className="panel finance-expenses">
            <PanelHeading
              title="Despesas da empresa"
              detail="Materiais, aluguel e contas já pagas."
              action={
                <button className="button primary" onClick={() => expenseDialog()}>
                  <Plus size={16} /> Nova despesa
                </button>
              }
            />
            {wallet.expenses.length ? (
              <div className="table-scroll">
                <table>
                  <thead>
                    <tr>
                      <th>DESCRIÇÃO</th>
                      <th>CATEGORIA</th>
                      <th>PAGAMENTO</th>
                      <th>VALOR</th>
                      <th>AÇÕES</th>
                    </tr>
                  </thead>
                  <tbody>
                    {wallet.expenses.map((expense) => (
                      <tr key={expense.id}>
                        <td>
                          <strong>{expense.description}</strong>
                        </td>
                        <td>{categories[expense.category]}</td>
                        <td>{day(expense.paidOn + 'T12:00:00Z')}</td>
                        <td>{money(expense.amountCents)}</td>
                        <td>
                          <div className="toolbar-controls">
                            <button
                              className="button secondary"
                              onClick={() => expenseDialog(expense)}
                            >
                              Editar
                            </button>
                            <button
                              className="button secondary"
                              onClick={() => removeExpense(expense)}
                            >
                              Excluir
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <Empty
                title="Nenhuma despesa paga neste período"
                description="Cadastre os gastos para acompanhar o saldo da empresa."
              />
            )}
          </section>
          <div className="wallet-grid">
            <article className="wallet-main-card">
              <div>
                <span className="wallet-label">
                  <Wallet size={18} />
                  Valor produzido
                </span>
                <strong>{money(wallet.earnedCents)}</strong>
                <p>Atendimentos e produtos finalizados no período</p>
              </div>
              <span className="wallet-pattern">
                <i />
                <i />
                <i />
              </span>
            </article>
            <article className="stat-card">
              <span className="stat-icon sage">
                <ArrowDownLeft size={20} />
              </span>
              <span className="stat-label">Recebido dos concluídos</span>
              <strong className="money-stat">{money(wallet.receivedCents)}</strong>
              <span className="stat-detail">Pagamentos registrados</span>
            </article>
            <article className="stat-card">
              <span className="stat-icon sand">
                <Clock3 size={20} />
              </span>
              <span className="stat-label">Ainda a receber</span>
              <strong className="money-stat">{money(wallet.unpaidCents)}</strong>
              <span className="stat-detail">Concluídos com pagamento pendente</span>
            </article>
          </div>
          <div className="projection-banner">
            <span className="stat-icon sage">
              <TrendingUp size={22} />
            </span>
            <div>
              <h3>Um olhar para o futuro</h3>
              <p>Você tem {wallet.projection.length} atendimentos confirmados pela frente.</p>
            </div>
            <div>
              <strong>{money(wallet.projectedCents)}</strong>
              <small>em serviços futuros, pagos ou pendentes</small>
            </div>
          </div>
          <section className="panel">
            <PanelHeading
              title="Seu trabalho em números"
              detail="Finalização e pagamento são acompanhados separadamente."
            />
            <div className="table-tabs tabs finance-ledger-tabs">
              <button
                className={tab === 'received' ? 'active' : ''}
                onClick={() => setTab('received')}
              >
                Recebimentos no período
              </button>
              <button
                className={tab === 'completed' ? 'active' : ''}
                onClick={() => setTab('completed')}
              >
                Concluídos no período
              </button>
              <button
                className={tab === 'projection' ? 'active' : ''}
                onClick={() => setTab('projection')}
              >
                Agendados futuros
              </button>
            </div>
            {(tab === 'received'
              ? wallet.cashEntries
              : tab === 'completed'
                ? wallet.entries
                : wallet.projection
            ).length ? (
              <div className="table-scroll">
                <table>
                  <thead>
                    <tr>
                      <th>DESCRIÇÃO</th>
                      <th>CLIENTE</th>
                      <th>DATA</th>
                      <th>VALOR</th>
                      <th>PAGAMENTO</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(tab === 'received'
                      ? wallet.cashEntries
                      : tab === 'completed'
                        ? wallet.entries
                        : wallet.projection
                    ).map((entry) => (
                      <tr key={entry.id}>
                        <td>
                          <strong>{entry.name}</strong>
                        </td>
                        <td>{entry.customerName}</td>
                        <td>{day(entry.date)}</td>
                        <td>
                          <strong className="positive">{money(entry.amountCents)}</strong>
                        </td>
                        <td>
                          <Badge status={entry.paymentStatus} />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <Empty
                title="Nenhum lançamento neste período"
                description="Os valores aparecerão conforme os atendimentos e pedidos avançarem."
              />
            )}
          </section>
          <p className="page-footnote">
            O saldo considera pagamentos com data registrada e despesas cadastradas. Cancelar um
            atendimento não registra estorno. Este controle não representa saldo bancário, lucro
            líquido ou conciliação financeira.
          </p>
        </>
      )}
    </>
  );
}
