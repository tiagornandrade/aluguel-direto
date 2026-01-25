# Components

## Purpose

React components: layout (AppHeader, AppFooter), UI base (future: Button, Input, Card), and feature-specific. Reused across `app/`.

## Patterns

- **Layout:** `layout/AppHeader.tsx`, `layout/AppFooter.tsx`; usam `useSession` / `signOut` onde necessário.
- **Client:** `"use client"` quando há hooks ou event handlers; RSC quando só leitura.
- **Design:** Tailwind, tokens (primary #1754cf, background-light/dark), Public Sans, Material Symbols.

## Dependencies

- **Depends on:** `lib/` (auth), next-auth (signOut).
- **References:** [BUILD_SPEC](../../../../../docs/BUILD_SPEC.md) §7, [specs/frontend](../../../../../specs/frontend/spec.md).
