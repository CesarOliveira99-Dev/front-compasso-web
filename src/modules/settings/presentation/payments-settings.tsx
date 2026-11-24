'use client';
import { useState } from 'react';
import { api } from '@/modules/shared/infrastructure/api';
import { StorePlans, type PlanStatus } from './store-plans';
import { useResource, ResourceState, type SectionProps } from '@/modules/shared/presentation/ui';
interface PaymentStatus extends PlanStatus { configured: boolean; connected: boolean }
export function PaymentsSettings(props: SectionProps & { view?: 'plans' | 'connection' }) {
  const [revision, setRevision] = useState(0);
  const resource = useResource<PaymentStatus>('payments/status', revision + props.revision);
  const [busy, setBusy] = useState(false);
  async function action(path: string, redirect = true) {
    setBusy(true);
    try {
      const result = await api<{ url?: string }>(path, 'POST', {});
      if (redirect && result.url) window.location.assign(result.url);
      else {
        setRevision((value) => value + 1);
        props.notify('Situação atualizada.');
      }
    } catch (error) {
      props.notify(error instanceof Error ? error.message : 'Não foi possível continuar.', true);
    } finally {
      setBusy(false);
    }
  }
  if (props.view === 'plans') return <><ResourceState {...resource} />{resource.value && <StorePlans status={resource.value} props={props} busy={busy} refresh={() => action('payments/subscription/refresh', false)} />}</>;
  return (
    <>
      <section className="panel integration-card">
        <h3>Mercado Pago</h3>
        <ResourceState {...resource} />
        {resource.value && (
          <>
            <span className="integration-status">
              {resource.value.connected ? 'Conta conectada' : 'Conta não conectada'}
            </span>
            <p>
              Receba suas vendas na sua conta Mercado Pago. Depois você pode transferir para seu
              banco. As taxas do provedor são descontadas das suas vendas.
            </p>
            <button
              type="button"
              className="button secondary"
              disabled={busy || !resource.value.configured}
              onClick={() => action('payments/connect')}
            >
              {resource.value.connected ? 'Autorizar novamente' : 'Conectar minha conta'}
            </button>
            {!resource.value.configured && (
              <p>O responsável pelo Compasso ainda está configurando esta integração.</p>
            )}
          </>
        )}
        <p>
          Prefere seu banco atual? Cadastre sua chave Pix e salve as configurações. Você confere os
          recebimentos e marca os pedidos como pagos.
        </p>
      </section>
    </>
  );
}
