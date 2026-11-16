"use client";
import { useState } from "react";
import {
  Field,
  ResourceState,
  useResource,
  type SectionProps,
} from "@/modules/shared/presentation/ui";
import {
  reminderError,
  reminderFields,
  type ReminderModel,
  type ReminderModels,
} from "./care-types";
const example: Record<string, string> = {
  nome: "Ana",
  servico: "Corte de cabelo",
  data: "20/11/2026",
  horario: "14:30",
  profissional: "Marina",
  estabelecimento: "Estúdio Aurora",
};
export function ReminderModelsEditor(props: SectionProps) {
  const resource = useResource<ReminderModels>(
      "workspace/care/template",
      props.revision,
    ),
    [draft, setDraft] = useState<ReminderModel | null>(null),
    [busy, setBusy] = useState(false),
    [error, setError] = useState("");
  const validation = draft
    ? draft.title.trim().length < 2
      ? "Informe um título com pelo menos 2 caracteres."
      : reminderError(draft.message) ||
        ((resource.value?.templates || []).some(
          (t) =>
            t.id !== draft.id &&
            t.title.trim().toLocaleLowerCase("pt-BR") ===
              draft.title.trim().toLocaleLowerCase("pt-BR"),
        )
          ? "Já existe um lembrete com esse título."
          : "")
    : "";
  const preview =
    draft && !validation
      ? draft.message.replace(/\{([^{}]*)\}/g, (_, key: string) => example[key])
      : "";
  async function save(templates: ReminderModel[]) {
    if (!resource.value) return;
    await props.mutate(
      "workspace/care/template",
      "PUT",
      { revision: resource.value.revision, templates },
      "Modelos de lembrete atualizados.",
    );
    await resource.refresh();
  }
  return (
    <section className="panel settings-panel">
      <div className="panel-heading">
        <div>
          <h2>Lembretes</h2>
          <p>Seus modelos de mensagem, organizados por título.</p>
        </div>
        <button
          className="button primary"
          disabled={
            !resource.value || busy || resource.value.templates.length >= 20
          }
          onClick={() => {
            setDraft({ id: crypto.randomUUID(), title: "", message: "" });
            setError("");
          }}
        >
          Novo lembrete
        </button>
      </div>
      <p>
        Escolha um modelo pelo título no atendimento ou escreva uma mensagem
        avulsa. Os modelos são individuais neste espaço. O envio é sempre manual
        pelo WhatsApp.
      </p>
      <ResourceState {...resource} />
      {resource.value?.templates.map((t) => (
        <article className="care-list-row" key={t.id}>
          <div>
            <strong>{t.title}</strong>
            <p className="care-template-excerpt">{t.message}</p>
          </div>
          <div className="row-actions">
            <button
              className="button secondary"
              disabled={busy}
              onClick={() => {
                setDraft({ ...t });
                setError("");
              }}
            >
              Editar {t.title}
            </button>
            <button
              className="button secondary"
              disabled={busy}
              onClick={() =>
                props.openDialog({
                  title: "Excluir lembrete?",
                  description:
                    "Os atendimentos e mensagens já enviadas não serão alterados.",
                  content: <p>{t.title}</p>,
                  submitLabel: "Excluir modelo",
                  onSubmit: async () => {
                    await save(
                      resource.value!.templates.filter((m) => m.id !== t.id),
                    );
                    if (draft?.id === t.id) setDraft(null);
                  },
                })
              }
            >
              Excluir {t.title}
            </button>
          </div>
        </article>
      ))}
      {resource.value && !resource.value.templates.length && (
        <p>
          Sem modelos salvos. Você pode cadastrar um ou escrever uma mensagem
          avulsa no atendimento.
        </p>
      )}
      {draft && (
        <form
          className="form-grid care-reminder"
          onSubmit={async (e) => {
            e.preventDefault();
            if (validation || !resource.value) return;
            setBusy(true);
            setError("");
            try {
              const normalized = {
                  ...draft,
                  title: draft.title.trim(),
                  message: draft.message.trim(),
                },
                templates = resource.value.templates.some(
                  (t) => t.id === draft.id,
                )
                  ? resource.value.templates.map((t) =>
                      t.id === draft.id ? normalized : t,
                    )
                  : [...resource.value.templates, normalized];
              await save(templates);
              setDraft(null);
            } catch (e) {
              setError((e as Error).message);
            } finally {
              setBusy(false);
            }
          }}
        >
          <h3>
            {resource.value?.templates.some((t) => t.id === draft.id)
              ? "Editar lembrete"
              : "Novo lembrete"}
          </h3>
          <Field label="Título do lembrete">
            <input
              value={draft.title}
              required
              minLength={2}
              maxLength={60}
              placeholder="Ex.: Confirmação de horário"
              onChange={(e) => setDraft({ ...draft, title: e.target.value })}
            />
          </Field>
          <Field label="Mensagem do modelo">
            <textarea
              value={draft.message}
              required
              maxLength={1500}
              rows={5}
              placeholder="Olá, {nome}! Seu atendimento é dia {data}, às {horario}."
              onChange={(e) => setDraft({ ...draft, message: e.target.value })}
            />
          </Field>
          <div className="care-tokens">
            {reminderFields.map((key) => (
              <button
                className="button secondary"
                type="button"
                key={key}
                onClick={() =>
                  setDraft({ ...draft, message: draft.message + ` {${key}}` })
                }
              >{`{${key}}`}</button>
            ))}
          </div>
          {(validation || error) && (
            <p className="error-message" role="alert">
              {error || validation}
            </p>
          )}
          {preview && (
            <>
              <h4>Prévia com dados fictícios</h4>
              <p className="care-message-preview">{preview}</p>
            </>
          )}
          <div className="row-actions">
            <button
              className="button secondary"
              type="button"
              disabled={busy}
              onClick={() => setDraft(null)}
            >
              Cancelar edição
            </button>
            <button className="button primary" disabled={busy || !!validation}>
              Salvar lembrete
            </button>
          </div>
        </form>
      )}
    </section>
  );
}
