"use client";
import { useState } from "react";
import { ArrowLeftRight, Plus } from "lucide-react";
import { api } from "@/modules/shared/infrastructure/api";
import {
  BusinessAddressFields,
  addressFromForm,
} from "@/modules/shared/presentation/business-address-fields";
import { IdentityInput } from "@/modules/identity/presentation/identity-input";
import {
  Field,
  ResourceState,
  useResource,
  type SectionProps,
} from "@/modules/shared/presentation/ui";
interface OwnedWorkspace {
  id: string;
  name: string;
  workspaceMode: "store" | "solo";
  current: boolean;
}
function createWorkspace(props: SectionProps, mode: "store" | "solo") {
  const key = crypto.randomUUID();
  props.openDialog({
    title: mode === "solo" ? "Criar minha agenda Solo" : "Criar minha empresa",
    description: `Usando sua conta ${props.data.user.email}.`,
    submitLabel: "Criar espaço",
    content: (
      <div className="form-grid">
        <p>
          Este espaço tem dados, assinatura e teste grátis próprios. Criá-lo não
          contrata um plano nem inicia cobranças.
        </p>
        <Field label={mode === "solo" ? "Nome da agenda" : "Nome do negócio"}>
          <IdentityInput
            kind="businessName"
            name="businessName"
            required
            defaultValue={mode === "solo" ? props.data.user.name : ""}
          />
        </Field>
        {mode === "store" && <BusinessAddressFields />}
        <p className="form-note">
          O mesmo login acessa os dois espaços. O Solo continua privado, sem
          equipe e sem link público.
        </p>
      </div>
    ),
    onSubmit: async (form) => {
      await api("auth/workspaces", "POST", {
        workspaceMode: mode,
        idempotencyKey: key,
        businessName: String(form.get("businessName")),
        ...(mode === "store" ? { address: addressFromForm(form) } : {}),
      });
      window.location.assign("/");
    },
  });
}
function WorkspaceChoices({ props }: { props: SectionProps }) {
  const resource = useResource<OwnedWorkspace[]>(
      "auth/workspaces",
      props.revision,
    ),
    [busy, setBusy] = useState(false),
    [error, setError] = useState("");
  return (
    <div className="form-grid workspace-choices">
      <p>Escolha onde quer trabalhar. Dados e assinaturas são independentes.</p>
      <ResourceState {...resource} />
      {resource.value?.map((workspace) => (
        <button
          className={`workspace-choice ${workspace.current ? "current" : ""}`}
          disabled={busy || workspace.current}
          key={workspace.id}
          aria-current={workspace.current ? "true" : undefined}
          onClick={async () => {
            setBusy(true);
            setError("");
            try {
              await api("auth/workspaces/switch", "POST", {
                workspaceId: workspace.id,
              });
              window.location.assign("/");
            } catch (e) {
              setError((e as Error).message);
              setBusy(false);
            }
          }}
        >
          <span>
            <strong>
              {workspace.workspaceMode === "solo"
                ? "Minha agenda Solo"
                : "Minha empresa"}
            </strong>
            <small>{workspace.name}</small>
          </span>
          <span>{workspace.current ? "Atual" : "Acessar →"}</span>
        </button>
      ))}
      {resource.value &&
        (["store", "solo"] as const)
          .filter(
            (mode) => !resource.value!.some((w) => w.workspaceMode === mode),
          )
          .map((mode) => (
            <button
              className="button secondary"
              key={mode}
              disabled={busy}
              onClick={() => createWorkspace(props, mode)}
            >
              <Plus size={16} />
              {mode === "solo"
                ? "Criar minha agenda Solo"
                : "Criar minha empresa"}
            </button>
          ))}
      {error && (
        <p className="error-message" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}
export function WorkspaceSwitcher({
  props,
  beforeOpen,
}: {
  props: SectionProps;
  beforeOpen?: () => void;
}) {
  return (
    <button
      type="button"
      className="button secondary workspace-switcher"
      onClick={() => {
        beforeOpen?.();
        props.openDialog({
          title: "Trocar espaço",
          content: <WorkspaceChoices props={props} />,
        });
      }}
    >
      <ArrowLeftRight size={16} />
      Trocar espaço
    </button>
  );
}
