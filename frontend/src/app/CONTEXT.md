# App — Routes and Layouts

## Purpose

Next.js App Router: `(auth)/` (landing, login, criar-conta, termos), `(app)/` (dashboard, imóveis, contratos, pagamentos, etc.), `(admin)/` (future), `api/` (NextAuth, proxy to backend).

## Patterns

- **Route groups:** `(auth)`, `(app)`, `(admin)`; layouts per group where needed.
- **RSC by default:** listagens e leitura; Client Components para formulários, modais, assinatura.
- **Auth:** middleware protege `(app)` e `(admin)`; redireciona para `/login` com `callbackUrl`.

## Dependencies

- **Depends on:** `components/`, `lib/` (auth, api-client, backend-server).
- **References:** [BUILD_SPEC](../../../../../docs/BUILD_SPEC.md) §4, [specs/frontend](../../../../../specs/frontend/spec.md).
