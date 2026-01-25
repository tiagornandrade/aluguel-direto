<!-- markdownlint-disable -->

# AluguelDireto — Especificação de Build

## React + Next.js + DDD

Especificação para (re)construir a aplicação AluguelDireto usando **desenvolvimento web moderno** com **React**, **Next.js** e **Domain-Driven Design (DDD)**.

### Raiz da implementação

**A aplicação é somente `aluguel-direto/`** (frontend Next.js + backend). Toda a implementação fica nessa pasta; não há dependência de `index.html`, `js/app.js` ou de carregar `docs/initial-context/` em runtime. Os arquivos em `docs/initial-context/` são **referência de design** (layout, copy): opcionais para quem implementa, não consumidos pela aplicação.

---

## 1. Stack tecnológica

| Camada | Tecnologia | Versão mín. | Motivo |
|--------|------------|-------------|--------|
| Framework | Next.js | 14.x (App Router) | SSR, RSC, Server Actions, roteamento file-based |
| UI | React | 18.x | Concorrência, Suspense, hooks |
| Linguagem | TypeScript | 5.x | Tipagem estática, contratos de domínio |
| Estilos | Tailwind CSS | 3.x | Consistência com o protótipo, design tokens |
| Ícones | Material Symbols Outlined | — | Já usados nos HTMLs de referência |
| Fonte | Public Sans | — | Marca (PRD) |
| HTTP client | fetch nativo / React Query (TanStack Query) | 5.x | Cache, invalidação, SSR |
| Formulários | React Hook Form | 7.x | Performance, validação (Zod) |
| Validação | Zod | 3.x | Schemas reutilizáveis, inferência de tipos |
| Testes E2E | Playwright | 1.x | Multi-browser, estável em Next |
| Testes unitários | Vitest | 1.x | Vite-based, rápido, compatível com React |
| Lint/Format | ESLint + Prettier | — | next/core-web-vitals, consistência |

Opcionais (fase 2):

- **tRPC** ou **React Query + OpenAPI**: se a API for em TypeScript no mesmo repo.
- **next-auth** ou **Clerk/Auth.js**: autenticação e sessão.
- **upload**: presigned URLs (S3/Cloudflare R2) ou API multipart; nunca credenciais em plain text (regra do workspace).

---

## 2. Domain-Driven Design (DDD)

### 2.1 Visão geral

O domínio é decomposto em **Bounded Contexts**. Cada contexto tem seu próprio modelo, linguagem ubíqua e, na implementação, módulos/pastas dedicados. A integração entre contextos é feita por **eventos de domínio** e/ou **IDs de referência** (ex.: `contractId` em Billing).

```
┌─────────────────┐   ┌─────────────────┐   ┌─────────────────┐
│   Identity      │   │   Property      │   │   Contract      │
│   (Auth, User)   │──▶│   (Imóvel)      │──▶│   (Locação)     │
└─────────────────┘   └─────────────────┘   └─────────────────┘
         │                      │                       │
         │              ┌───────┴───────┐              │
         │              ▼               ▼              │
         │     ┌─────────────┐  ┌─────────────┐       │
         └────▶│  Document   │  │  Inspection  │◀──────┘
               │  (Doc Imóvel,│  │  (Vistoria)  │
               │   Inquilino)│  └─────────────┘
               └─────────────┘         │
         │                      ┌──────┴──────┐
         │                      ▼             ▼
         └──────────────▶ ┌─────────────┐ ┌─────────────┐
                          │ Billing     │ │ Communication│
                          │ (Pagamento, │ │ (Mensagens, │
                          │  Recibo)    │ │  Reparos)    │
                          └─────────────┘ └─────────────┘
```

### 2.2 Bounded Contexts

