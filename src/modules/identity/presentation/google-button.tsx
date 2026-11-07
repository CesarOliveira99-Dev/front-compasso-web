'use client';
import { useEffect, useRef, useState } from 'react';
import { api } from '@/modules/shared/infrastructure/api';
import type { GoogleSignInResult } from './google-onboarding';
interface GoogleSdk {
  accounts: {
    id: {
      initialize(options: {
        client_id: string;
        nonce: string;
        callback: (response: { credential: string }) => void;
      }): void;
      renderButton(
        element: HTMLElement,
        options: { theme: string; size: string; text: string },
      ): void;
    };
  };
}
let scriptPromise: Promise<void> | undefined;
function loadScript() {
  if ((window as unknown as { google?: GoogleSdk }).google) return Promise.resolve();
  scriptPromise ??= new Promise((resolve, reject) => {
    const script = document.createElement('script');
    script.src = 'https://accounts.google.com/gsi/client';
    script.async = true;
    script.onload = () => resolve();
    script.onerror = () => {
      scriptPromise = undefined;
      reject(new Error('Não foi possível carregar o Google.'));
    };
    document.head.appendChild(script);
  });
  return scriptPromise;
}
export function GoogleButton({
  getInput,
  onSuccess,
  onError,
  link = false,
  separator = false,
}: {
  getInput: () => Record<string, unknown>;
  onSuccess: (result: GoogleSignInResult) => Promise<void>;
  onError: (message: string) => void;
  link?: boolean;
  separator?: boolean;
}) {
  const element = useRef<HTMLDivElement>(null);
  const latest = useRef({ getInput, onSuccess, onError });
  latest.current = { getInput, onSuccess, onError };
  const [generation, setGeneration] = useState(0);
  const [ready, setReady] = useState(false);
  useEffect(() => {
    let active = true;
    (async () => {
      const config = await api<{ clientId: string }>('auth/google/config');
      if (!config.clientId) return;
      const { challenge, nonce } = await api<{ challenge: string; nonce: string }>(
        'auth/google/challenge',
        'POST',
        {},
      );
      await loadScript();
      if (!active || !element.current) return;
      const sdk = (window as unknown as { google: GoogleSdk }).google;
      sdk.accounts.id.initialize({
        client_id: config.clientId,
        nonce,
        callback: async (response) => {
          if (!active) return;
          try {
            const result = await api<GoogleSignInResult>(
              link ? 'auth/google/link' : 'auth/google',
              'POST',
              {
                ...latest.current.getInput(),
                credential: response.credential,
                challenge,
              },
            );
            await latest.current.onSuccess(result);
          } catch (error) {
            latest.current.onError(
              error instanceof Error ? error.message : 'Não foi possível entrar com Google.',
            );
          } finally {
            if (active) setGeneration((value) => value + 1);
          }
        },
      });
      element.current.replaceChildren();
      sdk.accounts.id.renderButton(element.current, {
        theme: 'outline',
        size: 'large',
        text: 'continue_with',
      });
      setReady(true);
    })().catch((error) => {
      if (active) latest.current.onError(error.message);
    });
    return () => {
      active = false;
    };
  }, [link, generation]);
  return (
    <div className={separator && ready ? 'login-google' : undefined}>
      {separator && ready && (
        <div className="login-auth-divider" aria-hidden="true">
          <span>ou</span>
        </div>
      )}
      <div ref={element} aria-label={link ? 'Vincular conta Google' : 'Entrar com Google'} />
    </div>
  );
}
