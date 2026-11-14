import { Brand } from "@/modules/shared/presentation/brand";
import {
  ArrowUpRight,
  CalendarDays,
  Users,
  ChartNoAxesCombined,
  HeartHandshake,
  Check,
  LockKeyhole,
  ArrowRight,
} from "lucide-react";

const plans = [
  {
    name: "Essencial",
    price: "59,90",
    people: "Até 1 colaborador",
    emails: "1.000 e-mails por mês",
    daily: "Até 100 por dia",
  },
  {
    name: "Profissional",
    price: "79,90",
    people: "Até 5 colaboradores",
    emails: "2.500 e-mails por mês",
    daily: "Até 200 por dia",
  },
  {
    name: "Equipe",
    price: "99,90",
    people: "10 colaboradores incluídos",
    emails: "5.000 e-mails por mês",
    daily: "Até 400 por dia",
  },
];
const faq = [
  [
    "O cliente paga para usar?",
    "Não. A assinatura é de quem administra a agenda ou a loja. O pagamento de um serviço é separado da assinatura do Compasso.",
  ],
  [
    "Qual a diferença entre Solo e os planos para lojas?",
    "O Solo é uma agenda privada para uma pessoa: você cadastra seus contatos e organiza os atendimentos. Nas lojas, seus clientes podem descobrir o estabelecimento, consultar os horários publicados e agendar; você também pode organizar a equipe.",
  ],
  [
    "Como funcionam os 14 dias grátis?",
    "Novos responsáveis podem experimentar por 14 dias, sem cartão obrigatório. Sem contratação, o teste termina sem gerar cobrança automática. Nos planos de lojas, o teste inclui os recursos do Equipe.",
  ],
  [
    "Posso ter uma loja e uma agenda Solo?",
    "Sim. Você pode administrar os dois espaços com o mesmo login. Cada espaço tem seus próprios dados e sua assinatura; a agenda Solo continua privada.",
  ],
  [
    "O WhatsApp envia mensagens sozinho?",
    "Não. Você escolhe um modelo de lembrete ou escreve uma mensagem avulsa, confere a prévia e abre a conversa. O envio é confirmado por você no WhatsApp.",
  ],
  [
    "Preciso instalar um aplicativo?",
    "Você acessa o Compasso pelo navegador, no computador ou no celular.",
  ],
  [
    "Como funciona o colaborador extra?",
    "O plano Equipe inclui 10 colaboradores. Cada vaga extra contratada custa R$25 por mês. Os limites de e-mails permanecem os mesmos; o dono não ocupa uma vaga.",
  ],
];
export function LandingPage() {
  return (
    <div className="compasso-marketing">
      <a className="marketing-skip" href="#conteudo">
        Ir para o conteúdo
      </a>
      <header className="marketing-header">
        <a className="marketing-brand" href="/" aria-label="Compasso — início">
          <Brand />
        </a>
        <nav aria-label="Navegação da apresentação">
          <a href="#como-funciona">Como funciona</a>
          <a href="#para-voce">Para você</a>
          <a href="#planos">Planos</a>
          <a href="#duvidas">Dúvidas</a>
        </nav>
        <a className="marketing-button marketing-button-small" href="/entrar">
          Entrar <ArrowUpRight size={15} />
        </a>
      </header>
      <main id="conteudo">
        <section className="marketing-hero">
          <div className="marketing-hero-copy">
            <p className="marketing-kicker">NO SEU TEMPO. NO SEU COMPASSO.</p>
            <h1>
              Seu dia organizado.
              <br />
              <em>Seus clientes por perto.</em>
            </h1>
            <p className="marketing-lead">
              Uma agenda só sua ou um espaço para toda a loja. Organize os
              atendimentos, conheça seus clientes e acompanhe quem está no
              momento de voltar.
            </p>
            <div className="marketing-actions">
              <a className="marketing-button" href="/cadastro?modalidade=solo">
                Quero minha agenda <ArrowRight size={17} />
              </a>
              <a
                className="marketing-button marketing-button-outline"
                href="/cadastro?modalidade=loja"
              >
                Quero organizar minha loja
              </a>
            </div>
            <p className="marketing-reassurance">
              <Check size={15} />
              14 dias grátis · sem cartão obrigatório
            </p>
            <a className="marketing-customer-link" href="/descobrir">
              Só quer agendar um serviço? Encontre um estabelecimento{" "}
              <ArrowUpRight size={14} />
            </a>
          </div>
          <figure className="marketing-product">
            <div className="marketing-product-label">
              <span />
              <span>Um olhar para sua agenda</span>
              <CalendarDays size={17} />
            </div>
            <img
              src="/images/compasso-agenda.png"
              alt="Calendário real do Compasso, com serviços e horários organizados no mês. Dados fictícios de demonstração."
              width={1144}
              height={1078}
            />
            <figcaption>
              Interface real do Compasso, com dados de demonstração.
            </figcaption>
          </figure>
        </section>
        <section className="marketing-section" id="para-voce">
          <div className="marketing-section-heading">
            <p className="marketing-kicker">DOIS JEITOS DE SEGUIR</p>
            <h2>
              Um espaço que combina
              <br />
              com a sua rotina.
            </h2>
          </div>
          <div className="marketing-audiences">
            <article>
              <LockKeyhole size={26} />
              <h3>Só você e sua agenda.</h3>
              <p>
                Para quem trabalha individualmente e prefere manter a
                organização nas próprias mãos. Seus horários e fichas ficam em
                um espaço privado.
              </p>
              <ul>
                <li>
                  <Check size={15} />
                  Agenda, recorrências e bloqueios pessoais
                </li>
                <li>
                  <Check size={15} />
                  Contatos, fichas e histórico de atendimento
                </li>
                <li>
                  <Check size={15} />
                  Análises, retorno previsto e WhatsApp manual
                </li>
              </ul>
              <a href="#plano-solo">
                Conhecer o Solo <ArrowUpRight size={16} />
              </a>
            </article>
            <article>
              <Users size={26} />
              <h3>Sua loja, em sintonia.</h3>
              <p>
                Para negócios que atendem clientes e organizam uma equipe.
                Publique seu espaço, receba agendamentos e acompanhe cada etapa.
              </p>
              <ul>
                <li>
                  <Check size={15} />
                  Página da loja e agendamento pelos clientes
                </li>
                <li>
                  <Check size={15} />
                  Equipe com agendas e permissões próprias
                </li>
                <li>
                  <Check size={15} />
                  Pedidos, pagamentos e gestão dos atendimentos
                </li>
              </ul>
              <a href="#planos-loja">
                Conhecer os planos para lojas <ArrowUpRight size={16} />
              </a>
            </article>
          </div>
        </section>
        <section className="marketing-section marketing-how" id="como-funciona">
          <div className="marketing-section-heading">
            <p className="marketing-kicker">UMA ESCOLHA DE CADA VEZ</p>
            <h2>
              Do primeiro horário
              <br />
              ao próximo retorno.
            </h2>
            <p>
              O Compasso acompanha a rotina antes, durante e depois do
              atendimento.
            </p>
          </div>
          <div className="marketing-steps">
            {[
              [
                "01",
                "Prepare seu espaço",
                "Escolha Solo ou loja, cadastre seus serviços e organize a agenda do seu jeito.",
              ],
              [
                "02",
                "Cuide de cada encontro",
                "Abra a ficha pelo atendimento, consulte o histórico e ajuste a duração quando precisar.",
              ],
              [
                "03",
                "Mantenha o vínculo",
                "Defina quando o cliente deve voltar e prepare um lembrete para enviar pelo WhatsApp.",
              ],
            ].map(([n, title, description]) => (
              <article key={n}>
                <span>{n}</span>
                <h3>{title}</h3>
                <p>{description}</p>
              </article>
            ))}
          </div>
        </section>
        <section className="marketing-section">
          <div className="marketing-section-heading">
            <p className="marketing-kicker">CLAREZA PARA CUIDAR MELHOR</p>
            <h2>
              As informações certas,
              <br />
              na hora de agir.
            </h2>
          </div>
          <div className="marketing-features">
            {[
              {
                icon: CalendarDays,
                title: "Uma agenda que acompanha você",
                text: "Veja o dia, a semana ou o mês. Ajuste a duração de cada atendimento e organize recorrências sem sobrepor reservas.",
              },
              {
                icon: HeartHandshake,
                title: "Uma ficha com contexto",
                text: "Histórico, preferências e observações ajudam a preparar o próximo atendimento e manter o cuidado pessoal.",
              },
              {
                icon: ChartNoAxesCombined,
                title: "Números com próximo passo",
                text: "Acompanhe atendimentos, serviços e retorno dos clientes. Separe produção de serviços de recebimentos confirmados.",
              },
              {
                icon: Users,
                title: "Uma oportunidade de voltar",
                text: "Consulte retornos próximos e em atraso. Quando surgir uma vaga, consulte a lista de espera e ofereça o horário.",
              },
            ].map(({ icon: Icon, title, text }) => (
              <article key={title}>
                <Icon size={24} />
                <h3>{title}</h3>
                <p>{text}</p>
              </article>
            ))}
          </div>
        </section>
        <section className="marketing-section marketing-pricing" id="planos">
          <div className="marketing-section-heading">
            <p className="marketing-kicker">ESCOLHA SEU COMPASSO</p>
            <h2>
              Comece com 14 dias
              <br />
              para experimentar.
            </h2>
            <p>
              Clientes não pagam assinatura. Você escolhe o espaço de trabalho
              que faz sentido para sua rotina.
            </p>
          </div>
          <div className="marketing-solo-plan" id="plano-solo">
            <div>
              <span className="marketing-plan-tag">AGENDA INDIVIDUAL</span>
              <h3>Compasso Solo</h3>
              <p>
                Privada, completa e só sua. Sem página pública, equipe ou
                agendamento pelos clientes.
              </p>
            </div>
            <div>
              <span>Mensal</span>
              <strong>
                R$15<small>/mês</small>
              </strong>
              <p>Para experimentar a rotina mês a mês.</p>
            </div>
            <div>
              <span>Anual</span>
              <strong>
                R$110<small>/ano</small>
              </strong>
              <p>Uma assinatura para organizar o ano inteiro.</p>
            </div>
            <a className="marketing-button" href="/cadastro?modalidade=solo">
              Testar o Solo <ArrowUpRight size={16} />
            </a>
          </div>
          <div
            className="marketing-section-heading marketing-store-plan-heading"
            id="planos-loja"
          >
            <span className="marketing-plan-tag">PARA LOJAS E EQUIPES</span>
            <h3>Seu negócio, com espaço para crescer.</h3>
            <p>O proprietário não ocupa uma vaga de colaborador.</p>
          </div>
          <div className="marketing-plan-grid">
            {plans.map((plan) => (
              <article key={plan.name}>
                <h3>{plan.name}</h3>
                <p className="marketing-plan-price">
                  R$ {plan.price}
                  <small>/mês</small>
                </p>
                <ul>
                  <li>
                    <Check size={15} />
                    {plan.people}
                  </li>
                  <li>
                    <Check size={15} />
                    {plan.emails}
                  </li>
                  <li>
                    <Check size={15} />
                    {plan.daily}
                  </li>
                  <li>
                    <Check size={15} />
                    Agenda, clientes e análises
                  </li>
                </ul>
                <p className="marketing-plan-extra">
                  {plan.name === "Equipe"
                    ? "R$25,00 por colaborador extra, por mês."
                    : "Uma rotina organizada para cuidar da sua loja."}
                </p>
                <a
                  className="marketing-button marketing-button-outline"
                  href="/cadastro?modalidade=loja"
                >
                  Experimentar o Compasso <ArrowUpRight size={15} />
                </a>
              </article>
            ))}
          </div>
          <p className="marketing-pricing-note">
            O teste não gera cobrança automática. A contratação é confirmada
            separadamente nas configurações. As franquias de e-mail são dos
            planos de lojas; mensagens manuais pelo WhatsApp não são envios
            automáticos.
          </p>
        </section>
        <section className="marketing-section marketing-faq" id="duvidas">
          <div className="marketing-section-heading">
            <p className="marketing-kicker">ANTES DE COMEÇAR</p>
            <h2>Cada coisa no seu lugar.</h2>
          </div>
          <div>
            {faq.map(([q, a]) => (
              <details key={q}>
                <summary>
                  {q}
                  <span aria-hidden="true">+</span>
                </summary>
                <p>{a}</p>
              </details>
            ))}
          </div>
        </section>
        <section className="marketing-final">
          <p className="marketing-kicker">SEU PRÓXIMO PASSO</p>
          <h2>
            Mais espaço para o seu trabalho.
            <br />
            Mais atenção para quem chega.
          </h2>
          <div className="marketing-actions">
            <a className="marketing-button" href="/cadastro?modalidade=solo">
              Começar com o Solo <ArrowRight size={17} />
            </a>
            <a
              className="marketing-button marketing-button-outline"
              href="/cadastro?modalidade=loja"
            >
              Começar com minha loja
            </a>
          </div>
          <p>14 dias grátis para novos responsáveis. Sem cartão obrigatório.</p>
        </section>
      </main>
      <footer className="marketing-footer">
        <Brand />
        <p>Seu cuidado, no seu compasso.</p>
        <nav aria-label="Links do rodapé">
          <a href="/entrar">Entrar</a>
          <a href="/descobrir">Encontrar estabelecimentos</a>
          <a href="#planos">Planos</a>
          <a href="#duvidas">Dúvidas</a>
        </nav>
        <small>© {new Date().getFullYear()} Compasso</small>
      </footer>
    </div>
  );
}
