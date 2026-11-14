"use client";
import { useEffect, useRef, useState } from "react";
import { Menu, X } from "lucide-react";
import { Greeting } from "@/modules/shared/presentation/greeting";
import { api } from "@/modules/shared/infrastructure/api";
import { money } from "@/modules/shared/domain/format";
import { Brand } from "@/modules/shared/presentation/brand";
import {
  Field,
  PageHeading,
  ResourceState,
  useResource,
  type SectionProps,
} from "@/modules/shared/presentation/ui";
import { CalendarPage } from "@/modules/appointments/presentation/calendar-page";
import { WalletPage } from "@/modules/wallet/presentation/wallet";
import { WorkspaceSwitcher } from "./workspace-switcher";
import { WorkspaceClients } from "./workspace-clients";
import { AgendaAnalytics } from "./agenda-analytics";
import { AgendaPreferencesEditor } from "./agenda-preferences";
import { WorkspaceAppearance } from "./agenda-preferences";
interface SoloStatus {
  billingEnabled: boolean;
  setupPending: boolean;
  plans: {
    id: string;
    name: string;
    priceCents: number;
    periodMonths: number;
  }[];
  entitlement: { mode: string; expiresAt: number | null };
  subscription: { planId: string; status: string; paidThrough?: number } | null;
}
export function SoloBilling(props: SectionProps) {
  const [revision, setRevision] = useState(0),
    [busy, setBusy] = useState(false);
  const resource = useResource<SoloStatus>(
      "payments/status",
      props.revision + revision,
    ),
    data = resource.value;
  async function refresh() {
    setBusy(true);
    try {
      await api("payments/subscription/refresh", "POST", {});
      setRevision((n) => n + 1);
    } catch (e) {
      props.notify((e as Error).message, true);
    } finally {
      setBusy(false);
    }
  }
  return (
    <section className="panel settings-panel solo-billing">
      <h1>Compasso Solo</h1>
      <p>
        Sua agenda profissional privada, com clientes internos, fichas, cores,
        análises e controle financeiro manual. Um único acesso, sem página
        pública nem equipe. Cada profissional tem sua própria conta e
        assinatura.
      </p>
      <ResourceState {...resource} />
      {data && (
        <>
          <div className="plan-access">
            <strong>
              {data.entitlement.mode === "trial"
                ? "14 dias para experimentar"
                : data.entitlement.mode === "active"
                  ? "Seu Solo está ativo"
                  : "Escolha como continuar com sua agenda"}
            </strong>
            {data.entitlement.expiresAt && (
              <p>
                Período disponível até{" "}
                {new Date(data.entitlement.expiresAt).toLocaleDateString(
                  "pt-BR",
                )}
                .
              </p>
            )}
            <p>
              Sem contratação, o teste termina sem cobrança. Seus dados são
              mantidos.
            </p>
          </div>
          <div className="solo-price-grid">
            {data.plans.map((plan) => {
              const current =
                data.subscription?.planId === plan.id &&
                !["cancelled", "canceled"].includes(data.subscription.status);
              const existing =
                data.subscription &&
                !["cancelled", "canceled"].includes(data.subscription.status);
              return (
                <article className="store-plan" key={plan.id}>
                  <h2>{plan.name}</h2>
                  <strong className="plan-price">
                    {money(plan.priceCents)} /{" "}
                    {plan.periodMonths === 12 ? "ano" : "mês"}
                  </strong>
                  <p className="solo-plan-description">
                    {plan.periodMonths === 12
                      ? "Sua agenda individual por um ano, com todos os recursos do Solo. Uma cobrança de R$110,00 por ano — cerca de R$9,17 por mês."
                      : "Sua agenda individual com todos os recursos do Solo, por R$15,00 ao mês. Organize seus atendimentos com a flexibilidade do pagamento mensal."}
                  </p>
                  <button
                    className="button primary"
                    disabled={
                      busy ||
                      !data.billingEnabled ||
                      data.setupPending ||
                      !!(
                        existing &&
                        (!current || data.subscription?.status !== "pending")
                      )
                    }
                    onClick={() =>
                      props.openDialog({
                        title: `Contratar ${plan.name}`,
                        submitLabel: "Continuar no Mercado Pago",
                        content: (
                          <>
                            <p>
                              {money(plan.priceCents)} cobrados a cada{" "}
                              {plan.periodMonths === 12 ? "12 meses" : "mês"},
                              com renovação automática após sua autorização.
                            </p>
                            <p>
                              {data.entitlement.mode === "trial" &&
                              data.entitlement.expiresAt
                                ? `A primeira cobrança será programada para o término do teste, em ${new Date(data.entitlement.expiresAt).toLocaleDateString("pt-BR")}.`
                                : "A contratação inicia um período pago."}
                            </p>
                            <p>
                              Você pode cancelar a renovação no Mercado Pago. O
                              período pago permanece válido.
                            </p>
                          </>
                        ),
                        onSubmit: async () => {
                          const result = await api<{ url: string }>(
                            "payments/subscribe",
                            "POST",
                            { planId: plan.id },
                          );
                          location.assign(result.url);
                        },
                      })
                    }
                  >
                    {current
                      ? data.subscription?.status === "pending"
                        ? "Concluir contratação"
                        : "Assinatura atual"
                      : "Escolher este Solo"}
                  </button>
                </article>
              );
            })}
          </div>
          {!data.billingEnabled && (
            <p>
              A contratação ainda não foi habilitada. Nenhuma mensalidade será
              cobrada agora.
            </p>
          )}
          {data.setupPending && (
            <p>
              Uma contratação aguarda conferência. Atualize a situação antes de
              tentar novamente.
            </p>
          )}
          {(data.subscription || data.setupPending) && (
            <div className="plan-manage">
              <button
                className="button secondary"
                disabled={busy}
                onClick={refresh}
              >
                Atualizar situação
              </button>
              <a
                href="https://www.mercadopago.com.br/subscriptions"
                target="_blank"
                rel="noreferrer"
              >
                Gerenciar ou cancelar no Mercado Pago
              </a>
              <small>
                Para trocar entre mensal e anual, cancele e aguarde o fim do
                período pago.
              </small>
            </div>
          )}
        </>
      )}
    </section>
  );
}
function SoloServices(props: SectionProps) {
  function edit(item?: SectionProps["data"]["catalog"][number]) {
    props.openDialog({
      title: item ? "Editar serviço" : "Novo serviço",
      content: (
        <div className="form-grid">
          <Field label="Nome do serviço">
            <input
              name="name"
              required
              minLength={2}
              maxLength={100}
              defaultValue={item?.name}
            />
          </Field>
          <Field label="Categoria">
            <input
              name="category"
              required
              maxLength={80}
              defaultValue={item?.category || "Atendimento"}
            />
          </Field>
          <Field label="Valor em reais">
            <input
              name="price"
              type="number"
              min="0"
              max="1000000"
              step="0.01"
              required
              defaultValue={(item?.priceCents ?? 0) / 100}
            />
          </Field>
          <Field label="Duração em minutos">
            <input
              name="duration"
              type="number"
              required
              min={1}
              max={720}
              defaultValue={item?.durationMinutes || 60}
            />
          </Field>
          <Field label="Observações do serviço">
            <textarea
              name="description"
              maxLength={1000}
              defaultValue={item?.description || ""}
            />
          </Field>
          <label className="checkbox-field">
            <input
              name="active"
              type="checkbox"
              defaultChecked={item?.active ?? true}
            />
            Disponível para novos atendimentos
          </label>
        </div>
      ),
      submitLabel: "Salvar serviço",
      onSubmit: async (form) => {
        await props.mutate(
          item ? `catalog/${item.id}` : "catalog",
          item ? "PATCH" : "POST",
          {
            name: String(form.get("name")),
            category: String(form.get("category")),
            description: String(form.get("description") || ""),
            kind: "service",
            priceCents: Math.round(Number(form.get("price")) * 100),
            durationMinutes: Number(form.get("duration")),
            requiresTriage: false,
            active: form.has("active"),
          },
          "Serviço salvo.",
        );
      },
    });
  }
  return (
    <section className="panel settings-panel">
      <div className="panel-heading">
        <h2>Seus serviços</h2>
        <button className="button primary" onClick={() => edit()}>
          Cadastrar serviço
        </button>
      </div>
      <p>
        Defina valores e duração para organizar seus atendimentos. Nenhum
        serviço é publicado para clientes.
      </p>
      {props.data.catalog.map((item) => (
        <div className="order-line" key={item.id}>
          <div>
            <strong>{item.name}</strong>
            <small>
              {item.durationMinutes} min · {money(item.priceCents)} ·{" "}
              {item.active ? "Ativo" : "Inativo"}
            </small>
          </div>
          <button className="button secondary" onClick={() => edit(item)}>
            Editar
          </button>
        </div>
      ))}
      {!props.data.catalog.length && (
        <p>Cadastre seu primeiro serviço para começar a agendar.</p>
      )}
    </section>
  );
}
function SoloAgendaName(props: SectionProps) {
  return (
    <section className="panel settings-panel">
      <h2>Minha agenda</h2>
      <form
        className="form-grid"
        onSubmit={async (event) => {
          event.preventDefault();
          const form = new FormData(event.currentTarget);
          try {
            await props.mutate(
              "settings",
              "PATCH",
              {
                ...props.data.settings,
                businessName: String(form.get("agendaName")),
              },
              "Nome da agenda salvo.",
            );
          } catch (error) {
            props.notify((error as Error).message, true);
          }
        }}
      >
        <Field label="Nome da agenda">
          <input
            name="agendaName"
            minLength={2}
            maxLength={100}
            required
            defaultValue={props.data.settings.businessName}
          />
        </Field>
        <p>
          Aberta todos os dias, 24 horas. Você define o início e a duração de
          cada compromisso.
        </p>
        <button className="button primary">Salvar nome</button>
      </form>
    </section>
  );
}

