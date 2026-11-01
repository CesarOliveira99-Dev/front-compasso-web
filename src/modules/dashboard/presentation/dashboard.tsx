'use client';
import { openBooking } from '@/modules/appointments/presentation/booking-dialog';
import { day, money, time } from '@/modules/shared/domain/format';
import {
  ActionLink,
  Avatar,
  Badge,
  Empty,
  PanelHeading,
  type SectionProps,
} from '@/modules/shared/presentation/ui';
import {
  ArrowRight,
  CalendarDays,
  Check,
  ChevronRight,
  Clock3,
  Flower2,
  MessageSquare,
  Plus,
  ShoppingBag,
  Sparkles,
  Sun,
  Users,
  Wallet,
} from 'lucide-react';
export function DashboardPage(props: SectionProps) {
  const { data, navigate, openDialog } = props;
  const dashboard = data.dashboard;
  const admin = data.user.role === 'admin';
  const firstName = data.user.name.split(' ')[0];
  const today = [...dashboard.today.completed, ...dashboard.today.remaining].sort((a, b) =>
    a.startsAt.localeCompare(b.startsAt),
  );
  function summary() {
    openDialog({
      title: `${dashboard.greeting}, ${firstName}.`,
      description: 'Para hoje, sua agenda e serviços estão assim:',
      content: (
        <div className="day-summary">
          {dashboard.today.showCompleted && (
            <>
              <h3>
                <Check size={17} />O que já foi feito até agora
              </h3>
              {dashboard.today.completedOrders.map((order) => (
                <div className="summary-row" key={order.id}>
                  <ShoppingBag size={16} />
                  <div>
                    <strong>{order.items.map((item) => item.name).join(', ')}</strong>
                    <small>
                      {order.customerName} • {money(order.totalCents)}
                    </small>
                  </div>
                  <Badge status="completed" />
                </div>
              ))}
              {dashboard.today.completed.map((a) => (
                <div className="summary-row" key={a.id}>
                  <Check size={16} />
                  <div>
                    <strong>{a.itemName}</strong>
                    <small>
                      {a.customerName} • {time(a.startsAt)}
                    </small>
                  </div>
                  <Badge status="completed" />
                </div>
              ))}
            </>
          )}
          <h3>
            <Clock3 size={17} />O que vem pela frente
          </h3>
          {dashboard.today.remaining.length ? (
            dashboard.today.remaining.map((a) => (
              <div className="summary-row" key={a.id}>
                <Avatar name={a.customerName} />
                <div>
                  <strong>{a.itemName}</strong>
                  <small>
                    {a.customerName} • {time(a.startsAt)}
                  </small>
                </div>
                <Badge status={a.status} />
              </div>
            ))
          ) : (
            <p>Nenhum atendimento pendente para hoje.</p>
          )}
          {dashboard.unseenOrders.length > 0 && (
            <>
              <h3>
                <ShoppingBag size={17} />
                Compras que você ainda não viu
              </h3>
              {dashboard.unseenOrders.map((o) => (
                <div className="summary-row" key={o.id}>
                  <div>
                    <strong>{o.customerName}</strong>
                    <small>
                      {o.items.map((i) => i.name).join(', ')} • {money(o.totalCents)}
                    </small>
                  </div>
                  <button
                    className="button secondary small"
                    onClick={() =>
                      props
                        .mutate(
                          `orders/${o.id}`,
                          'PATCH',
                          { seen: true },
                          'Compra marcada como vista.',
                        )
                        .catch((e) => props.notify(e.message, true))
                    }
                  >
                    Marcar como vista
                  </button>
                </div>
              ))}
            </>
          )}
        </div>
      ),
    });
  }
  const dateLabel = new Date(`${dashboard.date}T12:00:00-03:00`).toLocaleDateString('pt-BR', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  });
  return (
    <>
      <div className="dashboard-title">
        <div>
          <div className="date-label">
            <span className="tiny-dot" />
            {dateLabel}
          </div>
          <h1>
            {dashboard.greeting}, {firstName}
            <span className="greeting-sun">☀</span>
          </h1>
          <p>
            {admin
              ? 'Cada detalhe em seu lugar. Mais tempo para fazer o que você ama.'
              : 'Seu próximo cuidado começa aqui. Que bom ter você por perto.'}
          </p>
        </div>
        <button
          className="button primary"
          onClick={() => openBooking(props).catch((e) => props.notify(e.message, true))}
        >
          <Plus size={18} />
          Novo agendamento
        </button>
      </div>
      <div className="dashboard-layout">
        <div className="dashboard-main">
          <button className="day-banner" onClick={summary}>
            <span className="banner-icon">
              <Sun size={27} strokeWidth={1.5} />
            </span>
            <div>
              <span className="eyebrow">UMA PAUSA PARA SE ORGANIZAR</span>
              <h2>
                O dia até agora<span>↗</span>
              </h2>
              <p>
                {dashboard.today.completed.length
                  ? `${dashboard.today.completed.length} cuidados concluídos. Veja o que ainda vem pela frente.`
                  : 'Sua agenda, seus cuidados e tudo o que merece atenção.'}
              </p>
            </div>
            <span className="banner-decoration">
              <i />
              <i />
              <i />
            </span>
          </button>
          <div className="section-title">
            <h2>Seu ritmo nesta semana</h2>
            <span>
              {day(dashboard.week.start)} — {day(dashboard.week.end)}
            </span>
          </div>
          <div className="stats-grid">
            <div className="stat-card">
              <span className="stat-icon sage">
                <Clock3 size={19} />
              </span>
              <span className="stat-label">{admin ? 'Horas dedicadas' : 'Tempo de cuidado'}</span>
              <strong>
                {Math.floor(dashboard.weekMinutes / 60)}
                <small>h</small>{' '}
                {dashboard.weekMinutes % 60 > 0 && (
                  <>
                    {Math.round(dashboard.weekMinutes % 60)}
                    <small>min</small>
                  </>
                )}
              </strong>
              <span className="stat-detail">
                <span className="small-dot green" />
                Em atendimentos finalizados
              </span>
            </div>
            <div className="stat-card">
              <span className="stat-icon sand">
                <CalendarDays size={19} />
              </span>
              <span className="stat-label">Agendamentos</span>
              <strong>
                {String(dashboard.weekAppointments).padStart(2, '0')}
                <small> nesta semana</small>
              </strong>
              <span className="stat-detail">{dashboard.completedCount} finalizados até agora</span>
            </div>
            <div className="stat-card">
              <span className="stat-icon lavender">
                {admin ? <Wallet size={19} /> : <Flower2 size={19} />}
              </span>
              <span className="stat-label">
                {admin ? 'Valor dos atendimentos' : 'Seu investimento em você'}
              </span>
              <strong className="money-stat">{money(dashboard.weekRevenueCents)}</strong>
              <span className="stat-detail">Serviços finalizados na semana</span>
            </div>
          </div>
          <section className="panel activity-panel">
            <PanelHeading
              title="Um olhar sobre sua semana"
              detail="Equilíbrio para planejar seus próximos passos."
              action={
                <span className="chart-legend">
                  <i />
                  Horas concluídas
                </span>
              }
            />
            <div className="activity-chart">
              <div className="chart-scale">
                <span>8h</span>
                <span>6h</span>
                <span>4h</span>
                <span>2h</span>
                <span>0</span>
              </div>
              <div className="chart-grid">
                <div className="grid-lines">
                  <i />
                  <i />
                  <i />
                  <i />
                  <i />
                </div>
                {dashboard.weekDays.map((date, index) => (
                  <div
                    className={`chart-column ${date.date === dashboard.date ? 'current' : ''}`}
                    key={date.date}
                  >
                    <div className="chart-bar-space">
                      <div
                        className="chart-bar"
                        style={{
                          height: `${Math.min(100, (date.minutes / Math.max(480, ...dashboard.weekDays.map((d) => d.minutes))) * 100)}%`,
                          minHeight: date.minutes ? 7 : 0,
                        }}
                        title={`${date.minutes / 60}h de atendimento`}
                      >
                        <span>{date.minutes / 60}h</span>
                      </div>
                    </div>
                    <span>{['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'][index]}</span>
                    {date.date === dashboard.date && <i className="today-chart-dot" />}
                  </div>
                ))}
              </div>
            </div>
            <div className="chart-footer">
              <span>
                <Sparkles size={15} />
                Seu tempo tem valor. Cada atendimento conta.
              </span>
              <button
                className="text-button"
                onClick={() => navigate(admin ? 'reports' : 'appointments')}
              >
                Ver detalhes
                <ArrowRight size={14} />
              </button>
            </div>
          </section>
          <section className="panel upcoming-panel">
            <PanelHeading
              title="Próximos encontros"
              detail="Tudo preparado para receber bem."
              action={<ActionLink onClick={() => navigate('appointments')}>Ver agenda</ActionLink>}
            />
            {dashboard.upcoming.length ? (
              <div className="table-scroll">
                <table>
                  <thead>
                    <tr>
                      <th>{admin ? 'CLIENTE' : 'ATENDIMENTO'}</th>
                      <th>SERVIÇO</th>
                      <th>QUANDO</th>
                      <th>STATUS</th>
                    </tr>
                  </thead>
                  <tbody>
                    {dashboard.upcoming.slice(0, 4).map((a, index) => (
                      <tr key={a.id}>
                        <td>
                          <div className="person-cell">
                            <Avatar
                              name={admin ? a.customerName : data.settings.businessName}
                              color={index}
                            />
                            <strong>{admin ? a.customerName : data.settings.businessName}</strong>
                          </div>
                        </td>
                        <td>{a.itemName}</td>
                        <td>
                          <span className="table-date">
                            {day(a.startsAt)}
                            <small>{time(a.startsAt)}</small>
                          </span>
                        </td>
                        <td>
                          <Badge status={a.status} />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <Empty
                title="Espaço para novos encontros"
                description="Seus próximos agendamentos aparecerão aqui."
              />
            )}
          </section>
        </div>
        <aside className="dashboard-rail">
          <section className="panel today-panel">
            <PanelHeading
              title="Na agenda de hoje"
              action={<span className="count-pill">{today.length}</span>}
            />
            <div className="today-date">
              <CalendarDays size={15} />
              {day(dashboard.date)}
              <span>HOJE</span>
            </div>
            <div className="timeline">
              {today.length ? (
                today.map((a, index) => (
                  <div
                    className={`timeline-item ${a.status === 'completed' ? 'done' : ''}`}
                    key={a.id}
                  >
                    <span className="timeline-dot">
                      {a.status === 'completed' && <Check size={10} />}
                    </span>
                    <div className="timeline-content">
                      <div className="timeline-time">
                        {time(a.startsAt)}
                        <span>
                          {Math.round(
                            (new Date(a.endsAt).getTime() - new Date(a.startsAt).getTime()) / 60000,
                          )}{' '}
                          min
                        </span>
                      </div>
                      <strong>{admin ? a.customerName : a.itemName}</strong>
                      <p>{admin ? a.itemName : data.settings.businessName}</p>
                      <Badge status={a.status} />
                    </div>
                  </div>
                ))
              ) : (
                <Empty title="Um dia no seu ritmo" description="Sem atendimentos por aqui hoje." />
              )}
            </div>
            <button className="button secondary full" onClick={() => navigate('appointments')}>
              Abrir minha agenda
              <ArrowRight size={15} />
            </button>
          </section>
          {admin && dashboard.pendingTriage > 0 && (
            <button className="attention-card" onClick={() => navigate('triage')}>
              <span className="stat-icon sand">
                <MessageSquare size={19} />
              </span>
              <div>
                <strong>Um cuidado pede atenção</strong>
                <p>{dashboard.pendingTriage} solicitação aguardando sua avaliação</p>
              </div>
              <ChevronRight size={18} />
            </button>
          )}
          <section className="panel shortcuts-panel">
            <PanelHeading title="Mais leve, mais fácil" />
            <button onClick={() => navigate(admin ? 'customers' : 'catalog')}>
              <span className="shortcut-icon">
                <Users size={17} />
              </span>
              <span>
                {admin ? 'Meus clientes' : 'Conhecer os serviços'}
                <small>
                  {admin ? 'Conexões que fazem seu negócio' : 'Encontre o cuidado ideal'}
                </small>
              </span>
              <ChevronRight size={16} />
            </button>
            <button onClick={() => navigate(admin ? 'wallet' : 'orders')}>
              <span className="shortcut-icon">
                <Wallet size={17} />
              </span>
              <span>
                {admin ? 'Minha carteira' : 'Meus pedidos'}
                <small>
                  {admin ? 'Clareza sobre suas conquistas' : 'Tudo o que foi combinado'}
                </small>
              </span>
              <ChevronRight size={16} />
            </button>
          </section>
          <div className="care-note">
            <span>
              <Flower2 size={21} />
            </span>
            <p>
              Um passo de cada vez.
              <br />
              <strong>Você está construindo algo bonito.</strong>
            </p>
          </div>
        </aside>
      </div>
      <footer className="workspace-footer">
        <span>Seu negócio, no seu ritmo.</span>
        <span>
          feito com cuidado <LeafIcon />
        </span>
      </footer>
    </>
  );
}
function LeafIcon() {
  return <Flower2 size={13} />;
}
