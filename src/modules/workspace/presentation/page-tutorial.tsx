'use client';
import { useEffect, useState } from 'react';
import { X, CircleHelp } from 'lucide-react';
import { api } from '@/modules/shared/infrastructure/api';
import type { Bootstrap } from '@/modules/shared/domain/models';

const guides: Record<string, [string, string][]> = {
  calendar: [['Sua agenda', 'Acompanhe os atendimentos do dia e abra um encontro para consultar seus detalhes.'], ['Escolha o período', 'Alterne entre Dia, Semana e Mês e use os seletores para consultar outra data.'], ['Organize seus horários', 'Use as ações disponíveis no topo para organizar sua agenda.']],
  appointments: [['Seus agendamentos', 'Consulte os encontros marcados e filtre por data ou situação.'], ['Detalhes do encontro', 'Abra um agendamento para consultar as ações disponíveis.']],
  registrations: [['Seus cadastros', 'Cadastre os serviços que você oferece.'], ['Deixe com sua cara', 'Use Categorias e tema para organizar a aparência da agenda e Lembretes para preparar suas mensagens.']],
  settings: [['Configurações', 'Ajuste as opções do seu espaço.'], ['Confira antes de salvar', 'Revise os campos alterados e use o botão de salvar da seção.']],
  clients: [['Seus clientes', 'Encontre os clientes cadastrados e consulte suas informações.'], ['Um cuidado mais próximo', 'Abra a ficha de um cliente para acompanhar seu histórico e suas anotações.']],
  customers: [['Seus clientes', 'Busque os clientes cadastrados e consulte seu histórico de atendimentos.']],
  analytics: [['Análises da agenda', 'Consulte os indicadores e ajuste o período para entender sua rotina.']],
  wallet: [['Finanças', 'Acompanhe os valores do período e os registros disponíveis para seu perfil.'], ['Escolha o período', 'Ajuste os filtros antes de comparar os resultados.']],
  billing: [['Seu plano', 'Confira a situação da assinatura e as opções disponíveis para seu espaço.']],
  care: [['Acompanhamento', 'Organize os retornos e consulte os clientes que precisam de atenção.']],
  'care-wait': [['Lista de espera', 'Acompanhe quem aguarda um horário e consulte as opções disponíveis.']],
  catalog: [['Serviços e produtos', 'Explore os itens disponíveis e abra um deles para consultar os detalhes e as ações.']],
  team: [['Sua equipe', 'Consulte os profissionais e organize os acessos disponíveis no seu plano.']],
  tools: [['Ferramentas da agenda', 'Explore as abas para acessar fichas, análises e preferências disponíveis.']],
  triage: [['Em triagem', 'Revise as solicitações e suas informações antes de decidir os próximos passos.']],
  orders: [['Pedidos', 'Consulte os pedidos e abra seus detalhes para acompanhar a situação.']],
  reports: [['Relatórios', 'Selecione o período para consultar os resultados e as opções de exportação.']],
  promotions: [['Promoções', 'Organize as condições promocionais e confira os critérios antes de salvar.']],
  loyalty: [['Fidelidade', 'Consulte as regras e os benefícios disponíveis para os clientes.']],
  feedback: [['Avaliações', 'Acompanhe o que os clientes compartilharam sobre os atendimentos.']],
  procurement: [['Compras', 'Acompanhe os registros de compras do espaço.']],
  discovery: [['Encontre um espaço', 'Explore os estabelecimentos e abra um deles para conhecer seus serviços.']],
  profile: [['Seu perfil', 'Confira seus dados e mantenha suas informações de contato atualizadas.']],
  cart: [['Sua sacola', 'Revise os itens e os valores antes de continuar com o pedido.']],
  home: [['Bem-vindo ao Compasso', 'Acompanhe seus próximos encontros e use o menu para explorar os serviços e sua conta.']],
  horarios: [['Seus horários', 'Defina sua disponibilidade e confira os intervalos antes de salvar.']],
  avisos: [['Notificações', 'Consulte os avisos da sua conta e os próximos passos indicados.']],
};

export function PageTutorial({ page, data }: { page: string; data: Bootstrap }) {
  return <Tutorial key={`${data.user.id}:${data.settings.workspaceMode}:${page}`} page={page} data={data} />;
}
function Tutorial({ page, data }: { page: string; data: Bootstrap }) {
  const normalized = page === 'agenda' || (page === 'home' && data.user.role === 'admin') ? 'calendar' : page;
  const key = `v1:${data.settings.workspaceMode || 'store'}:${data.user.role}:${normalized}`;
  const cards = guides[normalized];
  const [loaded, setLoaded] = useState(false);
  const [done, setDone] = useState<string[]>([]);
  const [step, setStep] = useState(0);
  const [replay, setReplay] = useState(false);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  useEffect(() => {
    let active = true;
    api<string[]>('auth/tutorial').then(value => { if (active) { setDone(value); setLoaded(true); } }).catch(() => {});
    return () => { active = false; };
  }, [data.user.id]);
  useEffect(() => { setStep(0); setReplay(false); setError(''); }, [key]);
  if (!cards || !loaded) return null;
  const visible = replay || !done.includes(key);
  async function finish() {
    setBusy(true);
    try {
      await api('auth/tutorial', 'POST', { page: key });
      setDone(previous => [...previous.filter(value => value !== key), key]);
      setReplay(false);
    } catch { setError('Não foi possível salvar. Tente novamente.'); }
    finally { setBusy(false); }
  }
  if (!visible) return <button type="button" className="text-button tutorial-replay" onClick={() => { setStep(0); setReplay(true); }}><CircleHelp size={15} /> Rever tutorial</button>;
  return <aside className="page-tutorial" aria-label="Tutorial desta página" aria-busy={busy}>
    <button type="button" className="icon-button tutorial-close" aria-label="Dispensar tutorial desta página" disabled={busy} onClick={() => void finish()}><X size={18} /></button>
    <span className="tutorial-counter">Conheça esta página · {step + 1} de {cards.length}</span>
    <div aria-live="polite"><h2>{cards[step][0]}</h2><p>{cards[step][1]}</p></div>
    {error && <p role="alert">{error}</p>}
    <div className="tutorial-actions"><button type="button" className="button secondary small" disabled={step === 0 || busy} onClick={() => setStep(value => value - 1)}>Voltar</button><button type="button" className="button primary small" disabled={busy} onClick={() => step === cards.length - 1 ? void finish() : setStep(value => value + 1)}>{step === cards.length - 1 ? 'Concluir' : 'Avançar'}</button></div>
  </aside>;
}