function SoloRegistrations(props: SectionProps) {
  const [section, setSection] = useState("services");
  return (
    <>
      <PageHeading
        title="Cadastros"
        description="Organize seus serviços, categorias e a aparência da sua agenda."
      />
      <div
        className="tabs solo-registration-tabs"
        role="group"
        aria-label="Tipos de cadastro"
      >
        {[
          ["services", "Serviços"],
          ["preferences", "Categorias e tema"],
        ].map(([id, label]) => (
          <button
            key={id}
            type="button"
            aria-pressed={section === id}
            className={section === id ? "active" : ""}
            onClick={() => setSection(id)}
          >
            {label}
          </button>
        ))}
      </div>
      {section === "services" && <SoloServices {...props} />}
      {section === "preferences" && (
        <>
          <SoloAgendaName {...props} />
          <AgendaPreferencesEditor {...props} />
        </>
      )}
    </>
  );
}

const soloNavigation = [
  ["calendar", "Minha agenda"],
  ["clients", "Clientes"],
  ["analytics", "Análises"],
  ["registrations", "Cadastros"],
  ["wallet", "Finanças"],
  ["billing", "Meu Solo"],
];

function SoloMenu({
  page,
  navigate,
  logout,
  workspaceProps,
  beforeSwitch,
}: {
  page: string;
  navigate: (page: string) => void;
  logout: () => Promise<void>;
  workspaceProps: SectionProps;
  beforeSwitch?: () => void;
}) {
  return (
    <>
      <Brand />
      <h2>Compasso Solo</h2>
      <nav className="solo-menu-nav" aria-label="Navegação do Solo">
        {soloNavigation.map(([key, label]) => (
          <button
            type="button"
            key={key}
            className={page === key ? "active" : ""}
            aria-current={page === key ? "page" : undefined}
            onClick={() => navigate(key)}
          >
            {label}
          </button>
        ))}
      </nav>
      <div className="solo-menu-footer">
        <small>Agenda privada · acesso individual</small>
        <WorkspaceSwitcher props={workspaceProps} beforeOpen={beforeSwitch} />
        <button className="button secondary" onClick={logout}>
          Sair
        </button>
      </div>
    </>
  );
}

