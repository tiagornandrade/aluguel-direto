# Lib — Shared Utilities

## Purpose

`api-client.ts` (fetch to backend, authApi), `auth.ts` (NextAuth options, CredentialsProvider), `backend-server.ts` (RSC: getServerSession + fetch to backend with X-User-Id, X-Api-Key). Types in `types/`.

## Patterns

- **api-client:** direct to `NEXT_PUBLIC_API_URL` for auth (register, login); to `/api/proxy/*` for authenticated resources (properties).
- **auth:** JWT strategy, callbacks add `id` and `role`; `NEXTAUTH_SECRET`, `NEXTAUTH_URL` in env.
- **backend-server:** used in RSC; `getServerSession(authOptions)`, then fetch to backend with internal headers.

## Dependencies

- **Depends on:** next-auth, env (NEXT_PUBLIC_API_URL, NEXTAUTH_*, INTERNAL_API_KEY).
- **References:** [BUILD_SPEC](../../../../../docs/BUILD_SPEC.md) §6, [specs/frontend](../../../../../specs/frontend/spec.md).
