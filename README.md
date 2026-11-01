# Compasso Web

Frontend e BFF do Compasso, construídos com Next.js, React e TypeScript. Possui áreas de administrador e cliente e se conecta ao [Compasso Backend](https://github.com/CesarOliveira99-Dev/backend-core-compasso).

## Executar

Requisitos: Node.js 24 e pnpm 11.

```sh
pnpm install --frozen-lockfile
pnpm dev
```

Abra `http://127.0.0.1:3000`. Inicie o backend separadamente na porta 4000. O destino padrão do BFF é `http://127.0.0.1:4000/v1`; para alterá-lo, configure `BACKEND_URL` em `.env.local`, usando `.env.example` como referência. Essa variável é exclusiva do servidor.

Quando o backend for iniciado com `pnpm demo`, a tela de acesso em desenvolvimento permite entrar nas contas fictícias de administrador ou cliente. Essas opções não são exibidas no build de produção. Os dados e as credenciais de demonstração estão documentados no repositório do backend.

## Verificação e build

```sh
pnpm typecheck
pnpm build
pnpm start
```

Na primeira instalação, o Next.js gera `next-env.d.ts` ao executar `pnpm dev` ou `pnpm build`. Esse arquivo e os diretórios de build não são versionados. O build de produção usa `.next-production`, separado do desenvolvimento.

## Organização

```text
src/
  app/                          entrada, layout e rotas HTTP do BFF
  modules/
    <feature>/presentation/     telas de cada funcionalidade
    shared/domain/              contratos de leitura e formatação
    shared/infrastructure/      cliente HTTP
    shared/presentation/        componentes comuns
    bff/infrastructure/         comunicação servidor a servidor
```

O BFF armazena a sessão em cookie HttpOnly, valida a origem de escritas e encaminha somente rotas previstas ao backend. Regras de negócio, autorização, disponibilidade e preços são calculados pela API, e não pelo navegador. As telas secundárias são carregadas sob demanda.

## Funcionalidades

- Visão geral, resumo contextual do dia, indicadores e agenda.
- Clientes, cadastro, catálogo, triagem e avaliações.
- Carrinho com cotação no backend, pedidos e pagamento no dia.
- Carteira, campanhas/cupons, fidelidade, relatórios e exportação CSV.
- Notificações internas, mensagens e atalho de conversa manual no WhatsApp.
- Perfil, múltiplos endereços e escolha de endereço de entrega.
- Atalhos de busca em lojas externas, sem consulta interna de ofertas ou estoque.

Pagamento online e WhatsApp Business permanecem desativados. A interface depende do backend para funcionar; não é uma aplicação estática nem utiliza um banco próprio. A implantação de produção das duas aplicações deve ser configurada separadamente.