export function SoloWorkspace(
  props: SectionProps & { logout: () => Promise<void> },
) {
  const [page, setPage] = useState("calendar");
  const [menuOpen, setMenuOpen] = useState(false);
  const billing = useResource<SoloStatus>("payments/status", props.revision);
  const subscribedPlan = billing.value?.plans.find(
    (plan) => plan.id === billing.value?.subscription?.planId,
  );
  const drawer = useRef<HTMLDialogElement>(null);
  useEffect(() => {
    const element = drawer.current;
    if (!element) return;
    if (!menuOpen) {
      if (element.open) element.close();
      return;
    }
    element.showModal();
    const oldOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const desktop = window.matchMedia("(min-width: 801px)");
    const closeOnDesktop = () => {
      if (desktop.matches) setMenuOpen(false);
    };
    desktop.addEventListener("change", closeOnDesktop);
    return () => {
      document.body.style.overflow = oldOverflow;
      desktop.removeEventListener("change", closeOnDesktop);
      if (element.open) element.close();
    };
  }, [menuOpen]);
  function navigate(page: string) {
    setPage(page);
    setMenuOpen(false);
  }
  const local = {
    ...props,
    navigate: (next: string) =>
      navigate(
        ["catalog", "services", "settings"].includes(next)
          ? "registrations"
          : next === "tools"
            ? "clients"
            : ["appointments", "orders", "home"].includes(next)
              ? "calendar"
              : next,
      ),
  };
  return (
    <div className="solo-shell">
      <WorkspaceAppearance revision={props.revision} />
      <aside className="solo-sidebar">
        <SoloMenu
          page={page}
          navigate={navigate}
          logout={props.logout}
          workspaceProps={props}
        />
      </aside>
      <header className="solo-mobile-topbar">
        <button
          type="button"
          className="icon-button"
          aria-label="Abrir menu"
          aria-controls="solo-menu-drawer"
          aria-expanded={menuOpen}
          aria-haspopup="dialog"
          onClick={() => setMenuOpen(true)}
        >
          <Menu size={24} />
        </button>
        <Brand />
      </header>
      <dialog
        ref={drawer}
        id="solo-menu-drawer"
        className="solo-drawer"
        aria-labelledby="solo-menu-title"
        onKeyDown={(event) => {
          if (event.key !== "Tab") return;
          const controls =
            event.currentTarget.querySelectorAll<HTMLButtonElement>(
              "button:not(:disabled)",
            );
          const first = controls[0],
            last = controls[controls.length - 1];
          if (event.shiftKey && document.activeElement === first) {
            event.preventDefault();
            last?.focus();
          } else if (!event.shiftKey && document.activeElement === last) {
            event.preventDefault();
            first?.focus();
          }
        }}
        onCancel={() => setMenuOpen(false)}
        onClose={() => setMenuOpen(false)}
        onClick={(event) => {
          if (event.target === event.currentTarget) {
            const rect = event.currentTarget.getBoundingClientRect();
            if (
              event.clientX < rect.left ||
              event.clientX > rect.right ||
              event.clientY < rect.top ||
              event.clientY > rect.bottom
            )
              setMenuOpen(false);
          }
        }}
      >
        <div className="solo-drawer-panel">
          <div className="solo-drawer-heading">
            <h2 id="solo-menu-title">Menu</h2>
            <button
              type="button"
              className="icon-button"
              aria-label="Fechar menu"
              onClick={() => setMenuOpen(false)}
            >
              <X size={22} />
            </button>
          </div>
          <SoloMenu
            page={page}
            navigate={navigate}
            logout={props.logout}
            workspaceProps={props}
            beforeSwitch={() => setMenuOpen(false)}
          />
        </div>
      </dialog>
      <main className="solo-main">
        <div className="solo-private-note">
          <div className="solo-greeting">
            <Greeting
              name={props.data.user.name}
              timeZone="America/Sao_Paulo"
            />
            <small>Sua agenda privada, no seu compasso.</small>
          </div>
          <button className="text-button" onClick={() => navigate("billing")}>
            Plano {subscribedPlan?.name || "Solo"}
          </button>
        </div>
        {page === "calendar" && <CalendarPage {...local} />}{" "}
        {page === "registrations" && <SoloRegistrations {...local} />}{" "}
        {page === "clients" && <WorkspaceClients {...local} />}
        {page === "analytics" && (
          <>
            <PageHeading
              title="Análises"
              description="Acompanhe seus clientes, atendimentos e serviços por período."
            />
            <AgendaAnalytics revision={props.revision} />
          </>
        )}{" "}
        {page === "wallet" && <WalletPage {...local} />}{" "}
        {page === "billing" && <SoloBilling {...local} />}
      </main>
    </div>
  );
}
