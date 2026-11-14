"use client";
import { ClientSnapshot, ReturnRuleForm } from './client-care';
import { useEffect, useState } from "react";
import { api } from "@/modules/shared/infrastructure/api";
import { day, money, time } from "@/modules/shared/domain/format";
import {
  Badge,
  Field,
  ResourceState,
  useResource,
  type SectionProps,
} from "@/modules/shared/presentation/ui";
import type { CustomerDossier } from "./tools-types";
import { WhatsAppLink } from "@/modules/shared/presentation/whatsapp-link";
export function CustomerDossierPanel({
  customerId,
  props,
}: {
  customerId: string;
  props: SectionProps;
}) {
  const [revision, setRevision] = useState(0),
    resource = useResource<CustomerDossier>(
      `workspace/customers/${customerId}`,
      revision,
    );
  const [draft, setDraft] = useState<CustomerDossier["dossier"] | null>(null),
    [busy, setBusy] = useState(false),
    [redemptionKey, setRedemptionKey] = useState(() => crypto.randomUUID());
  useEffect(() => {
    if (resource.value && !draft) setDraft(resource.value.dossier);
  }, [resource.value, draft]);
  async function action(path: string, body: unknown) {
    setBusy(true);
    try {
      const result = await api(path, "PUT", body);
      setRevision((n) => n + 1);
      props.notify("Ficha atualizada.");
      return result;
    } catch (error) {
      props.notify((error as Error).message, true);
      throw error;
    } finally {
      setBusy(false);
    }
  }
  const data = resource.value;
  return (
    <div className="form-grid">
      <ResourceState {...resource} />
      {data && draft && (
        <>
          <p>
            {data.customer.phone || "Telefone não informado"} ·{" "}
            {data.customer.email || "Sem e-mail"}
            {data.customer.internal
              ? " · Contato interno, sem acesso à plataforma"
              : ""}
          </p>
          <WhatsAppLink phone={data.customer.phone} />
          <ClientSnapshot customerId={customerId} revision={props.revision} />
          <ReturnRuleForm props={props} customerId={customerId} />
          <form
            className="form-grid"
            onSubmit={async (e) => {
              e.preventDefault();
              try {
                const saved = await action(
                  `workspace/customers/${customerId}`,
                  {
                    revision: draft.revision,
                    notes: draft.notes,
                    preferences: draft.preferences,
                    tags: draft.tags,
                    fields: draft.fields,
                  },
                );
                setDraft(saved as CustomerDossier["dossier"]);
              } catch {}
            }}
          >
            <Field label="Preferências">
              <textarea
                maxLength={2000}
                aria-label="Preferências"
                value={draft.preferences}
                onChange={(e) =>
                  setDraft({ ...draft, preferences: e.target.value })
                }
              />
            </Field>
            <Field label="Observações privadas">
              <textarea
                maxLength={4000}
                aria-label="Observações privadas"
                rows={4}
                value={draft.notes}
                onChange={(e) => setDraft({ ...draft, notes: e.target.value })}
              />
            </Field>
            <Field label="Etiquetas (separadas por vírgula)">
              <input
                defaultValue={draft.tags.join(", ")}
                onChange={(e) =>
                  setDraft({
                    ...draft,
                    tags: e.target.value
                      .split(",")
                      .map((s) => s.trim())
                      .filter(Boolean),
                  })
                }
              />
            </Field>
            <h3>Campos da ficha</h3>
            {draft.fields.map((field, index) => (
              <div className="form-row" key={index}>
                <Field label="Campo">
                  <input
                    required
                    maxLength={50}
                    value={field.label}
                    onChange={(e) =>
                      setDraft({
                        ...draft,
                        fields: draft.fields.map((f, i) =>
                          i === index ? { ...f, label: e.target.value } : f,
                        ),
                      })
                    }
                  />
                </Field>
                <Field label="Informação">
                  <input
                    maxLength={500}
                    value={field.value}
                    onChange={(e) =>
                      setDraft({
                        ...draft,
                        fields: draft.fields.map((f, i) =>
                          i === index ? { ...f, value: e.target.value } : f,
                        ),
                      })
                    }
                  />
                </Field>
                <button
                  type="button"
                  className="text-button"
                  onClick={() =>
                    setDraft({
                      ...draft,
                      fields: draft.fields.filter((_, i) => i !== index),
                    })
                  }
                >
                  Remover
                </button>
              </div>
            ))}
            <button
              type="button"
              className="button secondary"
              disabled={draft.fields.length >= 20}
              onClick={() =>
                setDraft({
                  ...draft,
                  fields: [...draft.fields, { label: "", value: "" }],
                })
              }
            >
              Adicionar campo à ficha
            </button>
            {draft.updatedAt && (
              <small>
                Última atualização: {day(draft.updatedAt)} às{" "}
                {time(draft.updatedAt)}.
              </small>
            )}
            <button className="button primary" disabled={busy}>
              Salvar ficha
            </button>
          </form>
          <h3>Fidelidade</h3>
          {data.loyalty ? (
            <>
              <p>
                {data.loyalty.visits} atendimentos concluídos · meta de{" "}
                {data.loyalty.goal} · {data.loyalty.redemptions} benefício(s)
                resgatado(s).
              </p>
              <p>
                {data.loyalty.reward} · {data.loyalty.available} disponível(is).
              </p>
              <button
                className="button secondary"
                disabled={busy || data.loyalty.available < 1}
                onClick={async () => {
                  setBusy(true);
                  try {
                    await api(
                      `workspace/customers/${customerId}/redeem`,
                      "POST",
                      { idempotencyKey: redemptionKey },
                    );
                    setRedemptionKey(crypto.randomUUID());
                    setRevision((n) => n + 1);
                    props.notify("Resgate registrado.");
                  } catch (e) {
                    props.notify((e as Error).message, true);
                  } finally {
                    setBusy(false);
                  }
                }}
              >
                Registrar resgate
              </button>
            </>
          ) : (
            <p>Sem regra de fidelidade definida.</p>
          )}
          {props.data.user.role === "admin" && (
            <form
              className="form-grid"
              key={`rule-${data.loyalty?.goal}`}
              onSubmit={async (e) => {
                e.preventDefault();
                const form = new FormData(e.currentTarget);
                try {
                  await action(`workspace/customers/${customerId}/reward`, {
                    goal: Number(form.get("goal")),
                    reward: String(form.get("reward")),
                  });
                } catch {}
              }}
            >
              <Field label="Meta de atendimentos concluídos">
                <input
                  type="number"
                  name="goal"
                  required
                  min={1}
                  max={1000}
                  defaultValue={data.loyalty?.goal || 10}
                />
              </Field>
              <Field label="Benefício">
                <input
                  name="reward"
                  required
                  minLength={2}
                  maxLength={200}
                  defaultValue={data.loyalty?.reward || ""}
                  placeholder="Ex.: um serviço de cortesia"
                />
              </Field>
              <button className="button secondary" disabled={busy}>
                Salvar regra de fidelidade
              </button>
            </form>
          )}
          <h3>Histórico de atendimentos</h3>
          {data.appointments.length ? (
            data.appointments.map((a) => (
              <div className="order-line" key={a.id}>
                <div>
                  <strong>{a.itemName}</strong>
                  <small>
                    {day(a.startsAt)} · {time(a.startsAt)} ·{" "}
                    {a.professionalName}
                  </small>
                </div>
                <Badge status={a.attendanceOutcome === "no_show" ? "no_show" : a.status} />
                <span>{money(a.priceCents)}</span>
              </div>
            ))
          ) : (
            <p>Nenhum atendimento vinculado.</p>
          )}
        </>
      )}
    </div>
  );
}
