'use client';
import { useEffect, useState } from 'react';
import { api } from '@/modules/shared/infrastructure/api';
import { Field } from '@/modules/shared/presentation/ui';
export function ReferralCodeField() {
  const [enabled, setEnabled] = useState(false);
  useEffect(() => {
    let current = true;
    api<{ enabled: boolean }>('auth/referral-config').then(value => { if (current) setEnabled(value.enabled); }).catch(() => {});
    return () => { current = false; };
  }, []);
  if (!enabled) return null;
  return <Field label="Código de indicação (opcional)"><input name="referralCode" maxLength={12} minLength={12} pattern="[A-Za-z0-9]{12}" autoCapitalize="characters" autoComplete="off" placeholder="Código da empresa" /></Field>;
}
