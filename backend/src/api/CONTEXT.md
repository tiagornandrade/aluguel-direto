# API — HTTP Layer

## Purpose

Express app, CORS, JSON, route modules. Mounts under `/api/v1/`: health, auth, properties, etc. Validates with Zod, calls application use cases, maps errors to HTTP.

## Patterns

- **Routes:** one file per resource in `routes/` (health, auth, properties). `server.ts` imports and mounts.
- **Auth for protected routes:** `X-Api-Key` + `X-User-Id` for server-to-server (BFF). Public: health, register, login.
- **Validation:** Zod schemas in route handlers; 400 on ZodError; 401/403/409 for domain errors.

## Snippets

```ts
// Protected route (properties)
const userId = req.headers["x-user-id"] as string;
const key = req.headers["x-api-key"];
if (key !== process.env.INTERNAL_API_KEY || !userId) return res.status(401).json({ error: "UNAUTHORIZED" });
```

## Dependencies

- **Depends on:** `application/`, `infrastructure/`, `lib/env`.
- **Not used by:** `domains/` or `infrastructure/`.

## References

- [BUILD_SPEC](../../../../../docs/BUILD_SPEC.md) §6
- [specs/backend](../../../../../specs/backend/spec.md)
