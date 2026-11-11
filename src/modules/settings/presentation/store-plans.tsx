'use client';
import { money } from '@/modules/shared/domain/format';
import { api } from '@/modules/shared/infrastructure/api';
import type { SectionProps } from '@/modules/shared/presentation/ui';

interface Plan { id: string; name: string; priceCents: number; employees: number; monthlyEmails: number; dailyEmails: number }
export interface PlanStatus {
  billingEnabled: boolean; plans: Plan[]; employeesUsed: number; setupPending: boolean;
  entitlement: { mode: 'trial' | 'active' | 'expired' | 'pilot'; plan: Plan | null; expiresAt: number | null };
  subscription: { status: string; planId: string; paidThrough?: number } | null;
  emailUsage: { daily: { used: number; limit: number | null }; monthly: { used: number; limit: number | null } };
}
const number = (value: number) => value.toLocaleString('pt-BR');
const date = (value: number) => new Date(value).toLocaleDateString('pt-BR', { timeZone: 'America/Sao_Paulo' });
export function StorePlans({ status, props, busy, refresh }: { status: PlanStatus; props: SectionProps; busy: boolean; refresh: () => void }) {
  const { entitlement, subscription } = status;
  function choose(plan: Plan) {
    props.openDialog({ title: `Contratar ${plan.name}`, submitLabel: 'Continuar no Mercado Pago',
      content: <><p>{money(plan.priceCents)} por mês, com renovação automática após sua autorização. Cancele pelo Mercado Pago.</p>
        <p>{plan.employees} funcionário(s), {number(plan.monthlyEmails)} e-mails por mês e até {plan.dailyEmails} por dia.</p>
        <p>{entitlement.mode === 'trial' && entitlement.expiresAt
          ? `A primeira cobrança será programada para depois do teste, em ${date(entitlement.expiresAt)}.`
          : 'A contratação inicia uma assinatura mensal paga.'} Clientes não pagam assinatura.</p></>,
      onSubmit: async () => { const result = await api<{ url: string }>('payments/subscribe', 'POST', { planId: plan.id }); window.location.assign(result.url); },
    });
  }
  return <section className="panel integration-card store-plans">
    <div><span className="eyebrow">PARA QUEM CUIDA DA LOJA</span><h3>Seu plano Compasso</h3></div>
    <div className={`plan-access ${entitlement.mode}`} role="status">
      <strong>{entitlement.mode === 'trial' ? '14 dias para experimentar' : entitlement.mode === 'active' ? `Plano ${entitlement.plan?.name} ativo` : entitlement.mode === 'pilot' ? 'Sua loja continua no piloto' : 'Seu período de uso terminou'}</strong>
      <p>{entitlement.mode === 'trial' && entitlement.expiresAt ? `Teste grátis até ${date(entitlement.expiresAt)}, com os recursos do Equipe. Sem cartão obrigatório. Sem contratação, o teste termina sem gerar cobrança.`
        : entitlement.mode === 'active' && entitlement.expiresAt ? `Período pago até ${date(entitlement.expiresAt)}.`
        : entitlement.mode === 'pilot' ? 'Nenhuma assinatura ou cobrança automática foi criada para sua loja.'
        : 'Seus dados continuam disponíveis. Contrate um plano para receber novos agendamentos e pedidos.'}</p>
    </div>
    <p><strong>Clientes não pagam assinatura.</strong> A mensalidade é do dono da loja. O pagamento dos serviços continua separado.</p>
    <div className="plan-usage">
      <span>Funcionários ativos: <strong>{status.employeesUsed}{entitlement.plan ? ` / ${entitlement.plan.employees}` : ''}</strong><small>O dono não ocupa uma vaga.</small></span>
      {(['monthly', 'daily'] as const).map(period => { const quota = status.emailUsage[period]; const warning = quota.limit !== null && quota.used >= quota.limit * .8;
        return <div key={period} className={warning ? 'quota-warning' : ''}>
          <span>E-mails {period === 'monthly' ? 'neste mês' : 'hoje'}: <strong>{number(quota.used)} / {quota.limit === null ? 'piloto' : number(quota.limit)}</strong></span>
          {quota.limit !== null && <progress max={Math.max(1, quota.limit)} value={Math.min(quota.used, quota.limit)} aria-label={`Uso de e-mails ${period === 'monthly' ? 'mensal' : 'diário'}`} />}
          {warning && <small>{quota.used >= quota.limit! ? 'Franquia atingida. Novos e-mails aguardam a renovação do limite.' : 'Você já utilizou pelo menos 80% desta franquia.'}</small>}
        </div>; })}
    </div>
    <p className="form-note">Confirmações e lembretes compartilham a franquia mensal e o limite diário. A contagem inclui envios em verificação e reinicia no horário de Brasília. Senhas e segurança ficam fora da franquia da loja. Sem cobrança automática de excedentes.</p>
    <div className="store-plan-grid">{status.plans.map(plan => {
      const current = subscription?.planId === plan.id && !['cancelled', 'canceled'].includes(subscription.status);
      const other = subscription && !['cancelled', 'canceled'].includes(subscription.status) && !current;
      const capacity = status.employeesUsed > plan.employees;
      return <article className={`store-plan ${entitlement.plan?.id === plan.id ? 'selected' : ''}`} key={plan.id}>
        <h4>{plan.name}</h4><p className="plan-price">{money(plan.priceCents)}<small> / mês</small></p>
        <ul><li>Até {plan.employees} funcionário(s)</li><li>{number(plan.monthlyEmails)} e-mails por mês</li><li>Até {plan.dailyEmails} e-mails por dia</li></ul>
        <button type="button" className="button secondary" disabled={busy || !status.billingEnabled || status.setupPending || !!other || capacity || (current && subscription.status !== 'pending')}
          onClick={() => choose(plan)}>{current ? subscription.status === 'pending' ? 'Concluir contratação' : 'Assinatura atual' : 'Escolher plano'}</button>
        {capacity && <small>Desative os funcionários excedentes para escolher este plano.</small>}
      </article>;
    })}</div>
    {!status.billingEnabled && <p>A contratação será habilitada após a validação dos pagamentos. Nenhuma mensalidade será cobrada agora.</p>}
    {status.setupPending && <p role="status">Uma contratação aguarda conferência. Atualize a situação antes de tentar novamente.</p>}
    {(subscription || status.setupPending) && <div className="plan-manage"><button className="button secondary" type="button" disabled={busy} onClick={refresh}>Atualizar situação</button>
      <a href="https://www.mercadopago.com.br/subscriptions" target="_blank" rel="noreferrer">Gerenciar ou cancelar no Mercado Pago</a>
      <p>Para trocar de plano, cancele a assinatura atual e aguarde o fim do período pago. Seus dados serão mantidos.</p></div>}
  </section>;
}
