'use client';
import { Brand } from '@/modules/shared/presentation/brand';
import { api } from '@/modules/shared/infrastructure/api';
import { Field } from '@/modules/shared/presentation/ui';
import {
  ArrowRight,
  CalendarDays,
  Check,
  CircleHelp,
  Leaf,
  LoaderCircle,
  Sparkles,
} from 'lucide-react';
import { useRef, useState, type FormEvent } from 'react';
import { GoogleButton } from './google-button';
import type { StoreSummary } from '@/modules/shared/domain/models';
import {
  BusinessAddressFields,
  addressFromForm,
} from '@/modules/shared/presentation/business-address-fields';
import { PasswordField } from './password-field';
import { GoogleOnboarding, type GoogleOnboardingData } from './google-onboarding';
export function Login({ onLogin }: { onLogin: () => Promise<void> }) {
  const [loginStores, setLoginStores] = useState<StoreSummary[]>([]);
  const [registrationKey] = useState(() => crypto.randomUUID());
  const [register, setRegister] = useState(false);
  const [role, setRole] = useState('customer');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [onboarding, setOnboarding] = useState<GoogleOnboardingData | null>(null);
  const formRef = useRef<HTMLFormElement>(null);
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    if (register && form.get('password') !== form.get('confirmPassword')) {
      setError('As senhas não coincidem. Digite a mesma senha nos dois campos.');
      (event.currentTarget.elements.namedItem('confirmPassword') as HTMLInputElement)?.focus();
      return;
    }
    setBusy(true);
    setError('');
    try {
      const result = await api<{ status?: string; stores?: StoreSummary[] }>(
        register ? 'auth/register' : 'auth/login',
        'POST',
        {
          ...Object.fromEntries(form),
          ...(register ? { idempotencyKey: registrationKey } : {}),
          ...(register && role === 'admin' ? { address: addressFromForm(form) } : {}),
        },
      );
      if (result.status === 'store_selection_required') {
        setLoginStores(result.stores || []);
        return;
      }
      await onLogin();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Não foi possível entrar.');
    } finally {
      setBusy(false);
    }
  }
  return (
    <main className="login-page">
      <section className="login-story">
        <a className="brand" href="/">
          <Brand />
        </a>
        <div className="login-story-content">
          <span className="pill light">
            <Sparkles size={14} /> MAIS ESPAÇO PARA O QUE IMPORTA
          </span>
          <h1>
            Seu negócio.
            <br />
            Seu tempo.
            <br />
            <em>Seu compasso.</em>
          </h1>
          <p>
            Uma rotina mais leve começa com tudo no lugar. Cuide dos seus clientes. A gente cuida da
            organização.
          </p>
          <div className="story-checks">
            <span>
              <Check size={17} /> Agenda sem complicação
            </span>
            <span>
              <Check size={17} /> Clientes sempre por perto
            </span>
            <span>
              <Check size={17} /> Clareza para crescer
            </span>
          </div>
        </div>
        <div className="login-preview">
          <span className="preview-symbol">
            <CalendarDays size={24} />
          </span>
          <div>
            <strong>Seu próximo passo, organizado.</strong>
            <p>Um lugar para cada cuidado.</p>
          </div>
          <span className="preview-check">
            <Check size={19} />
          </span>
        </div>
        <div className="botanical">
          <i />
          <i />
          <i />
          <i />
        </div>
        <small className="story-footer">FEITO PARA NEGÓCIOS QUE CUIDAM DE PESSOAS.</small>
      </section>
      <section className="login-form-section">
        <div className="login-form">
          {onboarding ? (
            <GoogleOnboarding
              data={onboarding}
              onLogin={onLogin}
              onBack={() => {
                setOnboarding(null);
                setError('');
              }}
            />
          ) : (
            <>
              <span className="eyebrow">BEM-VINDO AO SEU ESPAÇO</span>
              <h2>{register ? 'Vamos começar?' : 'Bom ter você aqui.'}</h2>
              <p>
                {register
                  ? 'Crie sua conta e encontre seu ritmo.'
                  : 'Entre para acompanhar o que vem pela frente.'}
              </p>
              <form ref={formRef} onSubmit={submit}>
                {register && (
                  <>
                    <Field label="Tipo de conta">
                      <select name="role" value={role} onChange={(e) => setRole(e.target.value)}>
                        <option value="customer">Sou cliente</option>
                        <option value="admin">Quero administrar meu negócio</option>
                      </select>
                    </Field>
                    <Field label="Seu nome">
                      <input
                        name="name"
                        required
                        minLength={2}
                        placeholder="Como podemos chamar você?"
                        autoComplete="name"
                      />
                    </Field>
                    <Field label="Telefone">
                      <input
                        name="phone"
                        required
                        minLength={10}
                        placeholder="(11) 99999-9999"
                        autoComplete="tel"
                      />
                    </Field>
                    {role === 'admin' && (
                      <>
                        <Field label="Nome do negócio">
                          <input
                            name="businessName"
                            required
                            minLength={2}
                            maxLength={100}
                            placeholder="O nome do seu espaço"
                          />
                        </Field>
                        <BusinessAddressFields />
                      </>
                    )}
                  </>
                )}
                <Field label="E-mail">
                  <input
                    name="email"
                    type="email"
                    required
                    placeholder="voce@exemplo.com"
                    autoComplete="email"
                  />
                </Field>
                <PasswordField
                  key={register ? 'new-password' : 'login-password'}
                  register={register}
                />
                {register && <PasswordField confirm register />}
                {!register && loginStores.length > 0 && (
                  <Field label="Estabelecimento">
                    <select name="slug" required defaultValue="">
                      <option value="" disabled>
                        Selecione a loja pelo nome
                      </option>
                      {loginStores.map((store) => (
                        <option key={store.slug} value={store.slug}>
                          {store.businessName}
                          {store.city ? ` — ${store.city}/${store.state}` : ''}
                        </option>
                      ))}
                    </select>
                  </Field>
                )}
                {register && role === 'customer' && (
                  <p className="form-note">Sua conta vale para todos os estabelecimentos. Escolha onde agendar depois.</p>
                )}
        {register && role === 'admin' && <p className="form-note">Sua loja começa com 14 dias grátis, sem cartão obrigatório e sem cobrança automática ao final. Clientes não pagam assinatura.</p>}
                {error && (
                  <p className="error-message" role="alert">
                    {error}
                  </p>
                )}
                <button className="button primary full" disabled={busy}>
                  {busy ? (
                    <LoaderCircle size={18} className="spin" />
                  ) : (
                    <>
                      {register ? 'Criar minha conta' : 'Entrar no meu espaço'}
                      <ArrowRight size={18} />
                    </>
                  )}
                </button>
              </form>
              <GoogleButton
                separator
                key={register ? 'register' : 'login'}
                getInput={() => ({ mode: 'login' })}
                onSuccess={async (result) => {
                  setError('');
                  if ('status' in result && result.status === 'onboarding_required')
                    setOnboarding(result);
                  else await onLogin();
                }}
                onError={setError}
              />
              <nav className="login-help-links" aria-label="Ajuda e estabelecimentos">
                <a href="/conta">Esqueci minha senha</a>
                <a href="/descobrir">Descobrir estabelecimentos</a>
              </nav>
              <p className="login-switch">
                {register ? 'Já tem uma conta?' : 'Primeira vez por aqui?'}{' '}
                <button
                  onClick={() => {
                    setRegister(!register);
                    setLoginStores([]);
                    setError('');
                  }}
                >
                  {register ? 'Entre aqui' : 'Crie sua conta'}
                </button>
              </p>
            </>
          )}
          <div className="login-bottom">
            <CircleHelp size={15} />
            Cada cuidado começa com uma boa conexão.
          </div>
        </div>
      </section>
    </main>
  );
}
