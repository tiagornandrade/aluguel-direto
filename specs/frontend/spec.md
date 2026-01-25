# frontend Specification

## Purpose

Next.js 14 (App Router) and React 18 application for AluguelDireto. Implements landing, auth, dashboards (proprietário/inquilino), CRUD for properties, contracts, inspections, payments, messages, and settings. Consumes the backend via HTTP. All UI in PT-BR.

## Requirements

### Requirement: App Router Structure

The frontend SHALL use Next.js App Router with route groups: `(auth)` for landing, login, signup, terms; `(app)` for authenticated app (dashboards, imóveis, contratos, vistorias, pagamentos, mensagens, solicitações, documentos, notificações, configurações, onboarding); `(admin)` for admin dashboards. Each group SHALL have a `layout.tsx` as needed.

#### Scenario: Unauthenticated access to app routes

- **WHEN** a user navigates to any `(app)/` or `(admin)/` route without a valid session
- **THEN** they SHALL be redirected to login (or landing) as per middleware

### Requirement: Server and Client Components

The frontend SHALL use Server Components by default for data fetching and static content. Client Components SHALL be used only for: forms with heavy interaction, modals, drag-and-drop (e.g. inspection media), signature UI, upload with progress, or real-time features. Server Actions SHALL be used for mutations (create/update property, contract, payment, repair request, etc.) with Zod validation.

### Requirement: Design System and Accessibility

The frontend SHALL use Tailwind with design tokens: `primary` #1754cf, `background-light` #f6f6f8, `background-dark` #111621; font Public Sans. Base components (Button, Input, Select, Card, Badge, Table, Modal, Tabs, Stepper, FileUpload) SHALL live in `components/ui/`. Layout and copy SHALL follow the reference HTMLs in the repo (`cadastro_de_novo_imóvel/`, `dashboard_do_proprietário/`, `laudo_de_vistoria_digital/`, etc.). ARIA, focus, contrast, and keyboard navigation SHALL follow WCAG 2.1 AA where feasible.

### Requirement: Route Mapping

The frontend SHALL implement the route mapping defined in BUILD_SPEC section 4 (e.g. `(auth)/page.tsx` → landing; `(app)/imoveis/novo/page.tsx` → new property; `(app)/contratos/[id]/assinatura/page.tsx` → contract signature). Dynamic segments `[id]`, `[contractId]` SHALL be used as specified.

### Requirement: API and Auth

The frontend SHALL call the backend REST API (base URL from env). Auth (NextAuth or equivalent) SHALL manage session; credentials and tokens SHALL not be stored in plain text. Upload of files SHALL use presigned URLs or a dedicated API route that forwards to the backend/storage.

### Requirement: CONTEXT.md in Key Folders

Each of the following SHALL have a `CONTEXT.md`: `frontend/`, `frontend/src/app/`, `frontend/src/components/`, `frontend/src/hooks/`, `frontend/src/lib/`. Content: purpose, patterns, relevant snippets, dependencies, references to `specs/` and `docs/`.

## Referências

- [BUILD_SPEC](../../docs/BUILD_SPEC.md) — secções 3.1 (árvore frontend), 4 (mapeamento de rotas), 5 (fluxo de dados), 7 (design, acessibilidade)
- [specs/project](../project.md)
- [specs/backend](../backend/spec.md) — para contrato da API consumida
