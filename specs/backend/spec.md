# backend Specification

## Purpose

API, domain logic (DDD), and infrastructure for AluguelDireto. Runs as a separate service consumed by the frontend via HTTP (REST or OpenAPI). Hosts: domains, application (use cases), infrastructure (persistence, storage, signing, email).

## Requirements

### Requirement: Bounded Contexts and Layers

The backend SHALL be structured in DDD layers: `domains/`, `application/`, `infrastructure/`, `api/`. Each bounded context (Identity, Property, Contract, Inspection, Document, Billing, Communication) SHALL have its own folder under `domains/` with entities, value-objects, repository interfaces, and domain services.

#### Scenario: Domain isolation

- **WHEN** a use case in `application/` needs to coordinate multiple aggregates
- **THEN** it uses domain services or application services that depend only on repository interfaces (ports)
- **AND** implementations of repositories live in `infrastructure/persistence/`
- **AND** `domains/` does not depend on `api/` or `infrastructure/`

### Requirement: REST API

The backend SHALL expose a REST API used by the frontend. Routes SHALL be grouped by resource (e.g. `/api/v1/properties`, `/api/v1/contracts`, `/api/v1/inspections`). Authentication via session/JWT or API key as defined in project; authorization SHALL enforce tenant/landlord isolation.

#### Scenario: CRUD properties

- **WHEN** an authenticated proprietor sends `POST /api/v1/properties` with valid body
- **THEN** the API creates a Property and returns 201 with the created resource
- **AND** validation is performed (Zod or equivalent) before calling application layer

#### Scenario: Unauthorized access

- **WHEN** a tenant requests `GET /api/v1/properties/:id` for a property they do not own or are not linked to via a contract
- **THEN** the API returns 403 Forbidden

### Requirement: Persistence

The backend SHALL use Prisma (or equivalent) with PostgreSQL. Schema SHALL reflect aggregates and entities described in BUILD_SPEC (User, Property, Contract, Inspection, Document, RentPayment, Receipt, Conversation, Message, RepairRequest, etc.). Migrations SHALL be versioned.

### Requirement: File Storage

The backend SHALL provide a way to store and retrieve files (documents, inspection media) via presigned URLs or an upload endpoint that validates and forwards to S3/R2. Secrets for the bucket SHALL be in environment variables only.

### Requirement: Electronic Signature Integration

The backend SHALL integrate with an electronic signature provider (e.g. ClickSign, D4Sign). Contract signature use cases SHALL persist `signedAt`, `ip`, and `externalId` from the provider. The integration SHALL be in `infrastructure/signing/`.

### Requirement: CONTEXT.md in Key Folders

Each of the following SHALL have a `CONTEXT.md`: `backend/`, `backend/src/domains/<context>/`, `backend/src/application/`, `backend/src/infrastructure/`, `backend/src/api/`. Content: purpose, patterns, relevant snippets, dependencies, references to `specs/` and `docs/`.

## Referências

- [BUILD_SPEC](../../docs/BUILD_SPEC.md) — secções 2 (DDD), 3.1 (árvore backend), 6 (API, integrações)
- [specs/project](../project.md)
- [specs/frontend](../frontend/spec.md) — para contrato de consumo da API
