# AluguelDireto — Project Context

## Purpose

SaaS de infraestrutura de locação residencial entre pessoas físicas (proprietário e inquilino), sem imobiliária: contratos, vistorias, documentos, pagamentos e comunicação. Mercado brasileiro, Lei do Inquilinato, LGPD.

## Tech Stack

- **Frontend:** Next.js 14 (App Router), React 18, TypeScript 5, Tailwind CSS, React Hook Form, Zod, React Query (opcional).
- **Backend:** Node (Express/Fastify/Nest), TypeScript, Prisma, PostgreSQL. API REST. Opcional: tRPC.
- **Infra:** Storage (S3/R2) via presigned URLs; assinatura eletrônica (ClickSign/D4Sign); gateway de pagamento (Asaas/Stripe/Mercado Pago) em camada de infra.

## Project Conventions

### Code Style

- TypeScript strict. Naming: PascalCase (entities, VOs, types), camelCase (functions, vars). English for code, comments, APIs; PT-BR for UI.
- Secrets only in env vars. No plain-text credentials.

### Architecture Patterns

- **DDD:** Bounded Contexts (Identity, Property, Contract, Inspection, Document, Billing, Communication). Domains in `backend/src/domains/`; application (use cases) in `backend/src/application/`; infrastructure (DB, storage, signing, email) in `backend/src/infrastructure/`. Frontend consumes backend via HTTP.
- **CONTEXT.md:** Every significant folder in `aluguel-direto/` has a `CONTEXT.md` (purpose, patterns, snippets, deps, refs). Template: `docs/guides/CONTEXT_TEMPLATE.md`.
- **Docs:** `docs/` at repo root: `guides/`, `decisions/adrs/`, `decisions/trade-offs/`, `communications/`, `registros/`. Pattern from dataplatform-argocd-gke-deployments/docs.
- **Specs:** `specs/` at repo root: `project.md`, `backend/spec.md`, `frontend/spec.md`. Pattern from dataplatform-mcp-server/specs.

### Implementation Root

All implementation is built inside **`aluguel-direto/`** at repo root, with subfolders:

- `aluguel-direto/backend/`
- `aluguel-direto/frontend/`
- `aluguel-direto/shared/` (optional)

### Testing Strategy

- Unit (Vitest): VOs, domain services, Zod, pure functions.
- Integration: repositories vs test DB.
- E2E (Playwright): signup, login, property, contract, signature (mock), inspection, payment.

### Git Workflow

- Commits and messages in English. Branching and PRs as per team (e.g. main, feature/*).

## Domain Context

- **Identity:** User, Session; roles Proprietário, Inquilino. CPF, terms, LGPD consent.
- **Property:** Property, PropertyDocument; status Disponível | Em negociação | Alugado | Encerrado.
- **Contract:** Contract, ContractClause, ContractSignature, ContractAddendum; Draft → PendingSignature → Active → Ended.
- **Inspection:** Inspection, InspectionRoom, InspectionMedia; types Entrada, Saída.
- **Document:** Document, DocumentVersion; entity Property | User.
- **Billing:** RentPayment, Receipt, ContractAdjustment.
- **Communication:** Conversation, Message, RepairRequest; status Aberta | Em análise | Aprovada | Concluída.

## Important Constraints

- LGPD: consent, export, deletion; audit logs for critical actions. Sensitive data encrypted at rest.
- Authorization: tenant only their contracts/documents; landlord only their properties/contracts.
- No credentials in code; env vars only.

## External Dependencies

- Auth: NextAuth/Auth.js or similar (frontend or BFF).
- Storage: S3/R2 presigned; frontend never gets secrets.
- Signing: provider API (server-side).
- Payment: gateway in infrastructure; Billing domain emits RentPayment/Receipt.

## References

- [BUILD_SPEC](../docs/BUILD_SPEC.md)
- [specs/backend](backend/spec.md)
- [specs/frontend](frontend/spec.md)
- [docs/README](../docs/README.md)
- [docs/guides/CONTEXT_TEMPLATE](../docs/guides/CONTEXT_TEMPLATE.md)
