"use client";
import { useState } from "react";
import {
  PageHeading,
  type SectionProps,
} from "@/modules/shared/presentation/ui";
import { AgendaAnalytics } from "./agenda-analytics";
import { AgendaPreferencesEditor } from "./agenda-preferences";
import { WorkspaceClients } from "./workspace-clients";
export function WorkspaceTools(props: SectionProps) {
  const [tab, setTab] = useState("clients");
  return (
    <>
      <PageHeading
        title="Sua agenda por completo"
        description="Clientes, fichas, resultados e uma organização com a sua identidade."
      />
      <div className="tabs agenda-tools-tabs">
        {[
          ["clients", "Clientes e fichas"],
          ["analytics", "Análises e relatórios"],
          ["preferences", "Cores e tema"],
        ].map(([key, label]) => (
          <button
            type="button"
            key={key}
            className={tab === key ? "active" : ""}
            onClick={() => setTab(key)}
          >
            {label}
          </button>
        ))}
      </div>
      {tab === "clients" && <WorkspaceClients {...props} embedded />}
      {tab === "analytics" && <AgendaAnalytics revision={props.revision} />}
      {tab === "preferences" && <AgendaPreferencesEditor {...props} />}
    </>
  );
}
