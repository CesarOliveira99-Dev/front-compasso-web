# Compasso — Web

Atualização de 07/11/2026 a partir da versão local integrada. Este repositório é independente: código da aplicação na raiz, dependências e lockfile próprios. O outro serviço fica em https://github.com/CesarOliveira99-Dev/backend-core-compasso.

## Executar e validar

Requisitos: Node.js 24 e pnpm 11.25.0.

```sh
pnpm install --frozen-lockfile
pnpm test
pnpm typecheck
pnpm build
pnpm start
```

Para desenvolvimento: `pnpm dev`. Configure BACKEND_URL com o endereço da API, incluindo /v1.

## Render

Crie um Web Service Docker ligado a este repositório. Root Directory vazio; Dockerfile `./Dockerfile`; contexto raiz. Health check `/`; sem disco. Configure BACKEND_URL=https://ENDERECO-DA-API/v1. O launcher respeita PORT e escuta em 0.0.0.0.

Use criação manual de serviço ou Blueprint `render.yaml`, nunca ambos para o mesmo serviço. Starter é uma referência inicial para piloto, sujeito a testes de memória/carga. Não cadastre chaves do Resend, Google Client Secret ou credenciais Mercado Pago neste serviço.

## Integrações e limites

Regras de tenant, permissões, valores e pagamentos pertencem à API. Os testes de limite de corpo e concorrência do BFF foram trazidos para este repositório, sem duplicar o código de produção no backend.

As contas e arquivos da demonstração local não acompanham este repositório. Publicação, Docker, e-mails reais, Google real, pagamentos reais e carga precisam ser homologados. A documentação antiga preservada em docs é histórica e pode descrever a primeira versão.