| Contexto | Responsabilidade | Agregados principais |
|----------|------------------|------------------------|
| **Identity** | Cadastro, login, perfis (Proprietário/Inquilino), LGPD, termos | `User`, `Session` |
| **Property** | Imóvel, endereço, tipo, área, valor, status, comodidades | `Property`, `PropertyDocument` |
| **Contract** | Contrato de locação, cláusulas, aditivos, assinatura eletrônica, versionamento | `Contract`, `ContractClause`, `ContractSignature` |
| **Inspection** | Vistoria de entrada/saída, laudo por cômodo, fotos, comparação entrada vs saída | `Inspection`, `InspectionRoom`, `InspectionMedia` |
| **Document** | Documentos do imóvel (escritura, IPTU, condomínio) e do inquilino (RG, comprovante de renda/residência), versionamento | `Document`, `DocumentVersion` |
| **Billing** | Aluguel, encargos, vencimento, reajuste, recibo, histórico de pagamentos | `RentPayment`, `Receipt`, `ContractAdjustment` |
| **Communication** | Mensagens entre proprietário e inquilino, solicitações de reparo, status (Aberta, Em análise, Aprovada, Concluída) | `Conversation`, `RepairRequest` |
| **Shared Kernel** | CPF, CNPJ, endereço (Value Objects), enums (PropertyStatus, RequestStatus) | — |

### 2.3 Agregados, entidades e value objects (resumo)

Convenção: **Aggregate Root** em PascalCase; **Value Object** em PascalCase com semântica de valor (imutável).

- **Identity**
  - `User` (AR): `id`, `email`, `fullName`, `cpf` (VO), `role` (Proprietário | Inquilino), `createdAt`, `profileCompleted`.
  - `Session`: `id`, `userId`, `expiresAt`, `ip`, `userAgent`.
  - VOs: `Cpf`, `Email`, `PasswordHash`.

- **Property**
  - `Property` (AR): `id`, `ownerId`, `title`, `address` (VO), `type` (Apartamento | Casa | Studio | Cobertura), `areaM2`, `rooms`, `parkingSpots`, `rentAmount`, `chargesAmount`, `status` (Disponível | Em negociação | Alugado | Encerrado), `createdAt`, `updatedAt`.
  - `PropertyDocument`: `id`, `propertyId`, `type` (Escritura | Matrícula | IPTU | Condomínio | Outros), `fileKey`, `uploadedAt`, `version`.
  - VOs: `Address`, `BrazilianAddress`, `MonetaryAmount`.

- **Contract**
  - `Contract` (AR): `id`, `propertyId`, `landlordId`, `tenantId`, `rentAmount`, `dueDay`, `termMonths`, `adjustmentIndex` (IPCA | IGP-M | INPC), `guaranteeType` (Caução | Seguro Fiança | Fiador), `startDate`, `endDate`, `status` (Draft | PendingSignature | Active | Ended | Cancelled), `version`, `createdAt`.
  - `ContractClause`: `id`, `contractId`, `key`, `title`, `body`, `order`.
  - `ContractSignature`: `id`, `contractId`, `signerId`, `role` (Locador | Locatário), `signedAt`, `ip`, `identityVerified`.
  - `ContractAddendum`: `id`, `contractId`, `description`, `effectiveDate`, `createdAt`, assinaturas análogas.

- **Inspection**
  - `Inspection` (AR): `id`, `contractId`, `type` (Entrada | Saída), `status` (Em preenchimento | Pendente aprovação | Concluída), `inspectorId`, `createdAt`, `completedAt`.
  - `InspectionRoom`: `id`, `inspectionId`, `name`, `description`, `paintNew`, `professionalCleaning`, `order`.
  - `InspectionMedia`: `id`, `inspectionRoomId`, `fileKey`, `label`, `observation`, `order`.

- **Document**
  - `Document` (AR): `id`, `entityType` (Property | User), `entityId`, `documentType`, `fileKey`, `uploadedBy`, `uploadedAt`, `status` (Pending | Approved | Rejected).
  - `DocumentVersion`: `id`, `documentId`, `fileKey`, `version`, `uploadedAt`.

