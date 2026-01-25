# Backend — CONTEXT

## Purpose

API REST, domain (DDD), and infrastructure for AluguelDireto. Entry: `src/api/server.ts`. Routes under `/api/v1/` (health, auth). Consumed by frontend via `NEXT_PUBLIC_API_URL`.

## Patterns

- **Layers:** `api/` → `application/` (use cases) → `domains/` (entities, VOs, repo interfaces) and `infrastructure/` (Prisma, repos impl).
- **Repositories:** Interfaces in `domains/<context>/repositories/`; impl in `infrastructure/persistence/`.
- **Validation:** Zod in API route handlers before calling application.
- **Password:** bcrypt in routes; application receives `hash`/`compare` functions.

## Snippets

```ts
// Route calling application
const { user } = await registerUser(userRepo, (p) => bcrypt.hash(p, 10), body);
res.status(201).json({ user: { id: user.id, email: user.email, fullName: user.fullName, role: user.role } });
```

## Dependencies

- **Depends on:** `lib/` (db, env). Application and domains have no HTTP/db imports.
- **Not used by:** frontend only via HTTP.

## References

- [specs/backend](../../specs/backend/spec.md)
- [BUILD_SPEC](../../docs/BUILD_SPEC.md)
