'use client';
import { AlertCircle, ArrowUpRight, Check, LoaderCircle, Plus, X } from 'lucide-react';
import { useEffect, useRef, useState, type ReactNode } from 'react';
import { initials, statusLabel } from '../domain/format';
import type { Bootstrap } from '../domain/models';
import { api } from '../infrastructure/api';
export type Mutate = <T = unknown>(
  path: string,
  method: string,
  body: unknown,
  message: string,
) => Promise<T>;
export interface DialogState {
  title: string;
  description?: string;
  content:
    ReactNode | ((controls: { close: () => void; setBusy: (busy: boolean) => void }) => ReactNode);
  submitLabel?: string;
  onSubmit?: (form: FormData) => Promise<void>;
}
export interface SectionProps {
  data: Bootstrap;
  revision: number;
  mutate: Mutate;
  notify: (message: string, error?: boolean) => void;
  openDialog: (dialog: DialogState) => void;
  navigate: (page: string) => void;
}
export function Avatar({
  name,
  size = '',
  color = 0,
}: {
  name: string;
  size?: string;
  color?: number;
}) {
  return <span className={`avatar ${size} color-${color % 5}`}>{initials(name)}</span>;
}
export function Badge({ status, children }: { status?: string; children?: ReactNode }) {
  return (
    <span className={`badge ${status || ''}`}>
      <span className="badge-dot" />
      {children || statusLabel[status || ''] || status}
    </span>
  );
}
export function Empty({
  title = 'Tudo tranquilo por aqui',
  description = 'Os novos registros aparecerão neste espaço.',
  action,
}: {
  title?: string;
  description?: string;
  action?: ReactNode;
}) {
  return (
    <div className="empty-state">
      <span className="empty-icon">
        <Check size={23} />
      </span>
      <h3>{title}</h3>
      <p>{description}</p>
      {action}
    </div>
  );
}
export function PageHeading({
  eyebrow,
  title,
  description,
  action,
}: {
  eyebrow?: string;
  title: string;
  description: string;
  action?: ReactNode;
}) {
  return (
    <div className="page-heading">
      <div>
        {eyebrow && <span className="eyebrow">{eyebrow}</span>}
        <h1>{title}</h1>
        <p>{description}</p>
      </div>
      {action}
    </div>
  );
}
export function Field({
  label,
  children,
  hint,
}: {
  label: string;
  children: ReactNode;
  hint?: string;
}) {
  return (
    <label className="field">
      <span>{label}</span>
      {children}
      {hint && <small>{hint}</small>}
    </label>
  );
}
export function Dialog({ dialog, close }: { dialog: DialogState; close: () => void }) {
  const ref = useRef<HTMLDialogElement>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  useEffect(() => {
    const element = ref.current;
    element?.showModal();
    return () => element?.close();
  }, []);
  return (
    <dialog
      ref={ref}
      className="dialog"
      onCancel={(event) => {
        event.preventDefault();
        if (!busy) close();
      }}
    >
      <div className="dialog-header">
        <div>
          <span className="eyebrow">COMPASSO</span>
          <h2>{dialog.title}</h2>
          {dialog.description && <p>{dialog.description}</p>}
        </div>
        <button className="icon-button" aria-label="Fechar" onClick={close} disabled={busy}>
          <X size={20} />
        </button>
      </div>
      {dialog.onSubmit ? (
        <form
          onSubmit={async (event) => {
            event.preventDefault();
            if (!dialog.onSubmit) return;
            const form = new FormData(event.currentTarget);
            setBusy(true);
            setError('');
            try {
              await dialog.onSubmit(form);
              close();
            } catch (e) {
              setError(e instanceof Error ? e.message : 'Ocorreu um erro.');
            } finally {
              setBusy(false);
            }
          }}
        >
          <div className="dialog-content">
            {typeof dialog.content === 'function'
              ? dialog.content({ close, setBusy })
              : dialog.content}
            {error && (
              <p className="error-message" role="alert">
                <AlertCircle size={17} />
                {error}
              </p>
            )}
          </div>
          <div className="dialog-footer">
            <button type="button" className="button secondary" onClick={close} disabled={busy}>
              Cancelar
            </button>
            <button className="button primary" disabled={busy}>
              {busy ? <LoaderCircle size={17} className="spin" /> : <Check size={17} />}
              {dialog.submitLabel || 'Salvar'}
            </button>
          </div>
        </form>
      ) : (
        <div className="dialog-content">
          {typeof dialog.content === 'function'
            ? dialog.content({ close, setBusy })
            : dialog.content}
        </div>
      )}
    </dialog>
  );
}
export function useResource<T>(path: string, revision: number) {
  const [value, setValue] = useState<T>();
  const [error, setError] = useState('');
  useEffect(() => {
    let active = true;
    setError('');
    api<T>(path)
      .then((v) => {
        if (active) setValue(v);
      })
      .catch((e) => {
        if (active) setError(e.message);
      });
    return () => {
      active = false;
    };
  }, [path, revision]);
  return { value, error, loading: !value && !error };
}
export function ResourceState({ loading, error }: { loading: boolean; error: string }) {
  return loading ? (
    <div className="loading-inline">
      <LoaderCircle className="spin" size={20} />
      Carregando seu espaço…
    </div>
  ) : error ? (
    <p className="error-message" role="alert">
      <AlertCircle size={18} />
      {error}
    </p>
  ) : null;
}
export function PanelHeading({
  title,
  detail,
  action,
}: {
  title: string;
  detail?: string;
  action?: ReactNode;
}) {
  return (
    <div className="panel-heading">
      <div>
        <h2>{title}</h2>
        {detail && <p>{detail}</p>}
      </div>
      {action}
    </div>
  );
}
export function ActionLink({ children, onClick }: { children: ReactNode; onClick: () => void }) {
  return (
    <button className="text-button" onClick={onClick}>
      {children}
      <ArrowUpRight size={15} />
    </button>
  );
}
export const text = (form: FormData, key: string) => String(form.get(key) || '').trim();
export const number = (form: FormData, key: string) => Number(form.get(key) || 0);
export function AddButton({ children, onClick }: { children: ReactNode; onClick: () => void }) {
  return (
    <button type="button" className="button primary" onClick={onClick}>
      <Plus size={17} />
      {children}
    </button>
  );
}