- **Billing**
  - `RentPayment` (AR): `id`, `contractId`, `dueDate`, `amount`, `charges`, `status` (Pending | Paid | Overdue | Partial), `paidAt`, `receiptId`.
  - `Receipt`: `id`, `rentPaymentId`, `generatedAt`, `fileKey`.
  - `ContractAdjustment`: `id`, `contractId`, `effectiveDate`, `previousRent`, `newRent`, `indexUsed`, `createdAt`.

- **Communication**
  - `Conversation` (AR): `id`, `contractId`, `createdAt`, `updatedAt`.
  - `Message`: `id`, `conversationId`, `senderId`, `body`, `sentAt`, `readAt`.
  - `RepairRequest` (AR): `id`, `contractId`, `requesterId`, `title`, `description`, `status` (Aberta | Em análise | Aprovada | Concluída), `openedAt`, `closedAt`, mensagens anexas.

### 2.4 Domain Services (regras que não pertencem a um único agregado)

- **ContractGenerationService**: gera minuta de contrato a partir de `Property`, `User` (locador/locatário) e condições (valor, prazo, índice, garantia). Retorna `Contract` em Draft.
- **ReceiptGenerationService**: gera recibo de quitação a partir de `RentPayment` e `Contract` (dados das partes).
- **InspectionComparisonService**: compara `Inspection` de entrada e de saída e produz relatório de divergências.
- **SignatureVerificationService** (ou integração externa): valida assinatura eletrônica (data/hora, IP, identidade).

### 2.5 Eventos de domínio (exemplos)

- `Identity.UserRegistered`
- `Property.PropertyRegistered`, `Property.PropertyStatusChanged`
- `Contract.ContractCreated`, `Contract.ContractSigned`, `Contract.ContractEnded`
- `Inspection.InspectionCompleted`
- `Billing.PaymentRecorded`, `Billing.ReceiptGenerated`
- `Communication.RepairRequestOpened`, `Communication.RepairRequestStatusChanged`

Uso: notificações, auditoria, integração com módulos externos (ex.: assinatura eletrônica, gateway de pagamento).

---

## 3. Estrutura de pastas: `aluguel-direto/` (backend + frontend)

A aplicação é dividida em **backend** e **frontend** dentro de `aluguel-direto/`. A pasta `docs/` e `specs/` ficam na **raiz do repositório** (fora de `aluguel-direto/`), conforme as secções 3.2 e 3.3.

### 3.1 Árvore em `aluguel-direto/`

```
aluguel-direto/
├── backend/                           # API, domínio, persistência
│   ├── src/
│   │   ├── domains/                   # DDD: Bounded Contexts (cada um com CONTEXT.md)
│   │   │   ├── identity/
│   │   │   │   ├── entities/
│   │   │   │   ├── value-objects/
│   │   │   │   ├── repositories/
│   │   │   │   └── domain-services.ts
│   │   │   ├── property/
│   │   │   ├── contract/
│   │   │   ├── inspection/
│   │   │   ├── document/
│   │   │   ├── billing/
│   │   │   ├── communication/
│   │   │   └── shared/
│   │   ├── application/
│   │   ├── infrastructure/
│   │   │   ├── persistence/
│   │   │   ├── storage/
│   │   │   ├── email/
│   │   │   └── signing/
│   │   ├── api/
│   │   └── lib/
│   ├── prisma/
│   ├── tests/
│   ├── CONTEXT.md
│   └── package.json
│
├── frontend/                          # Next.js, React
│   ├── src/
│   │   ├── app/
│   │   │   ├── (auth)/
│   │   │   ├── (app)/
│   │   │   ├── (admin)/
│   │   │   └── api/
│   │   ├── components/
│   │   ├── hooks/
│   │   └── lib/
│   ├── public/
│   ├── tests/
│   ├── CONTEXT.md
│   └── package.json
│
├── shared/                             # Opcional: tipos/Zod compartilhados
│   └── CONTEXT.md
│
└── CONTEXT.md
```

Regras: **frontend** consome **backend** via HTTP. **backend**: `api/` → `application/` → `domains/` + `infrastructure/`; `domains/` não depende de `api/` nem `infrastructure/`.

