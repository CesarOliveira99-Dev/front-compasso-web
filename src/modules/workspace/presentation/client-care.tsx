"use client";
import { ReminderModelsEditor } from "./reminder-models";
import type { ReminderModels } from "./care-types";
import { useEffect, useState } from "react";
import type { Appointment, Professional } from "@/modules/shared/domain/models";
import { api } from "@/modules/shared/infrastructure/api";
import { day, time, money, inputToIso } from "@/modules/shared/domain/format";
import {
  Field,
  PageHeading,
  ResourceState,
  useResource,
  type SectionProps,
} from "@/modules/shared/presentation/ui";
import { WhatsAppLink } from "@/modules/shared/presentation/whatsapp-link";
import { whatsappUrl } from "@/modules/shared/domain/whatsapp";
import type { AgendaContact } from "./tools-types";
import {
  reminderFields,
  reminderError,
  type CareSummary,
  type ReturnEntry,
  type AgendaBlock,
  type WaitEntry,
} from "./care-types";
const states: Record<string, string> = {
  paused: "Acompanhamento pausado",
  scheduled: "Já agendado",
  no_history: "Aguardando primeira conclusão",
  overdue: "Retorno em atraso",
  due: "Retorno próximo",
  later: "Retorno futuro",
  waiting: "Aguardando vaga",
  contacted: "Contato iniciado",
  booked: "Agendado",
  cancelled: "Encerrado",
};
export function ClientSnapshot({
  customerId,
  revision,
}: {
  customerId: string;
  revision: number;
}) {
  const resource = useResource<{
      summary: CareSummary;
      preferences: string;
      notes: string;
    }>(`workspace/care/customers/${customerId}`, revision),
    s = resource.value?.summary;
  return (
    <section className="care-client-summary">
      <h3>Resumo do cliente</h3>
      <ResourceState {...resource} />
      {s && (
        <>
          <div className="care-stat-grid">
            {[
              ["Atendimentos", s.completed],
              ["Cancelamentos", s.cancelled],
              ["Faltas", s.missed],
              ["Produção em serviços", money(s.productionCents)],
            ].map(([label, value]) => (
              <div key={label}>
                <small>{label}</small>
                <strong>{value}</strong>
              </div>
            ))}
          </div>
          <p>
            {s.lastVisit
              ? `Última visita: ${day(s.lastVisit)} · ${s.lastService} · há ${s.daysSinceLast} dia(s).`
              : "Ainda não há atendimento concluído."}
          </p>
          {s.averageMinutes > 0 && (
            <p>
              Duração média: {s.averageMinutes} minutos. Produção não representa
              recebimento confirmado.
            </p>
          )}
          <div
            className="care-client-trend"
            role="img"
            aria-label="Atendimentos concluídos nos últimos seis meses"
          >
            {s.monthly.map((m) => (
              <div key={m.month}>
                <span>{m.count}</span>
                <i
                  style={{
                    height:
                      Math.max(
                        2,
                        (m.count /
                          Math.max(1, ...s.monthly.map((v) => v.count))) *
                          90,
                      ) + "px",
                  }}
                />
                <small>
                  {m.month.slice(5)}/{m.month.slice(2, 4)}
                </small>
              </div>
            ))}
          </div>
          {resource.value?.preferences && (
            <p>
              <strong>Preferências: </strong>
              {resource.value.preferences}
            </p>
          )}
          {resource.value?.notes && (
            <details>
              <summary>
                Observações privadas para preparar o atendimento
              </summary>
              <p className="care-preserve-lines">{resource.value.notes}</p>
            </details>
          )}
        </>
      )}
    </section>
  );
}
export function ReminderComposer({
  appointment,
  props,
}: {
  appointment: Appointment;
  props: SectionProps;
}) {
  const resource = useResource<ReminderModels>(
    "workspace/care/template",
    props.revision,
  );
  const [selected, setSelected] = useState("manual");
  const [template, setTemplate] = useState(""),
    [preview, setPreview] = useState<{ phone: string; message: string }>(),
    [error, setError] = useState(""),
    [busy, setBusy] = useState(false);
  useEffect(() => {
    if (resource.value) {
      const first = resource.value.templates[0];
      setSelected(first?.id || "manual");
      setTemplate(first?.message || "");
      setPreview(undefined);
    }
  }, [resource.value]);
  const invalid = template ? reminderError(template) : "";
  return (
    <section className="care-reminder form-grid">
      <h3>Lembrete manual</h3>
      <ResourceState {...resource} />
      <Field label="Modelo de lembrete">
        <select
          value={selected}
          onChange={(e) => {
            const id = e.target.value;
            setSelected(id);
            setTemplate(
              resource.value?.templates.find((t) => t.id === id)?.message || "",
            );
            setPreview(undefined);
            setError("");
          }}
        >
          <option value="manual">Escrever mensagem avulsa</option>
          {resource.value?.templates.map((t) => (
            <option key={t.id} value={t.id}>
              {t.title}
            </option>
          ))}
        </select>
      </Field>
      <Field label="Mensagem do lembrete">
        <textarea
          value={template}
          maxLength={1500}
          rows={4}
          onChange={(e) => {
            setTemplate(e.target.value);
            setPreview(undefined);
            setError("");
          }}
        />
      </Field>
      <div className="care-tokens">
        {reminderFields.map((key) => (
          <button
            type="button"
            className="button secondary"
            key={key}
            onClick={() => {
              setTemplate((t) => t + ` {${key}}`);
              setPreview(undefined);
            }}
          >{`{${key}}`}</button>
        ))}
      </div>
      {(invalid || error) && (
        <p className="error-message" role="alert">
          {invalid || error}
        </p>
      )}
      <button
        className="button secondary"
        type="button"
        disabled={!template || !!invalid || busy}
        onClick={async () => {
          setBusy(true);
          try {
            setPreview(
              await api(
                `workspace/care/appointments/${appointment.id}/reminder`,
                "POST",
                {
                  template,
                  ...(selected !== "manual" ? { templateId: selected } : {}),
                },
              ),
            );
            setError("");
          } catch (e) {
            setError((e as Error).message);
          } finally {
            setBusy(false);
          }
        }}
      >
        Gerar prévia do lembrete
      </button>
      {preview && (
        <>
          <p className="care-message-preview">{preview.message}</p>
          <WhatsAppLink
            phone={preview.phone}
            message={preview.message}
            label="Abrir WhatsApp com lembrete"
          />
          {!whatsappUrl(preview.phone) && (
            <p>Cadastre um telefone válido para abrir a conversa.</p>
          )}
        </>
      )}
      <small>
        O Compasso não envia a mensagem. Revise a prévia e confirme o envio no
        WhatsApp.
      </small>
    </section>
  );
}
function ProfessionalField({
  props,
  defaultValue,
}: {
  props: SectionProps;
  defaultValue?: string;
}) {
  const resource = useResource<Professional[]>("professionals", props.revision);
  const [value, setValue] = useState(
    defaultValue || props.data.user.professionalId || "principal",
  );
  return (
    <Field label="Profissional">
      <select
        name="professionalId"
        required
        value={value}
        onChange={(event) => setValue(event.target.value)}
      >
        {resource.value
          ?.filter(
            (p) =>
              p.active &&
              (props.data.user.role === "admin" ||
                p.id === props.data.user.professionalId),
          )
          .map((p) => (
            <option key={p.id} value={p.id}>
              {p.name}
            </option>
          ))}
      </select>
    </Field>
  );
}
export function ReturnRuleForm({
  props,
  customerId,
  itemId,
  professionalId,
}: {
  props: SectionProps;
  customerId: string;
  itemId?: string;
  professionalId?: string;
}) {
  const resource = useResource<ReturnEntry[]>(
      "workspace/care/returns",
      props.revision,
    ),
    [service, setService] = useState(
      itemId ||
        props.data.catalog.find((i) => i.kind === "service" && i.active)?.id ||
        "",
    ),
    [professional, setProfessional] = useState(
      professionalId || props.data.user.professionalId || "principal",
    ),
    [busy, setBusy] = useState(false),
    [error, setError] = useState("");
  const rule = resource.value?.find(
    (r) =>
      r.customerId === customerId &&
      r.itemId === service &&
      r.professionalId === professional,
  );
  return (
    <details className="care-return-form">
      <summary>Configurar retorno previsto</summary>
      <p>
        Conte a partir do último atendimento concluído. Um próximo agendamento
        impede o aviso de atraso.
      </p>
      <form
        className="form-grid"
        key={rule?.id + ":" + rule?.revision}
        onChange={(e) => {
          const target = e.target;
          if (
            target instanceof HTMLSelectElement &&
            target.name === "professionalId"
          )
            setProfessional(target.value);
        }}
        onSubmit={async (e) => {
          e.preventDefault();
          setBusy(true);
          try {
            const f = new FormData(e.currentTarget);
            await props.mutate(
              "workspace/care/returns",
              "PUT",
              {
                customerId,
                itemId: service,
                professionalId: String(f.get("professionalId")),
                intervalDays: Number(f.get("intervalDays")),
                revision: rule?.revision || 0,
              },
              "Retorno previsto atualizado.",
            );
            await resource.refresh();
            setError("");
          } catch (e) {
            setError((e as Error).message);
          } finally {
            setBusy(false);
          }
        }}
      >
        <Field label="Serviço">
          <select
            value={service}
            onChange={(e) => setService(e.target.value)}
            required
          >
            {props.data.catalog
              .filter((i) => i.kind === "service" && i.active)
              .map((i) => (
                <option key={i.id} value={i.id}>
                  {i.name}
                </option>
              ))}
          </select>
        </Field>
        <ProfessionalField props={props} defaultValue={professional} />
        <Field label="Retornar a cada quantos dias?">
          <input
            name="intervalDays"
            type="number"
            min={1}
            max={730}
            required
            defaultValue={rule?.intervalDays || 30}
          />
        </Field>
        {rule && (
          <p>
            {states[rule.state]}
            {rule.due ? ` · ${day(rule.due)}` : ""}
          </p>
        )}
        {error && (
          <p className="error-message" role="alert">
            {error}
          </p>
        )}
        <button
          className="button primary"
          disabled={busy || !service || resource.loading}
        >
          Salvar retorno
        </button>
      </form>
    </details>
  );
}
export function FollowUpSummary(props: SectionProps) {
  const returns = useResource<ReturnEntry[]>(
      "workspace/care/returns",
      props.revision,
    ),
    wait = useResource<WaitEntry[]>("workspace/care/waitlist", props.revision);
  if (!returns.value || !wait.value) return null;
  const overdue = returns.value.filter((r) => r.state === "overdue").length,
    due = returns.value.filter((r) => r.state === "due").length,
    pending = wait.value.filter((r) =>
      ["waiting", "contacted"].includes(r.status),
    ).length;
  if (!overdue && !due && !pending) return null;
  return (
    <section className="panel care-action-summary">
      <h2>Próximos cuidados</h2>
      <div className="care-stat-grid">
        {[
          [overdue, "retorno(s) em atraso"],
          [due, "retorno(s) nos próximos 7 dias"],
          [pending, "pessoa(s) na lista de espera"],
        ].map(([count, label]) => (
          <button
            className="button secondary"
            key={label}
            onClick={() =>
              props.navigate(
                label === "pessoa(s) na lista de espera" ? "care-wait" : "care",
              )
            }
          >
            <strong>{count}</strong> {label}
          </button>
        ))}
      </div>
    </section>
  );
}
export function ClientCarePage(props: SectionProps & { initialTab?: string }) {
  const [tab, setTab] = useState(props.initialTab || "returns");
  return (
    <>
      <PageHeading
        title="Acompanhamento"
        description="Retornos, lembretes e oportunidades para cuidar de cada cliente."
      />
      <div className="tabs care-page-tabs">
        {[
          ["returns", "Retornos"],
          ["wait", "Lista de espera"],
          ["blocks", "Bloqueios"],
          ["reminders", "Lembretes"],
        ].map(([id, label]) => (
          <button
            key={id}
            className={tab === id ? "active" : ""}
            onClick={() => setTab(id)}
          >
            {label}
          </button>
        ))}
      </div>
      <div className="care-page-body">
        {tab === "returns" && <ReturnsPanel {...props} />}{" "}
        {tab === "wait" && <WaitPanel {...props} />}{" "}
        {tab === "blocks" && <BlocksPanel {...props} />}{" "}
        {tab === "reminders" && <ReminderModelsEditor {...props} />}
      </div>
    </>
  );
}
function ReturnsPanel(props: SectionProps) {
  const resource = useResource<ReturnEntry[]>(
      "workspace/care/returns",
      props.revision,
    ),
    [filter, setFilter] = useState("action");
  return (
    <section className="panel settings-panel">
      <h2>Quem está no momento de retornar?</h2>
      <p>
        Configure o intervalo na ficha ou no atendimento. Os avisos usam a data
        do último serviço concluído; quem já agendou aparece separado.
      </p>
      <Field label="Mostrar retornos">
        <select value={filter} onChange={(e) => setFilter(e.target.value)}>
          <option value="action">Próximos e em atraso</option>
          <option value="all">Todos os acompanhamentos</option>
        </select>
      </Field>
      <ResourceState {...resource} />
      {resource.value
        ?.filter(
          (r) => filter === "all" || ["due", "overdue"].includes(r.state),
        )
        .map((r) => (
          <article className="care-list-row" key={r.id}>
            <div>
              <strong>{r.customerName}</strong>
              <p>
                {r.itemName} · {states[r.state]}
                {r.due ? ` · previsto para ${day(r.due)}` : ""}
              </p>
              {r.nextAppointment && (
                <small>
                  Agendado para {day(r.nextAppointment)} às{" "}
                  {time(r.nextAppointment)}
                </small>
              )}
            </div>
            <div className="row-actions">
              <button
                className="button secondary"
                onClick={async () => {
                  const { CustomerDossierPanel } = await import(
                    "./customer-dossier"
                  );
                  props.openDialog({
                    title: `Ficha de ${r.customerName}`,
                    content: (
                      <CustomerDossierPanel
                        customerId={r.customerId}
                        props={props}
                      />
                    ),
                  });
                }}
              >
                Abrir ficha
              </button>
              <WhatsAppLink
                phone={r.phone}
                message={`Olá, ${r.customerName}! Está chegando o momento do seu retorno de ${r.itemName}. Vamos combinar um horário?`}
              />
              <button
                className="button secondary"
                onClick={async () => {
                  try {
                    await props.mutate(
                      "workspace/care/returns",
                      "PUT",
                      {
                        customerId: r.customerId,
                        itemId: r.itemId,
                        professionalId: r.professionalId,
                        intervalDays: r.intervalDays,
                        revision: r.revision,
                        enabled: r.enabled === false,
                      },
                      r.enabled === false
                        ? "Acompanhamento retomado."
                        : "Acompanhamento pausado.",
                    );
                    await resource.refresh();
                  } catch (error) {
                    props.notify((error as Error).message, true);
                  }
                }}
              >
                {r.enabled === false
                  ? "Retomar acompanhamento"
                  : "Pausar acompanhamento"}
              </button>
            </div>
          </article>
        ))}
      {resource.value &&
        !resource.value.filter(
          (r) => filter === "all" || ["due", "overdue"].includes(r.state),
        ).length && <p>Nenhum retorno nesta seleção.</p>}
    </section>
  );
}
export function BlocksPanel(props: SectionProps) {
  const resource = useResource<AgendaBlock[]>(
    "workspace/care/blocks",
    props.revision,
  );
  function create() {
    const key = crypto.randomUUID();
    props.openDialog({
      title: "Bloquear horário",
      description: "O intervalo ficará indisponível para novos agendamentos.",
      content: (
        <div className="form-grid">
          <Field label="Motivo">
            <input name="title" maxLength={100} required />
          </Field>
          <ProfessionalField props={props} />
          <Field label="Início">
            <input name="startsAt" type="datetime-local" required />
          </Field>
          <Field label="Fim">
            <input name="endsAt" type="datetime-local" required />
          </Field>
          <small>
            Horários de Brasília. Até 7 dias por bloqueio. Reservas existentes
            são preservadas.
          </small>
        </div>
      ),
      submitLabel: "Criar bloqueio",
      onSubmit: async (f) => {
        await props.mutate(
          "workspace/care/blocks",
          "POST",
          {
            idempotencyKey: key,
            title: String(f.get("title")),
            professionalId: String(f.get("professionalId")),
            startsAt: inputToIso(String(f.get("startsAt"))),
            endsAt: inputToIso(String(f.get("endsAt"))),
          },
          "Horário bloqueado.",
        );
        await resource.refresh();
      },
    });
  }
  return (
    <section className="panel settings-panel">
      <div className="panel-heading">
        <h2>Bloqueios da agenda</h2>
        <button className="button primary" onClick={create}>
          Bloquear horário
        </button>
      </div>
      <ResourceState {...resource} />
      {resource.value?.map((b) => (
        <div className="care-list-row" key={b.id}>
          <div>
            <strong>{b.title}</strong>
            <p>
              {day(b.startsAt)} {time(b.startsAt)} até {day(b.endsAt)}{" "}
              {time(b.endsAt)}
            </p>
          </div>
          <button
            className="button secondary"
            onClick={() =>
              props.openDialog({
                title: "Liberar horário?",
                description: "O intervalo voltará a aceitar agendamentos.",
                content: <p>{b.title}</p>,
                submitLabel: "Liberar horário",
                onSubmit: async () => {
                  await props.mutate(
                    `workspace/care/blocks/${b.id}`,
                    "PUT",
                    { revision: b.revision },
                    "Bloqueio removido.",
                  );
                  await resource.refresh();
                },
              })
            }
          >
            Liberar
          </button>
        </div>
      ))}
      {resource.value && !resource.value.length && (
        <p>Sem bloqueios cadastrados.</p>
      )}
    </section>
  );
}
function WaitPanel(props: SectionProps) {
  const [bookingKeys] = useState(() => new Map<string, string>());
  function bookingKey(id: string, startsAt: string, revision: number) {
    const slot = `${id}:${startsAt}:${revision}`;
    if (!bookingKeys.has(slot)) bookingKeys.set(slot, crypto.randomUUID());
    return bookingKeys.get(slot)!;
  }
  const resource = useResource<WaitEntry[]>(
      "workspace/care/waitlist",
      props.revision,
    ),
    contacts = useResource<AgendaContact[]>(
      "workspace/customers",
      props.revision,
    ),
    [error, setError] = useState(""),
    [busy, setBusy] = useState(false),
    [slots, setSlots] = useState<
      Record<string, { startsAt: string; endsAt: string }[]>
    >({});
  function create() {
    const key = crypto.randomUUID();
    props.openDialog({
      title: "Adicionar à lista de espera",
      content: (
        <div className="form-grid">
          <Field label="Cliente">
            <select name="customerId" required>
              <option value="">Escolha</option>
              {contacts.value?.map((c) => (
                <option value={c.id} key={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </Field>
          <Field label="Serviço">
            <select name="itemId" required>
              {props.data.catalog
                .filter((i) => i.kind === "service" && i.active)
                .map((i) => (
                  <option value={i.id} key={i.id}>
                    {i.name}
                  </option>
                ))}
            </select>
          </Field>
          <ProfessionalField props={props} />
          <Field label="A partir de">
            <input name="from" type="date" required />
          </Field>
          <Field label="Até">
            <input name="to" type="date" required />
          </Field>
          <div className="form-row">
            <Field label="Após">
              <input name="after" type="time" defaultValue="08:00" required />
            </Field>
            <Field label="Antes de">
              <input name="before" type="time" defaultValue="20:00" required />
            </Field>
          </div>
          <small>Horários de Brasília. O intervalo pode ter até 90 dias.</small>
        </div>
      ),
      submitLabel: "Entrar na lista",
      onSubmit: async (f) => {
        await props.mutate(
          "workspace/care/waitlist",
          "POST",
          { idempotencyKey: key, ...Object.fromEntries(f.entries()) },
          "Cliente adicionado à espera.",
        );
        await resource.refresh();
      },
    });
  }
  return (
    <section className="panel settings-panel">
      <div className="panel-heading">
        <h2>Lista de espera</h2>
        <button
          className="button primary"
          disabled={!contacts.value}
          onClick={create}
        >
          Adicionar cliente
        </button>
      </div>
      <p>
        As sugestões consultam os próximos 7 dias dentro da preferência do
        cliente. O horário só fica reservado após confirmar um agendamento.
      </p>
      <ResourceState {...resource} />
      {error && (
        <p className="error-message" role="alert">
          {error}
        </p>
      )}
      {resource.value
        ?.filter((e) => ["waiting", "contacted"].includes(e.status))
        .map((e) => (
          <article className="care-wait-entry" key={e.id}>
            <h3>{e.customerName}</h3>
            <p>
              {e.itemName} · {day(e.from)} a {day(e.to)} · {e.after}–{e.before}{" "}
              · {states[e.status]}
            </p>
            <div className="row-actions">
              <button
                className="button secondary"
                disabled={busy}
                onClick={async () => {
                  setBusy(true);
                  try {
                    setSlots((s) => ({ ...s, [e.id]: [] }));
                    const result = await api<
                      { startsAt: string; endsAt: string }[]
                    >(`workspace/care/waitlist/${e.id}/slots`);
                    setSlots((s) => ({ ...s, [e.id]: result }));
                    setError("");
                  } catch (err) {
                    setError((err as Error).message);
                  } finally {
                    setBusy(false);
                  }
                }}
              >
                Consultar vagas
              </button>
              <WhatsAppLink phone={e.phone} />
              {e.status === "waiting" && (
                <button
                  className="button secondary"
                  disabled={busy}
                  onClick={() =>
                    props.openDialog({
                      title: "Encerrar espera?",
                      description:
                        "A entrada sairá da lista de vagas pendentes, sem enviar mensagem.",
                      content: (
                        <p>
                          {e.customerName} · {e.itemName}
                        </p>
                      ),
                      submitLabel: "Encerrar espera",
                      onSubmit: async () => {
                        await props.mutate(
                          `workspace/care/waitlist/${e.id}`,
                          "PUT",
                          { revision: e.revision, status: "cancelled" },
                          "Espera encerrada.",
                        );
                        await resource.refresh();
                      },
                    })
                  }
                >
                  Encerrar espera
                </button>
              )}
              <button
                className="button secondary"
                disabled={busy}
                onClick={async () => {
                  setBusy(true);
                  try {
                    await props.mutate(
                      `workspace/care/waitlist/${e.id}`,
                      "PUT",
                      {
                        revision: e.revision,
                        status:
                          e.status === "waiting" ? "contacted" : "cancelled",
                      },
                      e.status === "waiting"
                        ? "Contato iniciado registrado. A mensagem não foi enviada automaticamente."
                        : "Espera encerrada.",
                    );
                    await resource.refresh();
                  } catch (err) {
                    setError((err as Error).message);
                  } finally {
                    setBusy(false);
                  }
                }}
              >
                {e.status === "waiting"
                  ? "Marcar contato iniciado"
                  : "Encerrar espera"}
              </button>
            </div>
            {slots[e.id] && (
              <div className="care-slot-list">
                {slots[e.id].map((s) => (
                  <div key={s.startsAt}>
                    <span>
                      {day(s.startsAt)} às {time(s.startsAt)}
                    </span>
                    <WhatsAppLink
                      phone={e.phone}
                      label="Oferecer horário"
                      message={`Olá, ${e.customerName}! Temos uma vaga para ${e.itemName} em ${day(s.startsAt)} às ${time(s.startsAt)}. Você tem interesse?`}
                    />
                    {props.data.user.role === "admin" && (
                      <button
                        className="button primary"
                        disabled={busy}
                        onClick={() =>
                          props.openDialog({
                            title: "Confirmar horário da espera",
                            description:
                              "Confirme com o cliente antes. O pagamento fica pendente e separado.",
                            content: (
                              <p>
                                {e.customerName} · {e.itemName} ·{" "}
                                {day(s.startsAt)} às {time(s.startsAt)}
                              </p>
                            ),
                            submitLabel: "Agendar",
                            onSubmit: async () => {
                              await props.mutate(
                                `workspace/care/waitlist/${e.id}/book`,
                                "POST",
                                {
                                  idempotencyKey: bookingKey(
                                    e.id,
                                    s.startsAt,
                                    e.revision,
                                  ),
                                  revision: e.revision,
                                  startsAt: s.startsAt,
                                },
                                "Cliente agendado.",
                              );
                              setSlots({});
                              await resource.refresh();
                            },
                          })
                        }
                      >
                        Agendar
                      </button>
                    )}
                  </div>
                ))}
                {!slots[e.id].length && !busy && (
                  <p>
                    Nenhuma vaga nessa consulta. Tente novamente depois ou
                    reveja o período.
                  </p>
                )}
              </div>
            )}
          </article>
        ))}
      {resource.value &&
        !resource.value.filter((e) =>
          ["waiting", "contacted"].includes(e.status),
        ).length && <p>Ninguém aguardando no momento.</p>}
    </section>
  );
}
