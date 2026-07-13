# ShadyCard Workspace

## Overview

pnpm workspace monorepo using TypeScript. Each package manages its own dependencies.

## Stack

- **Monorepo tool**: pnpm workspaces
- **Node.js version**: 24
- **Package manager**: pnpm
- **TypeScript version**: 5.9
- **API framework**: Express 5
- **Database**: MySQL 8.0+ (Drizzle ORM, mysql2 driver)
- **Validation**: Zod (`zod/v4`), `drizzle-zod`
- **API codegen**: Orval (from OpenAPI spec)
- **Build**: esbuild (ESM bundle)

## Apps

- `artifacts/api-server` — Backend API (Express)
- `artifacts/shady-store` — Store frontend (Vite + React + Wouter) — works as Telegram Mini App AND standalone website
- `artifacts/shady-admin` — Admin panel (Vite + React + React Router)
- `artifacts/mockup-sandbox` — UI component playground

## Auth modes

- **Telegram Mini App**: identity from `window.Telegram.WebApp.initData` (HMAC verified server-side)
- **Website**: register / login at `/api/auth/*` — bcrypt password hashing + JWT-style web token stored in `users.web_auth_token` (cookie + localStorage fallback)

Both modes flow through `getOrCreateCurrentUser(req)` in `artifacts/api-server/src/lib/currentUser.ts`.

## Key Commands

- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run build` — typecheck + build all packages
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API hooks and Zod schemas from OpenAPI spec
- `pnpm --filter @workspace/db run push` — push DB schema to MySQL
- `pnpm --filter @workspace/api-server run dev` — run API server locally
- `pnpm --filter @workspace/shady-store run dev` — run store frontend
- `pnpm --filter @workspace/shady-admin run dev` — run admin panel

## Database

- MySQL 8.0+ (utf8mb4_unicode_ci)
- Connection via `DATABASE_URL=mysql://user:pass@host:3306/dbname`
- Schema: `lib/db/src/schema/index.ts` (Drizzle)
- Migration SQL: `lib/db/drizzle/0000_shadycard_initial_mysql.sql`