*(As pastas `app/(auth)`, `(app)`, `(admin)` e subpastas de `domains/`, `application/`, `infrastructure/` seguem o detalhamento da secção 4 e do BUILD_SPEC original; a árvore acima é resumida.)*

### 3.2 Estrutura de `docs/` (raiz do repositório)

Padrão adoptado de `dataplatform-argocd-gke-deployments/docs`:

```
docs/
├── README.md                    # Índice e categorias
├── BUILD_SPEC.md                # Este arquivo
├── guides/
│   ├── deployment/
│   ├── processes/
│   └── CONTEXT_TEMPLATE.md      # Modelo de CONTEXT.md para pastas do source
├── decisions/
│   ├── adrs/                    # 0001-descricao.md
│   └── trade-offs/
├── communications/
└── registros/
```

### 3.3 CONTEXT.md em cada pasta do source

Toda pasta significativa em `aluguel-direto/backend/`, `aluguel-direto/frontend/` e `aluguel-direto/shared/` deve ter **CONTEXT.md** com: propósito da pasta, padrões utilizados, snippets relevantes, dependências e referências a `specs/` e `docs/`. Modelo em `docs/guides/CONTEXT_TEMPLATE.md`.

### 3.4 Estrutura de `specs/` (raiz do repositório)

Padrão adoptado de `dataplatform-mcp-server/specs` e `openspec/specs`:

```
specs/
├── project.md              # Contexto do projeto, convenções, constraints
├── backend/
│   └── spec.md             # Especificação do backend (DDD, API, infra)
└── frontend/
    └── spec.md             # Especificação do frontend (Next.js, rotas, UI)
```

Cada `spec.md` descreve propósito, requisitos e cenários (formato “The system SHALL / WHEN-THEN” quando aplicável). Ao implementar este BUILD_SPEC, **toda a aplicação é construída dentro de `aluguel-direto/`** (que conterá `frontend/`, `backend/` e opcionalmente `shared/`).

---

## 4. Mapeamento de rotas (HTML de referência → Next.js App Router)

| Rota atual (hash) | Next.js (App Router) |
|-------------------|----------------------|
| `#/` | `app/(auth)/page.tsx` |
| `#/login` | `app/(auth)/login/page.tsx` |
| `#/criar-conta` | `app/(auth)/criar-conta/page.tsx` |
| `#/termos-privacidade` | `app/(auth)/termos/page.tsx` |
| `#/dashboard-proprietario` | `app/(app)/dashboard-proprietario/page.tsx` |
| `#/dashboard-inquilino` | `app/(app)/dashboard-inquilino/page.tsx` |
| `#/cadastro-imovel` | `app/(app)/imoveis/novo/page.tsx` |
| `#/edicao-imovel` | `app/(app)/imoveis/[id]/editar/page.tsx` |
| `#/gestao-documentos-imovel` | `app/(app)/imoveis/[id]/documentos/page.tsx` |
| `#/geracao-contrato` | `app/(app)/contratos/novo/page.tsx` |
| `#/assinatura-contrato` | `app/(app)/contratos/[id]/assinatura/page.tsx` |
| `#/detalhes-contrato` | `app/(app)/contratos/[id]/page.tsx` |
| `#/aditivo-contratual` | `app/(app)/contratos/[id]/aditivo/page.tsx` |
| `#/laudo-vistoria` | `app/(app)/vistorias/[contractId]/entrada` ou `.../saida` conforme tipo |
| `#/comparativo-vistorias` | `app/(app)/vistorias/[contractId]/comparativo/page.tsx` |
| `#/encerramento-contrato` | `app/(app)/contratos/[id]/encerramento/page.tsx` (fluxo encerramento + vistoria saída) |
| `#/solicitacoes-reparos` | `app/(app)/solicitacoes/page.tsx` e `.../ [id]/page.tsx` |
| `#/documentos-inquilino` | `app/(app)/documentos/page.tsx` |
| `#/detalhes-pagamento` | `app/(app)/pagamentos/[id]/page.tsx` |
| `#/historico-pagamentos` | `app/(app)/pagamentos/recibos/page.tsx` ou `pagamentos/page.tsx` |
| `#/historico-reajustes` | `app/(app)/contratos/[id]/reajustes/page.tsx` |
| `#/notificacoes` | `app/(app)/notificacoes/page.tsx` |
| `#/config-notificacoes` | `app/(app)/configuracoes/notificacoes/page.tsx` |
| `#/config-perfil-lgpd` | `app/(app)/configuracoes/privacidade/page.tsx` |
| `#/onboarding-proprietario` | `app/(app)/onboarding-proprietario/page.tsx` |
| `#/onboarding-inquilino` | `app/(app)/onboarding-inquilino/page.tsx` |
| `#/logs-auditoria` | `app/(app)/contratos/[id]/auditoria/page.tsx` |
| `#/analise-perfil-inquilino` | `app/(app)/contratos/[id]/analise-inquilino/page.tsx` (ou dentro do fluxo de novo contrato) |
| `#/co-proprietarios` | `app/(app)/imoveis/[id]/co-proprietarios/page.tsx` |
| `#/dashboard-co-proprietarios` | `app/(app)/co-proprietarios/page.tsx` |
| `#/portfolio` | `app/(app)/portfolio/page.tsx` |
| `#/relatorios-financeiros` | `app/(app)/relatorios/page.tsx` |
| `#/exportacao-contabeis` | `app/(app)/relatorios/exportacao/page.tsx` |
| `#/suporte-disputas` | `app/(app)/suporte/page.tsx` |
| `#/base-conhecimento` | `app/(app)/ajuda/page.tsx` |
| `#/dashboard-admin-inadimplencia` | `app/(admin)/inadimplencia/page.tsx` |
| `#/dashboard-administrativo` | `app/(admin)/dashboard/page.tsx` |

