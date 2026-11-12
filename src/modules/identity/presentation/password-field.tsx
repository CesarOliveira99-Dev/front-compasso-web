'use client';
import { useId, useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';
import { Field } from '@/modules/shared/presentation/ui';
import { IdentityInput } from './identity-input';

export function PasswordField({
  confirm = false,
  register = false,
}: {
  confirm?: boolean;
  register?: boolean;
}) {
  const [visible, setVisible] = useState(false);
  const inputId = useId();
  const description = confirm ? 'confirmação de senha' : 'senha';
  return (
    <Field label={confirm ? 'Confirmar senha' : 'Senha'}>
      <div className="password-control">
        <IdentityInput
          kind={confirm ? 'confirmPassword' : 'password'}
          id={inputId}
          name={confirm ? 'confirmPassword' : 'password'}
          type={visible ? 'text' : 'password'}
          required
          minLength={8}
          placeholder={confirm ? 'Digite sua senha novamente' : 'Sua senha de acesso'}
          autoComplete={register ? 'new-password' : 'current-password'}
        />
        <button
          className="password-toggle"
          type="button"
          aria-label={`${visible ? 'Ocultar' : 'Mostrar'} ${description}`}
          aria-pressed={visible}
          aria-controls={inputId}
          onClick={() => setVisible((value) => !value)}
        >
          {visible ? <EyeOff size={18} /> : <Eye size={18} />}
        </button>
      </div>
    </Field>
  );
}
