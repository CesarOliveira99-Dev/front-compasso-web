'use client';
import { Brand } from '@/modules/shared/presentation/brand';
import { useEffect, useState } from 'react';
import { api } from '@/modules/shared/infrastructure/api';
import { Field } from '@/modules/shared/presentation/ui';
import { PasswordField } from './password-field';
import { GoogleButton } from './google-button';
export function InvitePage() {
  const [token, setToken] = useState(''),
    [shop, setShop] = useState(''),
    [error, setError] = useState(''),
    [busy, setBusy] = useState(false),
    [login, setLogin] = useState(false),
    [google, setGoogle] = useState(false),
    [signedIn, setSignedIn] = useState(false);
  useEffect(() => {
    const token = location.hash.slice(1);
    setToken(token);
    api<{ businessName: string }>('auth/invite/preview', 'POST', { token })
      .then((value) => setShop(value.businessName))
      .catch((error) => setError(error.message));
    api('auth/me')
      .then(() => setSignedIn(true))
      .catch(() => {});
  }, []);
  async function accept() {
    await api('auth/invite/accept', 'POST', { token });
    location.assign('/');
  }
  return (
    <main className="account-page">
      <section className="panel account-card">
        <a className="brand" href="/">
          <Brand />
        </a>
        <h1>Faça parte da equipe</h1>
        <p>{shop ? `Você foi convidado para ${shop}.` : 'Validando convite…'}</p>
        {error && (
          <p role="alert" className="error-message">
            {error}
          </p>
        )}
        {shop && (
          <>
            {signedIn ? (
              <button
                className="button primary"
                disabled={busy}
                onClick={async () => {
                  setBusy(true);
                  try {
                    await accept();
                  } catch (error) {
                    setError((error as Error).message);
                  } finally {
                    setBusy(false);
                  }
                }}
              >
                Aceitar convite com minha conta
              </button>
            ) : (
              <>
                <form
                  className="form-grid"
                  onSubmit={async (event) => {
                    event.preventDefault();
                    setBusy(true);
                    setError('');
                    const form = Object.fromEntries(new FormData(event.currentTarget));
                    try {
                      if (google) {
                        await api('auth/google/complete', 'POST', { phone: form.phone });
                        location.assign('/');
                      } else if (login) {
                        const result = await api<{ status?: string }>('auth/login', 'POST', form);
                        if (result.status === 'store_selection_required')
                          throw new Error(
                            'Entre pela página inicial, selecione seu vínculo e reabra este convite.',
                          );
                        await accept();
                      } else {
                        await api('auth/invite/register', 'POST', { ...form, token });
                        location.assign('/');
                      }
                    } catch (error) {
                      setError((error as Error).message);
                    } finally {
                      setBusy(false);
                    }
                  }}
                >
                  {!google && !login && (
                    <Field label="Seu nome">
                      <input name="name" required maxLength={100} />
                    </Field>
                  )}
                  {!login && (
                    <Field label="Telefone">
                      <input name="phone" type="tel" required minLength={10} maxLength={20} />
                    </Field>
                  )}
                  {!google && (
                    <>
                      <Field label="E-mail">
                        <input name="email" type="email" required />
                      </Field>
                      <PasswordField register={!login} />
                      {!login && <PasswordField register confirm />}
                    </>
                  )}
                  <button className="button primary" disabled={busy}>
                    {busy
                      ? 'Aguarde…'
                      : google
                        ? 'Concluir vínculo'
                        : login
                          ? 'Entrar e aceitar convite'
                          : 'Criar conta de funcionário'}
                  </button>
                </form>
                {!google && (
                  <>
                    <GoogleButton
                      getInput={() => ({ inviteToken: token })}
                      onError={setError}
                      separator
                      onSuccess={async (result) => {
                        if ('status' in result && result.status === 'authenticated')
                          location.assign('/');
                        else setGoogle(true);
                      }}
                    />
                    <button
                      className="text-button"
                      onClick={() => {
                        setLogin(!login);
                        setError('');
                      }}
                    >
                      {login ? 'Ainda não tenho conta' : 'Já tenho uma conta com senha'}
                    </button>
                  </>
                )}
              </>
            )}
            <p className="form-note">
              O convite vincula sua conta a esta loja como funcionário. Nas próximas vezes, entre
              pela página inicial do Compasso.
            </p>
          </>
        )}
      </section>
    </main>
  );
}
