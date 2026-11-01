'use client';
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
import { useState, type FormEvent } from 'react';
export function Login({ onLogin }: { onLogin: () => Promise<void> }) {
  const [register, setRegister] = useState(false);
  const [role, setRole] = useState('customer');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    setBusy(true);
    setError('');
    try {
      await api(register ? 'auth/register' : 'auth/login', 'POST', Object.fromEntries(form));
      await onLogin();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Não foi possível entrar.');
    } finally {
      setBusy(false);
    }
  }
  async function demo(kind: 'admin' | 'cliente') {
    setBusy(true);
    setError('');
    try {
      await api('auth/login', 'POST', {
        email: `${kind}@compasso.local`,
        password: 'Compasso@2026',
        slug: 'studio',
      });
      await onLogin();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Demonstração indisponível.');
    } finally {
      setBusy(false);
    }
  }
  return (
    <main className="login-page">
      <section className="login-story">
        <a className="brand" href="/">
          <span className="brand-mark">
            <Leaf size={23} />
          </span>
          compasso<span className="brand-period">.</span>
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
          <span className="eyebrow">BEM-VINDO AO SEU ESPAÇO</span>
          <h2>{register ? 'Vamos começar?' : 'Bom ter você aqui.'}</h2>
          <p>
            {register
              ? 'Crie sua conta e encontre seu ritmo.'
              : 'Entre para acompanhar o que vem pela frente.'}
          </p>
          <form onSubmit={submit}>
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
                  <Field label="Nome do negócio">
                    <input name="businessName" required placeholder="O nome do seu espaço" />
                  </Field>
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
            <Field label="Senha">
              <input
                name="password"
                type="password"
                required
                minLength={8}
                maxLength={128}
                placeholder="Sua senha de acesso"
                autoComplete={register ? 'new-password' : 'current-password'}
              />
            </Field>
            <Field
              label={register && role === 'admin' ? 'Código da sua nova loja' : 'Código da loja'}
              hint="Na demonstração, use studio."
            >
              <input
                name="slug"
                defaultValue="studio"
                pattern="[a-z0-9-]+"
                required
                placeholder="studio"
              />
            </Field>
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
          <p className="login-switch">
            {register ? 'Já tem uma conta?' : 'Primeira vez por aqui?'}{' '}
            <button
              onClick={() => {
                setRegister(!register);
                setError('');
              }}
            >
              {register ? 'Entre aqui' : 'Crie sua conta'}
            </button>
          </p>
          {process.env.NODE_ENV !== 'production' && (
            <div className="demo-box">
              <span>
                <Sparkles size={15} /> EXPLORE A DEMONSTRAÇÃO
              </span>
              <div>
                <button onClick={() => demo('admin')} disabled={busy}>
                  Visão do administrador
                  <ArrowRight size={15} />
                </button>
                <button onClick={() => demo('cliente')} disabled={busy}>
                  Visão do cliente
                  <ArrowRight size={15} />
                </button>
              </div>
              <small>Dados fictícios • nenhum pagamento ou envio externo</small>
            </div>
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
