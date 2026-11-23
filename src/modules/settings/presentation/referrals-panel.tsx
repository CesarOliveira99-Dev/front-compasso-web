'use client';
import { useState } from 'react';
import { ResourceState, useResource } from '@/modules/shared/presentation/ui';
interface Status { code: string; balancePercent: number; pending: number; qualified: number; nextDiscountPercent: number }
export function ReferralsPanel({ revision }: { revision: number }) {
  const resource = useResource<Status>('payments/referrals', revision);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState('');
  return <section className="panel settings-panel referral-panel">
    <h2>Indicações</h2>
    <ResourceState {...resource} />
    {resource.value && <>
      <div className="referral-code"><span>Seu código</span><strong>{resource.value.code}</strong><button type="button" className="button secondary" onClick={async () => {
        try { await navigator.clipboard.writeText(resource.value!.code); setCopied(true); setError(''); }
        catch { setError('Selecione e copie o código acima.'); }
      }}>{copied ? 'Copiado' : 'Copiar código'}</button></div>
      <div className="referral-metrics">
        <div><strong>{resource.value.pending}</strong><span>Aguardando confirmação</span></div>
        <div><strong>{resource.value.qualified}</strong><span>Indicações confirmadas</span></div>
        <div><strong>{resource.value.balancePercent.toLocaleString('pt-BR')}%</strong><span>Saldo de descontos</span></div>
        <div><strong>{resource.value.nextDiscountPercent.toLocaleString('pt-BR')}%</strong><span>Próxima renovação</span></div>
      </div>
    </>}
    {error && <p role="status">{error}</p>}
  </section>;
}