---

## 5. Fluxo de dados e rendering

- **Server Components (RSC)** por padrão: listagens, dashboards, detalhes de contrato/imóvel, recibos (leitura). Dados via `async` em `page.tsx` ou em Server Components filhos, chamando `application/` (que usa repositórios injectados).
- **Client Components** quando necessário: formulários interativos, modais, arrastar-e-soltar (vistoria), assinatura, upload com progress, real-time (mensagens).
- **Server Actions** para mutations: criar/editar imóvel, gerar contrato, registrar assinatura, registrar pagamento, abrir/fechar solicitação. Validação com Zod nos Actions.
- **React Query** (opcional): em Client Components que precisam de cache, invalidação e refetch (ex.: lista de contratos, mensagens). O `queryClient` pode ser usado no servidor para prefetch e no cliente para hydration.

Estrutura típica de uma página de aplicação:

```txt
page.tsx (RSC) → busca dados (application/ ou dados estáticos) → passa para layout e filhos
  → Layout (RSC) → Header, Sidebar, etc.
  → Content (RSC ou Client) → tabelas, cards, leitura
  → Forms/Modals (Client) → React Hook Form + Server Action
```

---

## 6. API e integrações

- **Autenticação**: NextAuth.js (ou Auth.js) com provider de credenciais + possivelmente OAuth (Google). Sessão em JWT ou database. Variáveis de ambiente para `NEXTAUTH_SECRET`, `NEXTAUTH_URL`; jamais credenciais em código.
- **Backend**: 
  - **Opção A**: Next.js como BFF; API externa (Node, .NET, etc.) com REST ou GraphQL. `application/` chama essa API via `fetch` ou cliente typado.
  - **Opção B**: Tudo em Next.js: Route Handlers em `app/api/` que chamam `application/` e persistência (Prisma + PostgreSQL).
- **Storage de arquivos**: presigned URLs (S3/R2) ou endpoint `api/upload` que valida e envia para o bucket. Nunca armazenar segredos no front.
- **Assinatura eletrônica**: integração com provedor (ex.: ClickSign, D4Sign, Clicksign) via API server-side. `ContractSignature` persiste `signedAt`, `ip`, `externalId` do provedor.
- **Pagamentos**: somente referência a PIX/Boleto no PRD; integração com gateway (ex.: Asaas, Stripe, Mercado Pago) em camada de infraestrutura. `Billing` emite `RentPayment` e `Receipt`; o gateway é detalhe de implementação.

