"use client";
import { useState } from "react";
import {
  Field,
  PageHeading,
  ResourceState,
  useResource,
  type SectionProps,
} from "@/modules/shared/presentation/ui";
import { IdentityInput } from "@/modules/identity/presentation/identity-input";
import { CustomerDossierPanel } from "./customer-dossier";
import type { AgendaContact } from "./tools-types";
export function WorkspaceClients(props: SectionProps & { embedded?: boolean }) {
  const [query, setQuery] = useState("");
  const resource = useResource<AgendaContact[]>(
    "workspace/customers",
    props.revision,
  );
  function contact() {
    const key = crypto.randomUUID();
    props.openDialog({
      title: "Cadastrar contato interno",
      description:
        "Esta ficha não cria login, não envia convite e não publica dados.",
      content: (
        <div className="form-grid">
          <Field label="Nome">
            <IdentityInput kind="name" name="name" required />
          </Field>
          <Field label="Telefone (opcional)">
            <input name="phone" type="tel" maxLength={20} />
          </Field>
          <Field label="E-mail (opcional)">
            <input name="email" type="email" maxLength={254} />
          </Field>
        </div>
      ),
      submitLabel: "Cadastrar contato",
      onSubmit: async (form) => {
        await props.mutate(
          "workspace/contacts",
          "POST",
          {
            idempotencyKey: key,
            name: String(form.get("name")),
            phone: String(form.get("phone") || ""),
            email: String(form.get("email") || ""),
          },
          "Contato cadastrado.",
        );
        setQuery("");
        await resource.refresh();
      },
    });
  }
  return (
    <>
      {!props.embedded && (
        <PageHeading
          title="Clientes"
          description="Consulte as fichas, o histórico de atendimentos e a fidelidade dos seus clientes."
        />
      )}
      <section className="panel settings-panel">
        <div className="panel-heading">
          <h2>Clientes e fichas</h2>
          {props.data.user.role === "admin" && (
            <button className="button primary" onClick={contact}>
              Cadastrar contato
            </button>
          )}
        </div>
        <input
          aria-label="Buscar ficha de cliente"
          placeholder="Nome, telefone ou e-mail"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        <ResourceState {...resource} />
        {resource.value
          ?.filter((c) =>
            `${c.name} ${c.phone} ${c.email}`
              .toLowerCase()
              .includes(query.toLowerCase()),
          )
          .map((c) => (
            <div className="order-line" key={c.id}>
              <div>
                <strong>{c.name}</strong>
                <small>
                  {c.visits} atendimento(s) concluído(s)
                  {c.internal ? " · Contato interno" : ""}
                </small>
              </div>
              <button
                className="button secondary"
                onClick={() =>
                  props.openDialog({
                    title: `Ficha de ${c.name}`,
                    content: (
                      <CustomerDossierPanel customerId={c.id} props={props} />
                    ),
                  })
                }
              >
                Abrir ficha
              </button>
            </div>
          ))}
        {resource.value?.length === 0 && (
          <p>Cadastre um contato para começar a organizar seus atendimentos.</p>
        )}
      </section>
    </>
  );
}
