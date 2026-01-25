# AluguelDireto — Monorepo Root

## Purpose

Root of the implementation. Contains `backend/` (API, domain, infrastructure) and `frontend/` (Next.js). Optional `shared/` for types and Zod schemas. All built according to [BUILD_SPEC](../../docs/BUILD_SPEC.md).

## Patterns

- **Backend** exposes REST under `/api/v1/`. Frontend consumes via `NEXT_PUBLIC_API_URL`.
- **CONTEXT.md** in `backend/`, `frontend/`, and key subfolders (see template in `docs/guides/CONTEXT_TEMPLATE.md`).

## Dependencies

- Backend: Node 18+, pnpm/npm. Prisma (SQLite in dev; Postgres in prod via `DATABASE_URL`).
- Frontend: Node 18+, pnpm/npm. Next.js 14, React 18.

## References

- [BUILD_SPEC](../../docs/BUILD_SPEC.md)
- [specs/project](../../specs/project.md)
