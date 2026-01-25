# Identity — Bounded Context

## Purpose

Identity context: users, roles (Proprietário/Inquilino), authentication data. Aggregates: `User`, `Session`. Value objects: `Email`, `Cpf`, `PasswordHash`.

## Patterns

- **Entity:** `User` (AR) in `entities/User.ts`; `UserPersisted` for repository layer (includes `passwordHash`).
- **Repository:** `IUserRepository` in `repositories/`; impl in `infrastructure/persistence/PrismaUserRepository`.
- **Value objects:** `Email` in `value-objects/Email.ts`; Cpf/PasswordHash can be added when needed.

## Snippets

```ts
// IUserRepository
create(data: CreateUserInput): Promise<User>;
findByEmail(email: string): Promise<UserPersisted | null>;
findById(id: string): Promise<User | null>;
```

## Dependencies

- **Depends on:** nothing (pure domain).
- **Used by:** `application/identity/`, `infrastructure/persistence/`.

## References

- [BUILD_SPEC](../../../../../../docs/BUILD_SPEC.md) §2.2–2.3
- [specs/backend](../../../../../../specs/backend/spec.md)
