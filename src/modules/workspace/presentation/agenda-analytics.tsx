"use client";
import { useState } from "react";
import { money, day } from "@/modules/shared/domain/format";
import { ResourceState, useResource } from "@/modules/shared/presentation/ui";
import type { AgendaAnalysis } from "./tools-types";
import { AgendaPie, AttendanceTrend } from "./agenda-charts";
import { workspaceRequestHeaders } from "@/modules/shared/infrastructure/api";
const periods = [
  { days: 7, label: "Semanal" },
  { days: 30, label: "Mensal" },
  { days: 365, label: "Anual" },
];
export function AgendaAnalytics({ revision }: { revision: number }) {
  const [days, setDays] = useState(30);
  const [exporting, setExporting] = useState(false),
    [exportError, setExportError] = useState("");
  async function download() {
    setExporting(true);
    setExportError("");
    try {
      const response = await fetch(`/api/workspace/export?days=${days}`, {
        headers: workspaceRequestHeaders(),
        cache: "no-store",
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Não foi possível exportar.");
      }
      const url = URL.createObjectURL(await response.blob()),
        link = document.createElement("a");
      link.href = url;
      link.download = "compasso-atendimentos.csv";
      link.click();
      setTimeout(() => URL.revokeObjectURL(url), 1000);
    } catch (error) {
      setExportError((error as Error).message);
    } finally {
      setExporting(false);
    }
  }
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
              ["Não compareceram", current.missed || 0],
              ["Clientes atendidos", current.clients],
              ["Clientes de primeira visita", current.firstTimeClients],
              ["Clientes que já retornaram", current.recurringClients],
              ["Valor dos serviços concluídos", money(current.productionCents)],
            ].map(([label, value], index) => (
              <div
                className={label === "Valor dos serviços concluídos" ? "agenda-metric-money" : ""}
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
          {current.comparison && <section className="agenda-chart-card"><h3>Produção em perspectiva</h3><p>Período anterior de mesma duração: {current.comparison.previousCompleted} atendimentos concluídos · {money(current.comparison.previousProductionCents)}.</p><p>{current.comparison.productionChangePercent === null ? "Ainda não há base monetária no período anterior para calcular a variação." : `${current.comparison.productionChangePercent > 0 ? '+' : ''}${current.comparison.productionChangePercent.toLocaleString('pt-BR')}% em valor dos serviços concluídos.`}</p><small>Produção de serviços. Consulte Finanças para recebimentos confirmados e despesas; este indicador não representa lucro.</small></section>}
          {!!current.serviceProduction?.length && <section className="agenda-chart-card"><h3>Valor produzido por serviço</h3><p>Atendimentos concluídos no período. Valores de pagamentos permanecem separados.</p><div className="care-service-production">{current.serviceProduction.map(row=><div key={row.id}><div><span>{row.name} · {row.count} atendimento(s)</span><strong>{money(row.amountCents)}</strong></div><meter min={0} max={Math.max(1,...current.serviceProduction!.map(r=>r.amountCents))} value={row.amountCents} aria-label={`${row.name}: ${money(row.amountCents)}`}/></div>)}</div></section>}
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
          {exportError && (
            <p className="error-message" role="alert">
              {exportError}
            </p>
          )}
          <button
            className="button secondary"
            disabled={exporting}
            onClick={download}
          >
            Exportar atendimentos em CSV
          </button>
        </>
      )}
    </section>
  );
}
