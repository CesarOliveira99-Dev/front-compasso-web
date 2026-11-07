'use client';
import { useState, type FormEvent } from 'react';
import { api } from '@/modules/shared/infrastructure/api';
import { Field } from '@/modules/shared/presentation/ui';
import {
  BusinessAddressFields,
  addressFromForm,
} from '@/modules/shared/presentation/business-address-fields';
import { PasswordField } from './password-field';

export interface GoogleOnboardingData {
  status: 'onboarding_required';
  profile: { name: string; email: string };
  stores: { slug: string; businessName: string; linked: boolean; existingAccount: boolean }[];
}
export type GoogleSignInResult =
  GoogleOnboardingData | { status: 'authenticated' } | { linked: boolean };

export function GoogleOnboarding({
  data,
  onLogin,
  onBack,
}: {
  data: GoogleOnboardingData;
  onLogin: () => Promise<void>;
  onBack: () => void;
}) {
  const memberships = data.stores.filter((store) => store.linked);
  const [role, setRole] = useState('customer');
  const [slug, setSlug] = useState(memberships[0]?.slug || '');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const selection = data.stores.find((store) => store.slug === slug);
  const existing = role === 'customer' && selection?.existingAccount;
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    setError('');
    try {
      const form = new FormData(event.currentTarget);
      const body = {
        ...Object.fromEntries(form),
        ...(role === 'admin' ? { address: addressFromForm(form) } : {}),
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
              value={role}
              onChange={(event) => {
                setRole(event.target.value);
                setSlug('');
                setError('');
              }}
            >
              <option value="customer">Sou cliente / entrar em uma loja</option>
              <option value="admin">Quero administrar meu novo negócio</option>
            </select>
          </Field>
        )}
        {role === 'customer' ? (
          <Field
            label="Sua loja"
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
              {(memberships.length ? memberships : data.stores).map((store) => (
                <option key={store.slug} value={store.slug}>
                  {store.businessName}
                </option>
              ))}
            </select>
          </Field>
        ) : (
          <>
            <Field label="Nome do negócio">
              <input name="businessName" required minLength={2} maxLength={100} />
            </Field>
            <BusinessAddressFields />
          </>
        )}
        {!memberships.length && !existing && (
          <Field label="Telefone">
            <input
              name="phone"
              type="tel"
              required
              minLength={10}
              maxLength={20}
              autoComplete="tel"
              placeholder="(18) 99999-9999"
            />
          </Field>
        )}
        {existing && !selection?.linked && (
          <>
            <p>
              Você já tem cadastro nesta loja. Confirme sua senha uma única vez para vincular o
              Google e manter seus dados e permissões.
            </p>
            <PasswordField />
          </>
        )}
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
