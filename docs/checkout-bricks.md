# Pagamento em janela central

Base: `atualizacao-render-2026-11-07`. Depende do backend da branch `checkout-bricks-2026-11-10`; publicar a API primeiro em um ambiente de validação.

As opções na sacola e no agendamento passam a dizer **Crédito ou Pix**. Em Meus pedidos, **Pagar agora** abre a janela Compasso com total, itens e Payment Brick do SDK React oficial. Só cartão de crédito e Pix são habilitados; não há botão obrigatório de login na carteira Mercado Pago. O Status Screen Brick apresenta o resultado e o QR Code/instruções do Pix. O estado confirmado é validado pelo backend, não por um evento do navegador.

O SDK carrega somente ao abrir a janela. Os callbacks são estáveis para não desmontar o formulário a cada atualização de estado. A janela pode ser fechada e reaberta; a tentativa fica no backend. A submissão bloqueia o fechamento enquanto a requisição está em andamento. Polling é serial e limitado a 20 consultas; depois é possível consultar manualmente.

Sem variável nova obrigatória no frontend. A chave pública é entregue pelo backend por pedido/loja. Não adicionar Client Secret, Access Token ou segredo de webhook a variáveis `NEXT_PUBLIC_*`. Conexões antigas sem Public Key precisam ser autorizadas novamente; detalhes e plano de homologação em `docs/checkout-bricks.md` do backend.

Pedidos com Checkout Pro já iniciado continuam usando o link existente para evitar cobrança concorrente. A mudança não transfere assinaturas nem adicionais para Bricks.

Verificações: `pnpm typecheck`, `pnpm test` (10 testes) e `pnpm build`; teste de navegador em desktop e celular com provedor simulado, incluindo montagem única e recuperação após perda de resposta. Homologação do formulário real, QR Code e cobranças é pendente.
