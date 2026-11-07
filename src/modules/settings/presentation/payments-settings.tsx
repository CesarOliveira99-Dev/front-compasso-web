'use client';
import { useState } from 'react';
import { api } from '@/modules/shared/infrastructure/api';
import { money } from '@/modules/shared/domain/format';
import { useResource, ResourceState, type SectionProps } from '@/modules/shared/presentation/ui';
interface PaymentStatus {
  configured: boolean;
  connected: boolean;
  billingEnabled: boolean;
  monthlyPriceCents: number;
  subscription: { status: string } | null;
}
export function PaymentsSettings(props: SectionProps) {
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
      <section className="panel integration-card">
        <h3>Seu plano Compasso</h3>
        {resource.value?.billingEnabled ? (
          <>
            <p>
              {money(resource.value.monthlyPriceCents)} por mês. Cobrança recorrente pelo Mercado
              Pago.
            </p>
            <p>Situação: {resource.value.subscription?.status || 'Sem assinatura'}</p>
            {!resource.value.subscription && (
              <button
                type="button"
                className="button primary"
                disabled={busy}
                onClick={() => action('payments/subscribe')}
              >
                Assinar Compasso
              </button>
            )}
            {resource.value.subscription && (
              <>
                <button
                  type="button"
                  className="button secondary"
                  disabled={busy}
                  onClick={() => action('payments/subscription/refresh', false)}
                >
                  Atualizar situação
                </button>
                {resource.value.subscription.status === 'pending' && (
                  <button
                    type="button"
                    className="button secondary"
                    disabled={busy}
                    onClick={() => action('payments/subscribe')}
                  >
                    Concluir assinatura
                  </button>
                )}
                <a
                  href="https://www.mercadopago.com.br/subscriptions"
                  target="_blank"
                  rel="noreferrer"
                >
                  Gerenciar ou cancelar no Mercado Pago
                </a>
              </>
            )}
          </>
        ) : (
          <p>
            A contratação dos planos será habilitada em breve. Nenhuma mensalidade será cobrada
            agora.
          </p>
        )}
      </section>
    </>
  );
}
