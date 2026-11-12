'use client';
import { useResource } from '@/modules/shared/presentation/ui';
import type { PlanStatus } from './store-plans';
export function StoreTrialBanner({ revision, manage }: { revision: number; manage: () => void }) {
  const { value } = useResource<PlanStatus>('payments/status', revision);
  if (!value || !['trial', 'expired'].includes(value.entitlement.mode)) return null;
  const end = value.entitlement.expiresAt;
  return <aside className={`plan-access ${value.entitlement.mode} store-trial-banner`}>
    <div><strong>{value.entitlement.mode === 'trial' && end
      ? `Teste grátis até ${new Date(end).toLocaleDateString('pt-BR', { timeZone: 'America/Sao_Paulo' })}`
      : 'Seu período de uso terminou'}</strong>
      <p>{value.entitlement.mode === 'trial' ? '14 dias para conhecer o Compasso. Sem contratação, não há cobrança ao terminar.' : 'Seus dados estão disponíveis. Escolha um plano para receber novos agendamentos e pedidos.'}</p></div>
    <button type="button" className="button secondary" onClick={manage}>Ver planos</button>
  </aside>;
}
