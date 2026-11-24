'use client';
import { useEffect, useState } from 'react';
import { Brand } from '@/modules/shared/presentation/brand';
import { api } from '@/modules/shared/infrastructure/api';
import type { User } from '@/modules/shared/domain/models';

export function DiscoveryHeader({ user: initialUser }: { user?: User }) {
  const [user, setUser] = useState(initialUser);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  useEffect(() => {
    if (initialUser) return;
    let active = true;
    api<User>('auth/me')
      .then((value) => {
        if (active) setUser(value);
      })
      .catch(() => {});
    return () => {
      active = false;
    };
  }, [initialUser]);
  async function logout() {
    setBusy(true);
    try {
      await api('auth/logout', 'POST', {});
      location.assign('/');
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Não foi possível sair.');
      setBusy(false);
    }
  }
  return (
    <>
      <header className="customer-header">
        <a className="brand" href="/">
          <Brand />
        </a>
        {user ? (
          <div className="booking-navigation">
            <a href="/">Olá, {user.name.split(' ')[0]}</a>
            <button className="button secondary" disabled={busy} onClick={logout}>
              {busy ? 'Saindo…' : 'Sair'}
            </button>
          </div>
        ) : (
          <a className="button primary" href="/entrar">
            Entrar
          </a>
        )}
      </header>
      {error && (
        <p className="error-message" role="alert">
          {error}
        </p>
      )}
    </>
  );
}
