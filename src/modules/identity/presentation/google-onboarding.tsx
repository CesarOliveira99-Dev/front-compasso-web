'use client';
import { IdentityInput } from './identity-input';
import { useState, type FormEvent } from 'react';
import { api } from '@/modules/shared/infrastructure/api';
import { Field } from '@/modules/shared/presentation/ui';
import {
  BusinessAddressFields,
  addressFromForm,
} from '@/modules/shared/presentation/business-address-fields';
import { PasswordField } from './password-field';

export interface GoogleOnboardingData {
  existingAccount?: boolean;
  personalAccountExists?: boolean;
  status: 'onboarding_required';
  profile: { name: string; email: string };
  stores: { workspaceMode?: "solo"|"store"; slug: string; businessName: string; linked: boolean; existingAccount: boolean }[];
}
export type GoogleSignInResult =
  GoogleOnboardingData | { status: 'authenticated' } | { linked: boolean };

export function GoogleOnboarding({
  data,
  initialMode,
  onLogin,
  onBack,
}: {
  data: GoogleOnboardingData;
  initialMode?:"solo"|"store"|"customer";
  onLogin: () => Promise<void>;
  onBack: () => void;
}) {
  const memberships = data.stores.filter((store) => store.linked);
  const existingStores = data.personalAccountExists
    ? []
    : data.stores.filter((store) => store.existingAccount);
  const choices = memberships.length ? memberships : existingStores;
  const [role, setRole] = useState(initialMode && initialMode !== 'customer' ? 'admin' : 'customer');
  const [workspaceMode, setWorkspaceMode] = useState(initialMode === 'solo' ? 'solo' : 'store');
  const [slug, setSlug] = useState(choices.length === 1 ? choices[0].slug : '');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const selection = data.stores.find((store) => store.slug === slug);
  const existing = role === 'customer' && (selection?.existingAccount || data.existingAccount);
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    setError('');
    try {
      const form = new FormData(event.currentTarget);
      const body = {
        ...Object.fromEntries(form),
        role, workspaceMode,
        ...(role === 'admin' && workspaceMode !== 'solo' ? { address: addressFromForm(form) } : {}),
      };
      await api('auth/google/complete', 'POST', body);
      await onLogin();
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Não foi possível concluir.');
    } finally {
      setBusy(false);
    }
  }
  return (
    <>
      <span className="eyebrow">CONTA GOOGLE CONFIRMADA</span>
      <h2>{memberships.length ? 'Escolha seu espaço.' : 'Só falta um passo.'}</h2>
      <p>Olá, {data.profile.name}!</p>
      <form onSubmit={submit}>
        {!memberships.length && (
          <Field label="Como você quer usar o Compasso?">
            <select
              name="role"
              value={workspaceMode === 'solo' && role === 'admin' ? 'solo' : role}
              onChange={(event) => {
                setRole(event.target.value === 'solo' ? 'admin' : event.target.value);
                setWorkspaceMode(event.target.value === 'solo' ? 'solo' : 'store');
                setSlug('');
                setError('');
              }}
            >
              <option value="customer">Sou cliente</option>
              <option value="admin">Quero administrar meu novo negócio</option><option value="solo">Quero minha agenda individual</option>
            </select>
          </Field>
        )}
        {role === 'customer' && choices.length > 0 ? (
          <Field
            label="Seu espaço"
            hint={
              !data.stores.length
                ? 'Ainda não há lojas disponíveis. Você pode cadastrar seu negócio.'
                : undefined
            }
          >
            <select
              name="slug"
              required
              value={slug}
              onChange={(event) => {
                setSlug(event.target.value);
                setError('');
              }}
            >
              <option value="" disabled>
                Selecione uma loja
              </option>
              {choices.map((store) => (
                <option key={store.slug} value={store.slug}>
                  {store.workspaceMode === 'solo' ? 'Minha agenda Solo' : 'Empresa'} · {store.businessName}
                </option>
              ))}
            </select>
          </Field>
        ) : role === 'admin' && workspaceMode !== 'solo' ? (
          <>
            <Field label="Nome do negócio">
              <IdentityInput kind="businessName" name="businessName" required placeholder="O nome do seu espaço" />
            </Field>
            {workspaceMode !== 'solo' && <BusinessAddressFields />}
          </>
        ) : (
          <p className="form-note">
            {workspaceMode === 'solo' ? 'Sua agenda é privada e tem acesso individual, com 14 dias para experimentar.' : 'Sua conta vale para todos os estabelecimentos. Escolha onde agendar depois.'}
          </p>
        )}
        {!memberships.length && !existing && <Field label="Seu nome"><IdentityInput kind="name" name="name" required defaultValue={data.profile.name} autoComplete="name" /></Field>}
        {!memberships.length && !existing && (
          <Field label="Telefone">
            <IdentityInput kind="phone" name="phone" required type="tel" inputMode="tel" autoComplete="tel" placeholder="(18) 99999-9999" />
          </Field>
        )}
        {existing && !selection?.linked && (
          <>
            <p>
              Você já tem uma conta. Confirme sua senha uma única vez para vincular o Google e
              manter seus dados e permissões.
            </p>
            <PasswordField />
          </>
        )}
        {!existing && role === 'admin' && <p className="form-note">{workspaceMode === 'solo' ? 'Sua agenda' : 'Sua loja'} começa com 14 dias grátis, sem cartão obrigatório e sem cobrança automática ao final. Clientes não pagam assinatura.</p>}
        {error && (
          <p className="error-message" role="alert">
            {error}
          </p>
        )}
        <button className="button primary full" disabled={busy}>
          {busy ? 'Concluindo…' : 'Ir para o meu espaço'}
        </button>
      </form>
      <p className="login-switch">
        <button type="button" disabled={busy} onClick={onBack}>
          Voltar ao login
        </button>
      </p>
    </>
  );
}
