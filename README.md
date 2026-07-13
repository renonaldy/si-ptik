# SI PTIK

Full-stack rewrite of the legacy Laravel `ptik` program-studi system, following the
same monorepo layout as `flow-connect`: the **React frontend lives at the repo root**
and the **Go backend lives in [`backend/`](backend/)**.

- **Frontend:** Vite 5 + React 18 + TypeScript + Tailwind + shadcn/ui · TanStack Query v5 · React Router v6
- **Backend:** Go (clean architecture) · chi router · pgx/v5 + PostgreSQL · goose migrations · JWT auth

## Layout

```
si-ptik/
  src/            # React frontend (feature-first: components/, features/, lib/, pages/)
  public/ index.html vite.config.ts tailwind.config.ts …   # frontend config at root
  backend/        # Go API — cmd/{server,seed}, internal/{domain,handler,repository}, pkg/, db/migrations
```

## Quickstart

**1. Backend** (Postgres + API) — from [`backend/`](backend/):

```bash
cd backend
make up            # starts Postgres + runs migrations + seeds + serves API on :8091
```

**2. Frontend** — from the repo root:

```bash
bun install                   # (or: npm install)
cp .env.example .env          # optional — defaults to the Vite proxy
bun run dev                   # http://localhost:8080  (proxies /api -> backend)
```

Default login: `admin@ptik.id` / `admin12345`
(also `dosen@ptik.id` / `dosen12345`, `mahasiswa@ptik.id` / `mahasiswa12345`).

## Frontend scripts

```bash
bun run build                              # production build -> dist/
bun run lint                               # eslint
bunx tsc --noEmit -p tsconfig.app.json     # type-check (vite build uses SWC, no typecheck)
bun run test                               # vitest
```

## Frontend structure

```
src/
  components/
    ui/            # shadcn/ui primitives (button, input, dialog, table, …)
    layout/        # AppLayout, AppSidebar, TopBar, PublicLayout
    <domain>/      # <Domain>Table, <Domain>FormDialog  (one folder per domain)
  features/
    auth/          # useAuth (login/logout/token), useMe (guard)
    <domain>/hooks/# use<Domain> (list + create/update/delete mutations)
  lib/
    api/           # config.ts, client.ts (fetch + refresh + envelope), <domain>Api.ts
    moduleColors.ts, utils.ts
  pages/           # LoginPage, DashboardPage, <domain>/<Domain>Page, public/*, NotFound
  App.tsx          # providers + guarded routes
  main.tsx
```

Ported data domains: `dosen, alumni, administrasi, penelitian, skripsi, skripsi-alumni,
sempro, wisudawan, sumbangan, microsoft` — plus content CMS, berita, galeri, download,
pendaftaran, and exam scheduling (`ujian`).

See [CLAUDE.md](CLAUDE.md) (frontend) and [backend/CLAUDE.md](backend/CLAUDE.md) (backend)
for conventions and how to add a module.
