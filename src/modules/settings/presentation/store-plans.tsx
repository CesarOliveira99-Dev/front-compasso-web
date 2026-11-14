'use client';
import { money } from '@/modules/shared/domain/format';
import { api } from '@/modules/shared/infrastructure/api';
import { useId, useState } from 'react';
import type { SectionProps } from '@/modules/shared/presentation/ui';

interface Plan { id: string; name: string; priceCents: number; employees: number; monthlyEmails: number; dailyEmails: number; extraEmployeePriceCents?: number }
export interface PlanStatus {
  billingEnabled: boolean; plans: Plan[]; employeesUsed: number; setupPending: boolean;
  extrasPending?: boolean;
  entitlement: { mode: 'trial' | 'active' | 'expired' | 'pilot'; plan: Plan | null; expiresAt: number | null };
  subscription: { status: string; planId: string; priceCents?: number; extraEmployees?: number; paidThrough?: number } | null;
  emailUsage: { daily: { used: number; limit: number | null }; monthly: { used: number; limit: number | null } };
}
const number = (value: number) => value.toLocaleString('pt-BR');
const date = (value: number) => new Date(value).toLocaleDateString('pt-BR', { timeZone: 'America/Sao_Paulo' });
export function StorePlans({ status, props, busy, refresh }: { status: PlanStatus; props: SectionProps; busy: boolean; refresh: () => void }) {
  const { entitlement, subscription } = status;
  const group = useId();
  const [selectedPlan, setSelectedPlan] = useState(subscription?.planId || entitlement.plan?.id || 'essencial');
  const [extras, setExtras] = useState(Math.min(90, Math.max(0, status.employeesUsed - 10)));
  function choose(plan: Plan) {
    const extraEmployees = plan.id === 'equipe' ? (subscription?.planId === 'equipe' ? subscription.extraEmployees || 0 : extras) : 0;
    const total = plan.priceCents + extraEmployees * (plan.extraEmployeePriceCents || 0);
    props.openDialog({ title: `Contratar ${plan.name}`, submitLabel: 'Continuar no Mercado Pago',
      content: <><p>{money(total)} por mês, com renovação automática após sua autorização. Cancele pelo Mercado Pago.</p>
        {plan.id === 'equipe' && <p>Base de {money(plan.priceCents)} + {extraEmployees} colaborador(es) extra(s) a R$25,00 por mês cada.</p>}
        <p>{plan.employees + extraEmployees} funcionário(s), {number(plan.monthlyEmails)} e-mails por mês e até {plan.dailyEmails} por dia.</p>
        <p>A contratação inicia uma assinatura mensal paga. Clientes não pagam assinatura.</p></>,
      onSubmit: async () => { const result = await api<{ url: string }>('payments/subscribe', 'POST', { planId: plan.id, extraEmployees }); window.location.assign(result.url); },
    });
  }
  function cancelPending() {
    props.openDialog({ title: 'Cancelar tentativa pendente', submitLabel: 'Cancelar tentativa no Mercado Pago',
      content: <p>Vamos confirmar o estado no Mercado Pago e cancelar somente se a contratação continuar pendente e sem período pago.</p>,
      onSubmit: async () => { await api('payments/subscription/cancel-pending', 'POST', {}); window.location.reload(); },
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
    <p className="form-note">Selecione um card para comparar. A seleção não contrata nem altera sua assinatura.</p>
    <div className="store-plan-grid">{status.plans.map(plan => {
      const current = subscription?.planId === plan.id && !['cancelled', 'canceled'].includes(subscription.status);
      const other = subscription && !['cancelled', 'canceled'].includes(subscription.status) && !current;
      const selectedExtras = plan.id === 'equipe' ? (current ? subscription.extraEmployees || 0 : extras) : 0;
      const capacity = status.employeesUsed > plan.employees + selectedExtras;
      return <article className={`store-plan ${selectedPlan === plan.id ? 'selected' : ''}`} key={plan.id} onClick={() => setSelectedPlan(plan.id)}>
        <label className="plan-card-choice"><input type="radio" name={`${group}-plan`} value={plan.id} checked={selectedPlan === plan.id} onChange={() => setSelectedPlan(plan.id)} aria-label={`Comparar plano ${plan.name}`} /><strong>{plan.name}</strong></label>
        {current && <small>Seu plano contratado</small>}
        <p className="plan-price">{money(plan.priceCents)}<small> / mês</small></p>
        <ul><li>{plan.id === 'equipe' ? '10 colaboradores incluídos' : `Até ${plan.employees} funcionário(s)`}</li><li>{number(plan.monthlyEmails)} e-mails por mês</li><li>Até {plan.dailyEmails} e-mails por dia</li></ul>
        {plan.extraEmployeePriceCents && <><strong>R$25,00 por colaborador extra</strong><small>A partir do 11º colaborador, por mês. Até 90 extras no autosserviço. As franquias de e-mail permanecem iguais.</small>
          {!current && <label className="field"><span>Colaboradores extras</span><input aria-label="Colaboradores extras no plano Equipe" type="number" min={Math.max(0, status.employeesUsed - 10)} max={90} step={1} value={extras} onChange={event => setExtras(Math.min(90, Math.max(0, Math.trunc(Number(event.target.value) || 0))))} /><small>Total: {money(plan.priceCents + extras * plan.extraEmployeePriceCents)} / mês • até {10 + extras} colaboradores</small></label>}
        </>}
        <button type="button" className="button secondary" disabled={busy || !status.billingEnabled || entitlement.mode === 'trial' || status.setupPending || !!other || capacity || (current && subscription.status !== 'pending')}
          onClick={() => choose(plan)}>{current ? subscription.status === 'pending' ? 'Concluir contratação' : 'Assinatura atual' : 'Escolher plano'}</button>
        {capacity && <small>Desative os funcionários excedentes para escolher este plano.</small>}
      </article>;
    })}</div>
    {status.plans.filter(plan => plan.id === selectedPlan).map(plan => {
      const extra = plan.id === 'equipe' ? subscription?.planId === 'equipe' ? subscription.extraEmployees || 0 : extras : 0;
      return <div className="plan-comparison" role="status" aria-live="polite" key={plan.id}><strong>Comparando: {plan.name} — {money(plan.priceCents + extra * (plan.extraEmployeePriceCents || 0))} / mês</strong><p>Até {plan.employees + extra} colaboradores • {number(plan.monthlyEmails)} e-mails por mês • até {plan.dailyEmails} por dia.</p><small>Os limites de uso acima continuam mostrando seu período atual. Para contratar o plano escolhido, confirme no botão do card.</small></div>;
    })}
    {subscription?.planId === 'equipe' && <ExtraEmployeeControls status={status} props={props} />}
    {!status.billingEnabled && <p>A contratação será habilitada após a validação dos pagamentos. Nenhuma mensalidade será cobrada agora.</p>}
    {entitlement.mode === 'trial' && <p>Compare os planos agora. A contratação ficará disponível quando o teste grátis terminar, sem cobrança durante o teste.</p>}
    {status.setupPending && <p role="status">Uma contratação aguarda conferência. Atualize a situação antes de tentar novamente.</p>}
    {(subscription || status.setupPending) && <div className="plan-manage"><button className="button secondary" type="button" disabled={busy} onClick={refresh}>Atualizar situação</button>
      {subscription?.status === 'pending' && !subscription.paidThrough && <button className="button secondary" type="button" disabled={busy} onClick={cancelPending}>Cancelar tentativa pendente</button>}
      <a href="https://www.mercadopago.com.br/subscriptions" target="_blank" rel="noreferrer">Gerenciar ou cancelar no Mercado Pago</a>
      <p>Para trocar de plano, cancele a assinatura atual e aguarde o fim do período pago. Seus dados serão mantidos.</p></div>}
  </section>;
}

export function ExtraEmployeeControls({ status, props }: { status: PlanStatus; props: SectionProps }) {
  const subscription = status.subscription;
  const [busy, setBusy] = useState(false);
  if (subscription?.planId !== 'equipe' || status.entitlement.mode !== 'active' || subscription.status !== 'authorized') return null;
  const current = subscription.extraEmployees || 0;
  const minimum = Math.max(0, status.employeesUsed - 10);
  const base = status.plans.find(plan => plan.id === 'equipe');
  if (!base?.extraEmployeePriceCents) return null;
  function confirm(extraEmployees: number) {
    const total = base!.priceCents + extraEmployees * base!.extraEmployeePriceCents!;
    props.openDialog({ title: extraEmployees > current ? 'Adicionar colaborador extra' : 'Reduzir colaboradores extras', submitLabel: `Confirmar ${money(total)} / mês`,
      content: <><p>Seu Equipe ficará com {10 + extraEmployees} vagas: 10 incluídas e {extraEmployees} extra(s).</p><p><strong>{money(base!.priceCents)} + {extraEmployees} × R$25,00 = {money(total)} por mês.</strong></p>
        <p>O novo valor será aplicado à recorrência no Mercado Pago, às cobranças ainda não geradas. Não há cobrança avulsa nem rateio agora.</p>
        <p>Vagas extras permanecem contratadas até você reduzir a quantidade. Desativar um cadastro libera a vaga para outra pessoa, mas não cancela a vaga contratada. As franquias de e-mail continuam iguais.</p></>,
      onSubmit: async () => { setBusy(true); try { await props.mutate('payments/subscription/extras', 'POST', { extraEmployees, expectedPriceCents: total }, 'Mensalidade e vagas atualizadas.'); } finally { setBusy(false); } },
    });
  }
  return <section className="plan-access"><h3>Colaboradores extras</h3><p>R$25,00 por colaborador extra, por mês.</p><p>{current} extra(s) contratado(s) • até {10 + current} colaboradores • <strong>{money(subscription.priceCents || base.priceCents)} / mês</strong></p>
    {status.extrasPending ? <p role="status">Uma alteração aguarda conferência. Use Atualizar situação nos planos antes de incluir colaboradores.</p> : <div className="plan-manage">
      <button type="button" className="button secondary" disabled={busy || !status.billingEnabled || current >= 90} onClick={() => confirm(current + 1)}>Adicionar uma vaga extra</button>
      <button type="button" className="button secondary" disabled={busy || !status.billingEnabled || current <= minimum} onClick={() => confirm(current - 1)}>Remover uma vaga extra</button>
      <small>Antes de reduzir abaixo das vagas ocupadas, desative os colaboradores excedentes. O dono não ocupa uma vaga.</small>
    </div>}
  </section>;
}
