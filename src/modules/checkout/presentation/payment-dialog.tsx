'use client';
import { initMercadoPago, Payment, StatusScreen } from '@mercadopago/sdk-react';
import { CheckCircle2, CreditCard, LoaderCircle, LockKeyhole, ShieldCheck } from 'lucide-react';
import { useCallback, useEffect, useMemo, useRef, useState, type ComponentProps } from 'react';
import { api } from '@/modules/shared/infrastructure/api';
import { money } from '@/modules/shared/domain/format';
import type { Order } from '@/modules/shared/domain/models';

interface Session {
  publicKey?: string;
  amountCents?: number;
  payerEmail?: string;
  attemptId?: string;
  status?: string;
  paymentId?: string;
  legacyUrl?: string;
  paid?: boolean;
}
type Submit = NonNullable<ComponentProps<typeof Payment>['onSubmit']>;
const methods = { paymentMethods: { creditCard: 'all' as const, bankTransfer: 'all' as const } };

export default function PaymentDialog({ order, setBusy, onPaid }: {
  order: Order; setBusy: (value: boolean) => void; onPaid: () => void;
}) {
  const [session, setSession] = useState<Session>();
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [sdkReady, setSdkReady] = useState(false);
  const [paid, setPaid] = useState(false);
  const active = useRef(true);
  const completed = useRef(false);
  const submissionInFlight = useRef(false);
  const paidCallback = useRef(onPaid);
  paidCallback.current = onPaid;
  const path = `payments/orders/${order.id}/bricks`;
  const apply = useCallback((result: Session) => {
    if (!active.current) return;
    setSession(previous => ({ ...previous, ...result }));
    if (result.paid && !completed.current) {
      completed.current = true;
      setPaid(true);
      paidCallback.current();
    }
  }, []);
  useEffect(() => {
    active.current = true;
    api<Session>(path, 'POST', {}).then(result => {
      if (!active.current) return;
      if (result.publicKey) initMercadoPago(result.publicKey, { locale: 'pt-BR' });
      setSession(result);
    }).catch(() => {
      if (active.current) setError('Não foi possível abrir o pagamento. Feche esta janela e tente novamente.');
    }).finally(() => { if (active.current) setLoading(false); });
    return () => { active.current = false; };
  }, [path]);
  const initialization = useMemo(() => ({ amount: (session?.amountCents || 0) / 100,
    payer: { email: session?.payerEmail || '' } }), [session?.amountCents, session?.payerEmail]);
  const statusInitialization = useMemo(() => ({ paymentId: session?.paymentId || '' }), [session?.paymentId]);
  const refresh = useCallback(async () => {
    const result = await api<Session>(`${path}/status`);
    apply(result);
    return result;
  }, [path, apply]);
  // Poll serially with a bound, so a slow provider never creates overlapping requests.
  useEffect(() => {
    if (!session?.paymentId || paid || ['rejected', 'cancelled', 'refunded', 'charged_back'].includes(session.status || '')) return;
    let stopped = false;
    let timer: ReturnType<typeof setTimeout>;
    let count = 0;
    const poll = async () => {
      if (stopped) return;
      try { const result = await refresh(); if (result.paid) return; }
      catch { if (!stopped) setError('A confirmação está demorando. Use Verificar pagamento para consultar novamente.'); }
      if (!stopped && ++count < 20) timer = setTimeout(poll, 6000);
    };
    timer = setTimeout(poll, 1500);
    return () => { stopped = true; clearTimeout(timer); };
  }, [session?.paymentId, session?.status, paid, refresh]);
  const busy = useCallback((value: boolean) => { setSubmitting(value); setBusy(value); }, [setBusy]);
  const onReady = useCallback(() => setSdkReady(true), []);
  const onBrickError = useCallback(() => setError('Não foi possível carregar o formulário. Confira sua conexão e reabra esta janela.'), []);
  const onStatusError = useCallback(() => setError('Não foi possível exibir os detalhes. Use Verificar pagamento para consultar a situação.'), []);
  const submit = useCallback<Submit>(async ({ formData }) => {
    if (!session?.attemptId || submissionInFlight.current) return;
    submissionInFlight.current = true;
    busy(true);
    setError('');
    try {
      const result = await api<Session>(`${path}/pay`, 'POST', { attemptId: session.attemptId, formData });
      apply(result);
      await refresh();
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Não foi possível confirmar o pagamento.');
      // A lost HTTP response does not mean the charge failed. Hide the form until recovered.
      apply({ status: 'processing' });
    } finally { submissionInFlight.current = false; busy(false); }
  }, [session?.attemptId, path, apply, refresh, busy]);
  async function verifyOrRetry() {
    busy(true);
    setError('');
    try {
      const current = await refresh();
      if (current.paid) return;
      if (current.status === 'processing') {
        apply(await api<Session>(`${path}/pay`, 'POST', { attemptId: current.attemptId }));
        await refresh();
      } else if (['rejected', 'cancelled'].includes(current.status || '')) {
        setSdkReady(false);
        apply(await api<Session>(path, 'POST', {}));
      }
    } catch (cause) { setError(cause instanceof Error ? cause.message : 'Não foi possível consultar o pagamento.'); }
    finally { busy(false); }
  }
  const retryable = ['rejected', 'cancelled'].includes(session?.status || '');
  return <section className="compasso-payment" aria-label="Pagamento do pedido">
    <div className="payment-summary">
      <span className="payment-summary-icon"><CreditCard size={22} /></span>
      <div><span className="eyebrow">SEU PEDIDO</span><strong>Crédito ou Pix</strong>
        <small>{order.items.map(item => `${item.quantity}× ${item.name}`).join(' · ')}</small></div>
      <strong className="payment-amount">{money(session?.amountCents ?? order.totalCents)}</strong>
    </div>
    <p className="payment-security"><LockKeyhole size={14} /> Pagamento seguro processado pelo Mercado Pago. Sem precisar criar uma conta.</p>
    {loading && <p className="payment-loading" role="status"><LoaderCircle className="spin" size={20} /> Preparando seu pagamento…</p>}
    {session?.legacyUrl && <div className="payment-message">
      <p>Este pedido já tem um pagamento iniciado. Continue pelo link existente.</p>
      <a className="button primary" href={session.legacyUrl}>Continuar pagamento</a>
    </div>}
    {paid ? <div className="payment-success" role="status"><CheckCircle2 size={36} /><h3>Pagamento confirmado!</h3>
      <p>Seu pedido já foi atualizado. Você pode fechar esta janela.</p></div> : <>
      {session?.publicKey && session.status === 'ready' && <div className="payment-brick" aria-busy={!sdkReady}>
        {!sdkReady && <p role="status">Carregando as formas de pagamento…</p>}
        <Payment key={session.attemptId} initialization={initialization} customization={methods}
          onSubmit={submit} onReady={onReady} onError={onBrickError} />
      </div>}
      {session?.paymentId && <StatusScreen key={session.paymentId} initialization={statusInitialization}
        onError={onStatusError} />}
      {session?.status === 'processing' && <p className="payment-message" role="status">Estamos verificando sua tentativa. Aguarde a confirmação antes de fazer outro pagamento.</p>}
      {session && !session.legacyUrl && session.status !== 'ready' && <button type="button"
        className="button secondary" disabled={submitting} onClick={verifyOrRetry}>
        {submitting && <LoaderCircle size={16} className="spin" />}{retryable ? 'Escolher outra forma de pagamento' : 'Verificar pagamento'}
      </button>}
    </>}
    {error && <p role="alert" className="error-message">{error}</p>}
    <p className="payment-security"><ShieldCheck size={14} /> Os dados do cartão são enviados diretamente ao Mercado Pago.</p>
  </section>;
}
