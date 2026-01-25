# Property — Bounded Context

## Purpose

Property context: imóvel, endereço, tipo, área, valor, status. Aggregate: `Property`. Value objects (Address) can be expanded later; for now `addressLine` as string.

## Patterns

- **Entity:** `Property` (AR) in `entities/Property.ts`; types `PropertyType`, `PropertyStatus`.
- **Repository:** `IPropertyRepository` in `repositories/`; impl in `infrastructure/persistence/PrismaPropertyRepository`.

## Snippets

```ts
// IPropertyRepository
create(data: CreatePropertyInput): Promise<Property>;
findById(id: string): Promise<Property | null>;
findByOwner(ownerId: string): Promise<Property[]>;
```

## Dependencies

- **Depends on:** nothing (pure domain).
- **Used by:** `application/property/`, `infrastructure/persistence/`.

## References

- [BUILD_SPEC](../../../../../../docs/BUILD_SPEC.md) §2.2–2.3
- [specs/backend](../../../../../../specs/backend/spec.md)
