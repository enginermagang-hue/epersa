<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

# e-persa (persuratan/letter-tracking app)

Indonesian-government-style letter/disposition app. UI strings and API error messages are written in **Indonesian** — keep them that way.

## Stack & setup

- Next.js **16.3.0** App Router (see the auto-managed block above), React 19, TypeScript strict, React Compiler enabled (`next.config.ts`), Tailwind v4 via `@tailwindcss/postcss` (no `tailwind.config.*` file).
- Path alias `@/*` → `src/*` (tsconfig). Import the DB as `@/db`, schema as `@/db/schema`.
- `.env` (gitignored) must contain `TURSO_DATABASE_URL` and `TURSO_AUTH_TOKEN` for anything DB-related. `drizzle.config.ts` reads them directly.

## Commands

- `npm run dev` / `npm run build` / `npm start`
- `npm run lint` — eslint (flat config, next core-web-vitals + typescript). No typecheck script; `npm run build` covers TS.
- `npm run db:seed` — seeds roles/departments/admin via `tsx src/db/seed.ts`
- No drizzle npm scripts — use `npx drizzle-kit generate` / `npx drizzle-kit migrate` (config: schema `src/db/schema.ts`, out `drizzle/`, dialect `turso`). Migrations live in `drizzle/*.sql`.
- No test framework is installed.

## Architecture notes

- **DB**: Drizzle ORM + Turso (libsql). Schema in `src/db/schema.ts` (roles, departments, users, sessions), relations in `src/db/relations.ts`, client in `src/db/index.ts`.
- **Auth is hand-rolled** (no NextAuth/Lucia): `src/lib/auth/auth.ts` verifies argon2 password, `src/lib/auth/session.ts` hashes a random session token (SHA-256) stored in `sessions`. Login is `POST /api/auth/login`; it returns the raw token in JSON but **does not set an HTTP cookie** yet — don't assume cookie/session middleware exists.
- Seed admin login: username `admin`, password `ChangeMe123!` (hardcoded in seed only).
- Roles seeded: `administrator`, `pimpinan`, `sekretariat`, `pegawai`.