---

## 7. Design system e acessibilidade

- **Tokens**: `primary` #1754cf, `background-light` #f6f6f8, `background-dark` #111621 (Tailwind `theme.extend.colors`). Fonte Public Sans.
- **Componentes base**: Button, Input, Select, Checkbox, Textarea, Card, Badge, Table, Modal, Tabs, Stepper, FileUpload. Construir em `components/ui/` e reutilizar nos fluxos.
- **Referência visual (opcional)**: `docs/initial-context/` contém protótipos HTML (`code.html`) e `screen.png` apenas como **referência de design**; a aplicação em `aluguel-direto/` **não os carrega**. Ao implementar, pode-se consultar esses arquivos para layout e copy em PT-BR.
- **Acessibilidade**: ARIA onde necessário, foco visível, contraste adequado, labels em formulários, navegação por teclado. Seguir WCAG 2.1 AA na medida do possível.

---

## 8. Segurança e LGPD

- **Credenciais e secrets**: apenas em variáveis de ambiente (`.env`, `.env.local`). `.env.example` com chaves vazias e descrição.
- **Autorização**: middleware Next.js para rotas `(app)/` e `(admin)/`; checagem de `session` e `role`. Proprietário não acessa dados de contratos de outros; inquilino apenas seus contratos e documentos.
- **LGPD**: tela de consentimento/termos no cadastro; opção de exportação e exclusão em `configuracoes/privacidade`. Dados sensíveis (CPF, documentos) criptografados em repouso (responsabilidade da infra de DB/storage). Logs de auditoria para ações críticas (assinatura, alteração de contrato, acesso a documentos).

---

## 9. Testes

- **Unit (Vitest)**: value objects, domain services, validadores Zod, funções puras em `application/`.
- **Integração**: repositórios contra DB de teste (Prisma + SQLite/Postgres em memória ou container).
- **E2E (Playwright)**: fluxos principais: cadastro, login, criação de imóvel, geração de contrato, assinatura (mock do provedor), vistoria, pagamento e recibo. Executar em CI.

---

## 10. Build e deploy

- **Build**: `next build`. Supor Node 18+.
- **Deploy**: Vercel, ou Docker (multi-stage) para outras plataformas. Variáveis de ambiente injetadas no runtime.
- **CI (ex. GitHub Actions)**: `lint`, `typecheck`, `test`, `build`. Opcional: `e2e` em matriz de browsers.

---

## 11. Entregas por fase (sugestão)

| Fase | Escopo |
|------|--------|
| **F1** | Next.js + TypeScript + Tailwind, estrutura de pastas DDD, Identity (cadastro, login, sessão), layout (auth) e (app), rotas estáticas e placeholder para imóveis, contratos, pagamentos. |
| **F2** | Property (CRUD), Document (upload para imóvel), telas de listagem e formulários baseados nos HTMLs de referência. |
| **F3** | Contract (geração, cláusulas, assinatura com integração mock ou real), Inspection (entrada/saída, laudo, mídia). |
| **F4** | Billing (pagamentos, recibos), Communication (mensagens, solicitações de reparo), notificações e configurações. |
| **F5** | Admin, relatórios, exportação, ajustes de LGPD e auditoria. |

---

## 12. Referências

- PRD e diretrizes de marca do repositório.
- `docs/initial-context/` (protótipos e `screen.png`) como **referência de design** apenas; a aplicação não depende deles em runtime.
- Next.js: [App Router](https://nextjs.org/docs/app), [Server Actions](https://nextjs.org/docs/app/building-your-application/data-fetching/server-actions-and-mutations), [Route Handlers](https://nextjs.org/docs/app/building-your-application/routing/route-handlers).
- DDD: Evans, *Domain-Driven Design*; *Implementing Domain-Driven Design* (Vernon).
