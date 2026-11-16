# Compasso Solo e ferramentas compartilhadas

Na entrada, **Quero minha agenda individual** abre o cadastro Solo sem campos de loja/endereço. Também disponível no onboarding Google. A API decide modalidade e permissões; ocultar itens no menu não substitui autorização.

A modalidade Solo abre uma navegação própria: Minha agenda, Serviços, Clientes/fichas/análises, Finanças, Horários e Meu Solo. A cobrança explicita R$15/mês e R$110/ano, renovação e início após o teste. Não oferece interação pública com clientes, equipe, envio de mensagens, mídia ou checkout de serviços. Agendamentos e recebimentos são lançamentos manuais.

As ferramentas de clientes/fichas, análises/CSV, categorias/cores e temas são compartilhadas com os planos de lojas. Administradores veem a loja; funcionários veem os próprios atendimentos/clientes. As fichas têm notas, preferências, etiquetas, campos personalizados, histórico e fidelidade interna. Revisão do documento evita sobrescrever alterações simultâneas; chave de resgate permanece estável após falha de transporte.

Temas claro, escuro e papel e cor de destaque são persistidos no servidor por usuário. Administrador pode definir o padrão da loja; preferências individuais prevalecem. A cor de categoria aparece na borda do atendimento e não substitui o status. Aparência é removida ao sair do workspace, preservando a página de entrada.

O BFF libera somente os caminhos declarados em `workspace-route.ts`. Tokens seguem em cookie HttpOnly; exportação CSV mantém autenticação e cabeçalhos de download/no-store. O backend continua responsável por preço, período de cobrança, papel e isolamento por tenant.

Verificação: suíte de frontend, TypeScript e build de produção; navegador com API real isolada para cadastro, reserva, fichas/edit/reedit, fidelidade, cores/tema persistente, CSV e viewports 320/390 px. Homologação de cobrança e renovação com Mercado Pago real permanece separada. Não houve deploy nesta implementação.

## Ampliação das análises

Seletores Semanal/Mensal/Anual usam janelas móveis explícitas de 7/30/365 dias. Barras comparativas mostram clientes únicos e atendimentos concluídos; três gráficos de rosca mostram primeira visita/retorno, categorias e serviços. Legendas interativas mostram contagem/percentual e agrupam distribuições extensas em Outros, preservando o total. Números da evolução também estão disponíveis em tabela acessível.

O card monetário ocupa a largura da grade, com tamanho de fonte adaptável e quebra segura para valores grandes. Responsividade foi conferida em 320 e 390 px, com rolagem confinada ao gráfico anual quando necessária. Nenhuma biblioteca gráfica ou serviço externo foi adicionado.

## Navegação do Solo

O Solo usa telas independentes no menu principal: Clientes (fichas/histórico/fidelidade), Análises (indicadores/gráficos/relatórios) e Cadastros (serviços, categorias/tema e horários). A lista de clientes foi extraída em um componente reutilizável, preservando o workspace de lojas e funcionários. O atalho de um atendimento para clientes direciona à nova tela. Nenhuma permissão de API foi alterada.

Conferido no navegador: isolamento das três telas, cadastro de contato, abertura de ficha, seções de Cadastros e atalho da agenda para Clientes. Testes do frontend e build passaram.

## Menu mobile e saudação

No mobile (até 800 px), o menu principal abre em um drawer modal da esquerda para a direita. Usa dialog nativo, bloqueia rolagem de fundo, mantém Tab/Shift+Tab nos controles do menu, restaura foco ao fechar e permite fechar pelo botão, Esc, fundo ou seleção de página. Ao ampliar para desktop, fecha o drawer e mantém a barra lateral. Respeita preferência de movimento reduzido.

A saudação reutiliza Greeting, passando America/Sao_Paulo no Solo; atualiza a cada minuto e ao retornar à janela. Outros usos preservam seu comportamento de horário local. O teste cobre as viradas manhã/tarde/noite de Brasília; a rodada no navegador usou dispositivo configurado para Tóquio para conferir independência do fuso do aparelho.

## Trocar de espaço

O proprietário encontra Trocar de espaço na empresa e no menu/drawer do Solo. O seletor mostra Minha empresa e Minha agenda Solo, destaca o espaço atual e oferece criar a modalidade ausente. A criação da empresa pede nome e endereço; a do Solo pede apenas o nome da agenda. O aviso explicita assinatura/teste próprios e ausência de contratação automática.

O BFF mantém tokens em cookie HttpOnly nas duas novas ações. Após criar/trocar, a página recarrega para descartar dados e formulários do espaço anterior. Requisições, uploads e exportações levam o tenant renderizado em X-Compasso-Workspace. O vínculo só é atualizado após bootstrap (não na resposta da troca), permitindo ao servidor rejeitar uma aba que ainda tenta operar com a tela antiga.

QA com navegador e API reais isolados: empresa a partir de Solo e Solo a partir de empresa, alternância nos dois sentidos, login único com escolha, abertura do seletor pelo drawer, token ausente no JSON público e rejeição 409 pelo BFF para uma aba antiga. Sem cobranças ou mudanças de produção.
