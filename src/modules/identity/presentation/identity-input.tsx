'use client';
import { useEffect, useId, useRef, useState, type InputHTMLAttributes } from 'react';
import { personNameError, phoneError } from '../domain/person-validation';

type Kind = 'name' | 'phone' | 'email' | 'businessName' | 'password' | 'confirmPassword';
export function IdentityInput({ kind, ...props }: InputHTMLAttributes<HTMLInputElement> & { kind: Kind }) {
  const generatedId = useId(), errorId = `${generatedId}-error`;
  const ref = useRef<HTMLInputElement>(null);
  const [error, setError] = useState('');
  function message(input: HTMLInputElement) {
    const value = input.value;
    if (kind === 'name') return personNameError(value);
    if (kind === 'phone') return phoneError(value);
    if (kind === 'email') return !value.trim() ? 'Informe seu e-mail.' : value.length > 254 ? 'O e-mail deve ter no máximo 254 caracteres.' : !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value) ? 'Informe um e-mail válido, como voce@exemplo.com.' : '';
    if (kind === 'businessName') return value.trim().length < 2 ? 'Informe o nome do negócio com pelo menos dois caracteres.' : value.trim().length > 100 ? 'O nome do negócio deve ter no máximo 100 caracteres.' : '';
    if (kind === 'confirmPassword') {
      const password = input.form?.elements.namedItem('password') as HTMLInputElement | null;
      return !value ? 'Confirme sua senha.' : value !== password?.value ? 'As senhas não coincidem.' : '';
    }
    return value.length < 8 ? 'A senha precisa ter pelo menos 8 caracteres.' : value.length > 128 ? 'A senha deve ter no máximo 128 caracteres.' : '';
  }
  function validate(input: HTMLInputElement, show = true) {
    const next = message(input);
    input.setCustomValidity(next);
    if (show) setError(next);
  }
  useEffect(() => { if (ref.current) validate(ref.current, false); }, [kind, props.defaultValue]);
  return <><input {...props} ref={ref} id={props.id || generatedId} aria-invalid={!!error} aria-describedby={[props['aria-describedby'], error ? errorId : ''].filter(Boolean).join(' ') || undefined}
    onInput={event => {
      validate(event.currentTarget);
      if (kind === 'password') {
        const confirm = event.currentTarget.form?.elements.namedItem('confirmPassword') as HTMLInputElement | null;
        if (confirm?.value) confirm.dispatchEvent(new Event('input', { bubbles: true }));
      }
      props.onInput?.(event);
    }} onBlur={event => { validate(event.currentTarget); props.onBlur?.(event); }}
    onInvalid={event => { validate(event.currentTarget); props.onInvalid?.(event); }} />
    {error && <small id={errorId} className="field-validation-error" aria-live="polite">{error}</small>}
  </>;
}
