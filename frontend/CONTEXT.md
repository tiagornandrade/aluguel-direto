# Frontend — CONTEXT

## Purpose

Next.js 14 (App Router), React 18. Landing, auth (login, criar-conta), dashboards (proprietário, inquilino), placeholders para imóveis, contratos, pagamentos. Consome o backend via `NEXT_PUBLIC_API_URL`. Autenticação: NextAuth (Credentials) que chama `POST /api/v1/auth/login`.

## Patterns

- **Route groups:** `(auth)` (/, /login, /criar-conta, /termos), `(app)` (dashboard, imoveis, contratos, pagamentos) com layout (AppHeader, AppFooter).
- **Server Components** por padrão; **Client** onde há `useState`, `signIn`, `useSearchParams`.
- **Middleware:** protege rotas (app) e (admin); redireciona para /login se não houver session.

## Snippets

```ts
// API
const { user } = await authApi.login({ email, password });

// NextAuth in login page
await signIn("credentials", { email, password, redirect: false });
```

## Dependencies

- **Depends on:** `lib/api-client`, `lib/auth`, `components/layout`. Backend via HTTP.
- **Not used by:** backend.

## References

- [specs/frontend](../../specs/frontend/spec.md)
- [BUILD_SPEC](../../docs/BUILD_SPEC.md)
