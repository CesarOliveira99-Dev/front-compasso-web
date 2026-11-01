'use client';
import { day, money } from '@/modules/shared/domain/format';
import type { Wallet as WalletData } from '@/modules/shared/domain/models';
import {
  Badge,
  Empty,
  PageHeading,
  PanelHeading,
  ResourceState,
  useResource,
  type SectionProps,
} from '@/modules/shared/presentation/ui';
import { ArrowDownLeft, Clock3, TrendingUp, Wallet } from 'lucide-react';
import { useState } from 'react';
export function WalletPage(props: SectionProps) {
  const [days, setDays] = useState(30);
  const [tab, setTab] = useState('completed');
  const resource = useResource<WalletData>(`insights/wallet?days=${days}`, props.revision);
  const wallet = resource.value;
  return (
    <>
      <PageHeading
        eyebrow="CLAREZA PARA CRESCER"
        title="Sua carteira"
        description="Veja o valor do seu trabalho e planeje o que vem pela frente."
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
            <div className="table-tabs tabs">
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
            {(tab === 'completed' ? wallet.entries : wallet.projection).length ? (
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
                    {(tab === 'completed' ? wallet.entries : wallet.projection).map((entry) => (
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
            A carteira acompanha o valor das solicitações. Ela não representa saldo bancário, lucro
            líquido ou conciliação financeira.
          </p>
        </>
      )}
    </>
  );
}
