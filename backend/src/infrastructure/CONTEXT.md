# Infrastructure

## Purpose

Implementations of persistence (Prisma repos), storage (future: S3/R2), email, signing. Depends on `domains/` interfaces and `lib/` (db, env).

## Patterns

- **Persistence:** `PrismaUserRepository`, `PrismaPropertyRepository` in `persistence/`; implement interfaces from `domains/`.
- **Storage / Email / Signing:** placeholders or implementations in `storage/`, `email/`, `signing/` when needed.

## Snippets

```ts
// Prisma repo implementing domain interface
export const PrismaUserRepository: IUserRepository = {
  async create(data) { ... },
  async findByEmail(email) { ... },
  async findById(id) { ... },
};
```

## Dependencies

- **Depends on:** `domains/` (interfaces), `lib/db`, `lib/env`.
- **Used by:** `api/` (wires repos into use cases).

## References

- [BUILD_SPEC](../../../../docs/BUILD_SPEC.md) §3.1
- [specs/backend](../../../../specs/backend/spec.md)
