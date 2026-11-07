# Estado de confirmação de e-mail — 07/11/2026

Corrigido o painel de confirmação para consultar `emailVerified` retornado no bootstrap. Administrador, cliente e funcionário passam a ver “E-mail confirmado” quando o backend já gravou a confirmação, sem oferecer novo disparo nesse estado. A aplicação recarrega o bootstrap ao recuperar foco/visibilidade, além da atualização periódica existente. O fluxo de confirmação continua exigindo ação explícita no link e não foi alterado no backend.

Regressão reproduzida: o componente anterior mostrava “Confirme seu e-mail” incondicionalmente mesmo com a propriedade verificada. Testes cobrem os estados confirmado e pendente. Validação completa: 76 testes no workspace, tipos e build aprovados; transição de pendente para confirmado conferida no navegador com conta fictícia e envio simulado. Nenhum disparo externo ou alteração em conta de produção foi realizado nesta correção. DNS autenticado não garante entrega na caixa principal; a análise de spam exige os resultados SPF/DKIM/DMARC da mensagem e os registros exatos do provedor.

