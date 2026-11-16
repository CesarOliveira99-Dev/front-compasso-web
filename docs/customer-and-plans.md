# Planos e experiência do cliente

O catálogo de planos, o teste de 14 dias, a franquia de e-mails, a ocupação de funcionários e os direitos de uso são calculados pela API. Publicar a API compatível antes do frontend. O painel mostra Essencial R$ 59,90, Profissional R$ 79,90 e Equipe R$ 99,90; o dono confirma a recorrência antes de sair para o Mercado Pago. Cadastro por senha e Google explica o teste; clientes não contratam assinatura. Uma assinatura autorizada ainda pode estar aguardando a primeira fatura paga.

Meus pedidos mostra apenas o status de pagamento no cabeçalho do cliente, com rótulo explícito. A operação continua exibindo o status do pedido para o administrador. O título do pedido e o botão Ver detalhes abrem um diálogo com itens, horário dos serviços, total, desconto, forma/status do pagamento e endereço quando aplicável. Cancelamento aparece nos detalhes. Não é usado um status de serviço como status financeiro.

Meus agendamentos mantém a tabela no desktop e usa cartões com rótulos no celular. Os filtros se empilham para não estender a página; botões existentes de reagendamento/cancelamento e os dois estados de atendimento/pagamento são preservados.

## Cadastro e comparação de planos

Nome pessoal, telefone, e-mail, nome do negócio, senha e confirmação exibem erros junto ao campo durante a digitação e ao sair do campo. A confirmação é reavaliada se a senha original mudar. Nome pessoal aceita letras Unicode, acentos, espaços, pontos, apóstrofos e hífens, mas nenhum caractere numérico; até 100 caracteres e pelo menos duas letras. O nome do negócio continua aceitando números, como Studio 54.

Telefone brasileiro: DDD + 8 ou 9 dígitos, opcionalmente com código 55; até 20 caracteres de apresentação e até 13 dígitos. A API valida antes de remover a formatação e armazena apenas os dígitos. Cadastro por senha, novo vínculo por convite, conclusão Google, perfil e configuração do responsável usam as regras correspondentes. Em novo cadastro Google, o nome de exibição pode ser corrigido; e-mail e identificador Google continuam sendo obtidos exclusivamente da identidade verificada. Não há migração forçada de cadastros antigos nem mudança nas regras de autenticação de contas existentes.

Seu plano Compasso aparece antes da preparação da loja e do formulário de configurações. Os cards são selecionáveis por clique ou teclado, com radio buttons e resumo de comparação de preço, colaboradores e franquias. A seleção não muda o plano, os limites vigentes, o teste ou a cobrança; contratar exige a confirmação existente. A conexão Mercado Pago continua separada, abaixo das configurações.

## Colaboradores extras

O Equipe informa **R$25,00 por colaborador extra**, mensalmente acima dos dez incluídos. A contratação inicial permite escolher extras e mostra o total. Para um Equipe já autorizado e pago, os controles em Equipe, Profissionais e Planos abrem confirmação com base + extras e novo total antes de alterar a recorrência. Onze vagas: R$124,90/mês; doze: R$149,90/mês. Não há cobrança avulsa/rateio; o novo valor se aplica a cobranças ainda não geradas. Desativar um cadastro não cancela uma vaga extra contratada: a redução explícita no painel muda a mensalidade e exige vagas desocupadas. Franquias de e-mail permanecem iguais. Uma alteração incerta orienta Atualizar situação e impede nova contratação de extras até reconciliação.

## Descoberta por cidade

A busca textual continua disponível para qualquer região. O uso de localização identifica a cidade, não calcula distância em quilômetros nem um raio entre lojas. A API aplica cidade e UF; digitar na busca remove esse filtro geográfico. Sem resultados na cidade, há ação para consultar outras regiões.

Para ativar a localização, configurar `GOOGLE_GEOCODING_API_KEY` **somente no servidor do frontend**. É uma chave distinta de `GOOGLE_MAPS_EMBED_KEY`: habilitar/restringir à Geocoding API e definir uma quota de consultas no projeto Google para controlar custo. Sem a chave, o botão não aparece e a busca manual permanece disponível. Nenhum serviço pago foi ativado ou consultado durante a implementação/testes.

O navegador solicita permissão quando o usuário escolhe Usar minha localização. Se já houver permissão concedida, a cidade pode ser identificada ao abrir a descoberta. A escolha Buscar em qualquer lugar é mantida durante a sessão e impede essa aplicação automática. A cidade/UF identificadas também são lembradas apenas na sessão. Uma resposta de localização atrasada não substitui uma busca que o usuário começou a digitar.

O BFF recebe coordenadas via POST, valida origem e números, arredonda para duas casas decimais e consulta o Google com timeout. Retorna apenas cidade/UF brasileira, sem endereço, chave ou coordenadas. Não persiste coordenadas, não usa IP como localização e não registra payloads. Limita consultas a 20/minuto por processo, além da quota configurada no provedor. Não há contador global entre réplicas: a quota do projeto Google é necessária. Negação de permissão, indisponibilidade e regiões sem resultado preservam a busca manual. Confirmar privacidade e identificação do provedor no fluxo público antes de habilitar a chave.

Validação local: testes de unidade, build e navegador em 320, 375, 390, 430, 768 e 1280px. Dados de pedidos, localização e provedores foram simulados, sem cobrança. As páginas temporárias de QA foram removidas da entrega.

Referências: [Geolocalização do navegador](https://developer.mozilla.org/en-US/docs/Web/API/Geolocation/getCurrentPosition), [Geocoding reverso Google](https://developers.google.com/maps/documentation/geocoding/guides-v3/requests-reverse-geocoding).
