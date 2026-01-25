# Application — Use Cases

## Purpose

Application layer: use cases (register, login, create property, etc.). Receives repository interfaces and infra functions (hash, compare). No HTTP or DB imports.

## Patterns

- **Use case per file:** e.g. `identity/register-user.ts`, `identity/login.ts`, `property/create-property.ts`.
- **Dependency injection:** repos and pure functions (hash, compare) passed as arguments.
- **Errors:** throw `Error` with codes like `EMAIL_ALREADY_EXISTS`, `INVALID_CREDENTIALS`; API catches and maps to HTTP.

## Snippets

```ts
// Typical use case
export async function createProperty(
  repo: IPropertyRepository,
  input: CreatePropertyInput & { ownerId: string }
): Promise<{ property: Property }> { ... }
```

## Dependencies

- **Depends on:** `domains/` (entities, repo interfaces).
- **Used by:** `api/routes/`.

## References

- [BUILD_SPEC](../../../../docs/BUILD_SPEC.md) §2.4
- [specs/backend](../../../../specs/backend/spec.md)
