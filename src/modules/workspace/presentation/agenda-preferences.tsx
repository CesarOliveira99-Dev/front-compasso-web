"use client";
import { useEffect, useState } from "react";
import {
  Field,
  ResourceState,
  useResource,
  type SectionProps,
} from "@/modules/shared/presentation/ui";
import type { AgendaPreferences } from "./tools-types";
export function AgendaPreferencesEditor(props: SectionProps) {
  const resource = useResource<AgendaPreferences>(
    "workspace/preferences",
    props.revision,
  );
  const [draft, setDraft] = useState<AgendaPreferences>();
  const [busy, setBusy] = useState(false);
  useEffect(() => {
    if (resource.value) setDraft(resource.value);
  }, [resource.value]);
  return (
    <section className="panel settings-panel">
      <h2>Sua agenda, suas cores</h2>
      <p>
        As categorias ajudam a reconhecer os atendimentos. O status do serviço e
        do pagamento continua separado.
      </p>
      <ResourceState {...resource} />
      {draft && (
        <form
          className="form-grid"
          onSubmit={async (e) => {
            e.preventDefault();
            setBusy(true);
            try {
              await props.mutate(
                "workspace/preferences",
                "PUT",
                draft,
                "Preferências salvas.",
              );
            } catch (error) {
              props.notify((error as Error).message, true);
            } finally {
              setBusy(false);
            }
          }}
        >
          <div className="form-row">
            <Field label="Tema">
              <select
                aria-label="Tema"
                value={draft.theme}
                onChange={(e) =>
                  setDraft({
                    ...draft,
                    theme: e.target.value as AgendaPreferences["theme"],
                  })
                }
              >
                <option value="light">Claro</option>
                <option value="dark">Escuro</option>
                <option value="paper">Papel</option>
              </select>
            </Field>
            <Field label="Cor de destaque">
              <input
                type="color"
                aria-label="Cor de destaque"
                value={draft.accent}
                onChange={(e) => setDraft({ ...draft, accent: e.target.value })}
              />
            </Field>
          </div>
          <h3>Categorias</h3>
          {draft.categories.map((category, index) => (
            <div className="agenda-category-editor" key={category.id}>
              <input
                aria-label={`Nome da categoria ${index + 1}`}
                required
                minLength={2}
                maxLength={50}
                value={category.name}
                onChange={(e) =>
                  setDraft({
                    ...draft,
                    categories: draft.categories.map((c) =>
                      c.id === category.id ? { ...c, name: e.target.value } : c,
                    ),
                  })
                }
              />
              <input
                type="color"
                aria-label={`Cor de ${category.name}`}
                value={category.color}
                onChange={(e) =>
                  setDraft({
                    ...draft,
                    categories: draft.categories.map((c) =>
                      c.id === category.id
                        ? { ...c, color: e.target.value }
                        : c,
                    ),
                  })
                }
              />
              <button
                type="button"
                className="text-button"
                onClick={() =>
                  setDraft({
                    ...draft,
                    categories: draft.categories.filter(
                      (c) => c.id !== category.id,
                    ),
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
            disabled={draft.categories.length >= 30}
            onClick={() =>
              setDraft({
                ...draft,
                categories: [
                  ...draft.categories,
                  {
                    id: crypto.randomUUID(),
                    name: "Nova categoria",
                    color: "#397c96",
                  },
                ],
              })
            }
          >
            Adicionar categoria
          </button>
          {props.data.user.role === "admin" &&
            props.data.settings.workspaceMode !== "solo" && (
              <label className="checkbox-field">
                <input
                  type="checkbox"
                  checked={draft.storeDefault}
                  onChange={(e) =>
                    setDraft({ ...draft, storeDefault: e.target.checked })
                  }
                />
                Usar como padrão da loja para quem ainda não personalizou a
                própria agenda
              </label>
            )}
          <button className="button primary" disabled={busy}>
            Salvar aparência e categorias
          </button>
        </form>
      )}
    </section>
  );
}
export function WorkspaceAppearance({ revision }: { revision: number }) {
  const { value } = useResource<AgendaPreferences>(
    "workspace/preferences",
    revision,
  );
  useEffect(() => {
    if (!value) return;
    const root = document.documentElement,
      previous = root.dataset.agendaTheme;
    const palette =
      value.theme === "dark"
        ? {
            background: "#141b26",
            surface: "#202a38",
            ink: "#f1f5f9",
            text: "#e2e8f0",
            muted: "#a9b7c7",
            line: "#405066",
          }
        : value.theme === "paper"
          ? {
              background: "#f6eedc",
              surface: "#fffaf0",
              ink: "#3b3227",
              text: "#544738",
              muted: "#76664f",
              line: "#ddcfb7",
            }
          : {
              background: "#fffaf6",
              surface: "#ffffff",
              ink: "#182235",
              text: "#455166",
              muted: "#7c8592",
              line: "#e5e7eb",
            };
    const rgb = [1, 3, 5]
      .map((index) => parseInt(value.accent.slice(index, index + 2), 16) / 255)
      .map((c) => (c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4));
    const light = rgb[0] * 0.2126 + rgb[1] * 0.7152 + rgb[2] * 0.0722;
    const vars = {
      ...palette,
      accent: value.accent,
      "accent-ink": light > 0.179 ? "#101820" : "#ffffff",
      "accent-soft": `${value.accent}18`,
    };
    const old = new Map(
      Object.keys(vars).map((key) => [
        key,
        root.style.getPropertyValue(`--${key}`),
      ]),
    );
    for (const [key, color] of Object.entries(vars))
      root.style.setProperty(`--${key}`, color);
    root.dataset.agendaTheme = value.theme;
    return () => {
      for (const [key, color] of old)
        color
          ? root.style.setProperty(`--${key}`, color)
          : root.style.removeProperty(`--${key}`);
      if (previous) root.dataset.agendaTheme = previous;
      else delete root.dataset.agendaTheme;
    };
  }, [value]);
  return null;
}
