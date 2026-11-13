"use client";
import { useState } from "react";
import type { AgendaChartSlice, AgendaAnalysis } from "./tools-types";
import { day } from "@/modules/shared/domain/format";
export function AgendaPie({
  title,
  description,
  rows,
}: {
  title: string;
  description: string;
  rows: AgendaChartSlice[];
}) {
  const [selected, setSelected] = useState<string | null>(null);
  const nonzero = rows.filter((row) => row.count > 0);
  const slices =
    nonzero.length > 6
      ? [
          ...nonzero.slice(0, 5),
          {
            id: "chart-other",
            name: "Outros",
            color: "#64748b",
            count: nonzero.slice(5).reduce((sum, row) => sum + row.count, 0),
          },
        ]
      : nonzero;
  const total = slices.reduce((sum, row) => sum + row.count, 0);
  let offset = 0;
  const gradient = slices
    .map((row) => {
      const start = offset;
      offset += (row.count / total) * 100;
      return `${row.color} ${start}% ${offset}%`;
    })
    .join(",");
  const active = slices.find((row) => row.id === selected);
  const percentage = (count: number) =>
    new Intl.NumberFormat("pt-BR", {
      style: "percent",
      maximumFractionDigits: 1,
    }).format(count / total);
  return (
    <section className="agenda-chart-card">
      <h3>{title}</h3>
      <p className="agenda-chart-description">{description}</p>
      {total > 0 ? (
        <>
          <div
            className="agenda-pie"
            role="img"
            aria-label={`${title}. Total: ${total}. ${slices.map((row) => `${row.name}: ${row.count}, ${percentage(row.count)}`).join("; ")}`}
            style={{ background: `conic-gradient(${gradient})` }}
          >
            <div className="agenda-pie-center" aria-hidden="true">
              <strong>{active?.count ?? total}</strong>
              <span>{active ? percentage(active.count) : "no período"}</span>
            </div>
          </div>
          <ul className="agenda-chart-legend">
            {slices.map((row) => (
              <li key={row.id}>
                <button
                  type="button"
                  aria-pressed={row.id === selected}
                  onClick={() =>
                    setSelected(row.id === selected ? null : row.id)
                  }
                >
                  <i style={{ background: row.color }} aria-hidden="true" />
                  <span>{row.name}</span>
                  <strong>
                    {row.count} <small>({percentage(row.count)})</small>
                  </strong>
                </button>
              </li>
            ))}
          </ul>
        </>
      ) : (
        <p className="agenda-chart-empty">
          Sem dados para este gráfico no período.
        </p>
      )}
    </section>
  );
}
export function AttendanceTrend({ data }: { data: AgendaAnalysis }) {
  const maximum = Math.max(
    1,
    ...data.trend.flatMap((row) => [row.clients, row.completed]),
  );
  return (
    <section className="agenda-chart-card agenda-trend">
      <h3>Clientes e atendimentos concluídos</h3>
      <p className="agenda-chart-description">
        {data.trendGrouping === "day"
          ? "Por dia"
          : data.trendGrouping === "week"
            ? "Em intervalos de 7 dias"
            : "Por mês"}
        . Cada cliente conta uma vez em cada intervalo, mesmo com vários
        atendimentos.
      </p>
      <div className="agenda-series-legend">
        <span>
          <i style={{ background: "#397c96" }} />
          Clientes únicos
        </span>
        <span>
          <i style={{ background: "#4d8658" }} />
          Atendimentos
        </span>
      </div>
      <div
        className="agenda-trend-scroll"
        tabIndex={0}
        role="region"
        aria-label="Gráfico de evolução de clientes e atendimentos"
      >
        <div
          className={`agenda-trend-plot ${data.trend.length > 8 ? "wide" : ""}`}
        >
          <div className="agenda-trend-scale" aria-hidden="true">
            <span>{maximum}</span>
            <span>0</span>
          </div>
          {data.trend.map((row) => (
            <div className="agenda-trend-column" key={row.key}>
              <div
                className="agenda-trend-bars"
                role="img"
                aria-label={`${day(row.start)} a ${day(row.end)}: ${row.clients} clientes e ${row.completed} atendimentos`}
                title={`${day(row.start)} a ${day(row.end)}: ${row.clients} clientes · ${row.completed} atendimentos`}
              >
                <span
                  style={{
                    height: `${(row.clients / maximum) * 100}%`,
                    background: "#397c96",
                  }}
                />
                <span
                  style={{
                    height: `${(row.completed / maximum) * 100}%`,
                    background: "#4d8658",
                  }}
                />
              </div>
              <small>
                {data.trendGrouping === "month"
                  ? new Date(`${row.start}T12:00:00Z`).toLocaleDateString(
                      "pt-BR",
                      { month: "short", year: "2-digit", timeZone: "UTC" },
                    )
                  : row.start.slice(8) + "/" + row.start.slice(5, 7)}
              </small>
            </div>
          ))}
        </div>
      </div>
      <details>
        <summary>Ver os números do gráfico</summary>
        <div className="table-scroll">
          <table>
            <thead>
              <tr>
                <th>Período</th>
                <th>Clientes únicos</th>
                <th>Atendimentos</th>
              </tr>
            </thead>
            <tbody>
              {data.trend.map((row) => (
                <tr key={row.key}>
                  <td>
                    {day(row.start)} a {day(row.end)}
                  </td>
                  <td>{row.clients}</td>
                  <td>{row.completed}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </details>
    </section>
  );
}
