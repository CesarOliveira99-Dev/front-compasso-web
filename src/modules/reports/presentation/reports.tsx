'use client';
import { day, money, statusLabel, time } from '@/modules/shared/domain/format';
import type { Report } from '@/modules/shared/domain/models';
import {
  Badge,
  Empty,
  PageHeading,
  ResourceState,
  useResource,
  type SectionProps,
} from '@/modules/shared/presentation/ui';
import { CalendarDays, Check, Clock3, Download } from 'lucide-react';
import { useState } from 'react';
export function ReportsPage(props: SectionProps) {
  const [month, setMonth] = useState(props.data.dashboard.date.slice(0, 7));
  const resource = useResource<Report>(`insights/report?month=${month}`, props.revision);
  const report = resource.value;
  function download() {
    if (!report) return;
    const csvCell = (value: unknown) => {
      let text = String(value);
      if (/^[=+@-]/.test(text)) text = `'${text}`;
      return `"${text.replace(/"/g, '""')}"`;
    };
    const rows = [
      [
        'Cliente',
        'Serviço',
        'Início (Brasília)',
        'Fim (Brasília)',
        'Status',
        'Pagamento',
        'Valor (R$)',
      ],
      ...report.appointments.map((a) => [
        a.customerName,
        a.itemName,
        new Date(a.startsAt).toLocaleString('pt-BR', { timeZone: 'America/Sao_Paulo' }),
        new Date(a.endsAt).toLocaleString('pt-BR', { timeZone: 'America/Sao_Paulo' }),
        statusLabel[a.status],
        statusLabel[a.paymentStatus],
        (a.priceCents / 100).toFixed(2).replace('.', ','),
      ]),
    ];
    const blob = new Blob(['\uFEFF' + rows.map((row) => row.map(csvCell).join(';')).join('\r\n')], {
      type: 'text/csv;charset=utf-8;',
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `compasso-agenda-${month}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  }
  return (
    <>
      <PageHeading
        eyebrow="INFORMAÇÃO QUE ABRE CAMINHOS"
        title="Relatórios da agenda"
        description="Um extrato dos encontros, resultados e cuidados do mês."
        action={
          <div className="toolbar-controls">
            <input
              type="month"
              aria-label="Mês do relatório"
              value={month}
              onChange={(e) => {
                if (e.target.value) setMonth(e.target.value);
              }}
            />
            <button className="button primary" disabled={!report} onClick={download}>
              <Download size={16} />
              Exportar CSV
            </button>
          </div>
        }
      />
      <ResourceState {...resource} />
      {report && (
        <>
          <div className="stats-grid report-stats">
            {[
              [CalendarDays, 'Agendamentos no mês', report.total],
              [Check, 'Finalizados', report.completed],
              [Clock3, 'Valor concluído', money(report.totalCents)],
            ].map(([Icon, label, value], index) => {
              const Symbol = Icon as typeof CalendarDays;
              return (
                <div className="stat-card" key={index}>
                  <span className="stat-icon sage">
                    <Symbol size={19} />
                  </span>
                  <span className="stat-label">{String(label)}</span>
                  <strong>{String(value)}</strong>
                  <span className="stat-detail">
                    {index === 0 ? `${report.cancelled} cancelados` : 'Período selecionado'}
                  </span>
                </div>
              );
            })}
          </div>
          <section className="panel">
            {report.appointments.length ? (
              <div className="table-scroll">
                <table>
                  <thead>
                    <tr>
                      <th>CLIENTE</th>
                      <th>SERVIÇO</th>
                      <th>DATA</th>
                      <th>VALOR</th>
                      <th>STATUS</th>
                      <th>PAGAMENTO</th>
                    </tr>
                  </thead>
                  <tbody>
                    {report.appointments.map((a) => (
                      <tr key={a.id}>
                        <td>
                          <strong>{a.customerName}</strong>
                        </td>
                        <td>{a.itemName}</td>
                        <td>
                          {day(a.startsAt)} • {time(a.startsAt)}
                        </td>
                        <td>{money(a.priceCents)}</td>
                        <td>
                          <Badge status={a.status} />
                        </td>
                        <td>
                          <Badge status={a.paymentStatus} />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <Empty
                title="Um mês que ainda vai ganhar histórias"
                description="Não há agendamentos neste período."
              />
            )}
          </section>
        </>
      )}
    </>
  );
}
