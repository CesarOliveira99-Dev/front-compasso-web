"use client";
import { useState } from "react";
import { money, day } from "@/modules/shared/domain/format";
import { ResourceState, useResource } from "@/modules/shared/presentation/ui";
import type { AgendaAnalysis } from "./tools-types";
import { AgendaPie, AttendanceTrend } from "./agenda-charts";
const periods = [
  { days: 7, label: "Semanal" },
  { days: 30, label: "Mensal" },
  { days: 365, label: "Anual" },
];
export function AgendaAnalytics({ revision }: { revision: number }) {
  const [days, setDays] = useState(30);
  const resource = useResource<AgendaAnalysis>(
      `workspace/analytics?days=${days}`,
      revision,
    ),
    data = resource.value;
  const current = data?.days === days ? data : undefined;
  return (
    <section className="panel settings-panel agenda-analytics">
      <div className="panel-heading">
        <div>
          <h2>Análises da agenda</h2>
          <p>
            Entenda o movimento, o retorno dos clientes e os serviços mais
            procurados.
          </p>
        </div>
        <div
          className="agenda-periods"
          role="group"
          aria-label="Período das análises"
        >
          {periods.map((period) => (
            <button
              className={period.days === days ? "active" : ""}
              key={period.days}
              aria-pressed={period.days === days}
              onClick={() => setDays(period.days)}
            >
              {period.label}
            </button>
          ))}
        </div>
      </div>
      <ResourceState {...resource} />
      {!current && !resource.error && <p role="status">Carregando análises…</p>}
      {current && (
        <>
          <p>
            {current.scope === "professional"
              ? "Somente seus atendimentos e clientes."
              : "Resultados de toda a sua agenda."}{" "}
            Últimos {current.days} dias: {day(current.firstDate)} a{" "}
            {day(current.today)}.
          </p>
          <div className="agenda-metrics">
            {[
              ["Agendamentos", current.total],
              ["Concluídos", current.completed],
              ["Cancelados", current.cancelled],
              ["Clientes atendidos", current.clients],
              ["Clientes de primeira visita", current.firstTimeClients],
              ["Clientes que já retornaram", current.recurringClients],
              ["Valor dos serviços concluídos", money(current.productionCents)],
            ].map(([label, value], index) => (
              <div
                className={index === 6 ? "agenda-metric-money" : ""}
                key={label}
              >
                <small>{label}</small>
                <strong>{value}</strong>
              </div>
            ))}
          </div>
          <p className="form-note">
            Clientes atendidos são pessoas com atendimento concluído. O valor
            dos serviços representa produção; os recebimentos confirmados ficam
            em Finanças.
          </p>
          <AttendanceTrend data={current} />
          <div className="agenda-pies">
            <AgendaPie
              title="Primeira visita ou retorno"
              description="Clientes únicos atendidos no período. Quem tem mais de uma visita concluída no histórico já conta como retorno."
              rows={current.clientMix}
            />
            <AgendaPie
              title="Atendimentos por categoria"
              description="Atendimentos concluídos, conforme a categoria escolhida: atendimento, retorno e outras. Compromissos pessoais ficam de fora."
              rows={current.attendanceCategories}
            />
            <AgendaPie
              title="Serviços mais solicitados"
              description="Pela data do atendimento: inclui agendados e concluídos no período. Exclui cancelamentos e compromissos pessoais."
              rows={current.services}
            />
          </div>
          <a
            className="button secondary"
            href={`/api/workspace/export?days=${days}`}
          >
            Exportar atendimentos em CSV
          </a>
        </>
      )}
    </section>
  );
}
