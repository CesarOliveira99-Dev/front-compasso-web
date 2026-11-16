'use client';
import { Brand } from '@/modules/shared/presentation/brand';
import { useEffect, useState } from 'react';
import { api } from '@/modules/shared/infrastructure/api';
import { Field } from '@/modules/shared/presentation/ui';
import { PasswordField } from './password-field';
export function RecoveryPage() {
  const [token, setToken] = useState(''),
    [purpose, setPurpose] = useState(''),
    [message, setMessage] = useState(''),
    [error, setError] = useState(''),
    [busy, setBusy] = useState(false);
  useEffect(() => {
    const [purpose, token] = location.hash.slice(1).split(':');
    setPurpose(purpose || '');
    setToken(token || '');
  }, []);
  return (
    <main className="account-page">
      <section className="panel account-card">
        <a className="brand" href="/">
          <Brand />
        </a>
        <h1>
          {token
            ? purpose === 'verify'
              ? 'Confirmar e-mail'
              : 'Definir nova senha'
            : 'Recuperar acesso'}
        </h1>
        {message ? (
          <p role="status">{message}</p>
        ) : (
          <form
            className="form-grid"
            onSubmit={async (event) => {
              event.preventDefault();
              setBusy(true);
              setError('');
              try {
                const body = Object.fromEntries(new FormData(event.currentTarget));
                const result = await api<{ message?: string }>(
                  token ? 'auth/account/complete' : 'auth/password/request',
                  'POST',
                  token ? { ...body, token } : body,
                );
                setMessage(result.message || 'Tudo certo. Você já pode entrar na plataforma.');
              } catch (error) {
                setError((error as Error).message);
              } finally {
                setBusy(false);
              }
            }}
          >
            {!token && (
              <Field label="E-mail">
                <input type="email" name="email" required maxLength={254} />
              </Field>
            )}
            {token && purpose === 'password' && (
              <>
                <PasswordField register />
                <PasswordField register confirm />
              </>
            )}
            <button className="button primary" disabled={busy}>
              {busy ? 'Aguarde…' : token ? 'Confirmar' : 'Receber instruções por e-mail'}
            </button>
          </form>
        )}
        {error && (
          <p className="error-message" role="alert">
            {error}
          </p>
        )}
        <a href="/">Voltar ao login</a>
      </section>
    </main>
  );
}
