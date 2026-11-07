<!-- BEGIN:nextjs-agent-rules -->

## This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

## Repositório independente

Código em src/; testes em test/; scripts em scripts/. Consulte README.md para execução e deploy. Não use caminhos do antigo workspace applications/backend ou applications/frontend. Preserve a fronteira Next.js/BFF → NestJS: permissões, tenant, dinheiro, agenda e confirmação de pagamento pertencem ao backend.

Após implementação, aplicar a skill ub-mode quando disponível e revisar segurança proporcionalmente. Validar testes, tipos e build pertinentes. Não colocar credenciais, banco ou uploads no Git. Integração simulada não comprova homologação externa. SQLite e controles em memória não suportam simplesmente adicionar réplicas.
