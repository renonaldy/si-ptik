# CLAUDE.md — ptik-web

React frontend for **SI PTIK**, rewritten from the legacy Laravel `../ptik` Blade UI
using the same conventions as `../flow-connect`. This is a monorepo: the frontend
lives at the repo root and the Go backend lives in `./backend` (same layout as
flow-connect, where the frontend is at root and the API is under `backend/`).

## Stack

| Concern | Choice |
|---------|--------|
| Framework | Vite 5 + React 18 + TypeScript (SWC) |
| Styling | Tailwind CSS + shadcn/ui (Radix), CSS variables in `src/index.css` |
| Data | TanStack React Query v5 |
| Routing | React Router v6 (guards are layout routes via `<Outlet/>`) |
| Toasts | `sonner` (`import { toast } from "sonner"`) |
| Path alias | `@/` → `./src` (set in vite.config, tsconfig, components.json) |

## Architecture rules

- **Feature-first folders.** Group by domain, not by type: `features/<domain>/hooks`,
  `components/<domain>/`, `pages/<domain>/`.
- **Pages are smart** (own state, compose features). **Components are dumb** (props in, UI out).
- **No `fetch` in components.** All network I/O goes through `lib/api/<domain>Api.ts`,
  called from a React Query hook in `features/<domain>/hooks/`.
- **The API client (`lib/api/client.ts`) is the only place that talks HTTP.** It
  attaches the bearer token, does single-flight refresh on 401, and unwraps the
  `{ data }` envelope so callers get the payload directly. Errors throw `ApiError(code, message, status)`.
- **Domain types are colocated in the `*Api.ts` module** (e.g. `interface Dosen` in
  `dosenApi.ts`), not centralized.
- **Query keys** are arrays, first element the domain: `["dosen", { search }]`,
  `["me"]`. Mutations `invalidateQueries` the domain key.
- **Naming:** API modules `lib/api/<domain>Api.ts` (camelCase verbs `listDosen`,
  `createDosen`); hooks `features/<domain>/hooks/use<Thing>.ts`; pages
  `pages/<domain>/XxxPage.tsx` (default export); shadcn primitives lowercase
  (`button.tsx`). Feature components PascalCase.

## Adding a module (recipe — the Dosen module is the reference)

To add another domain (e.g. `alumni`) once the backend serves `/api/v1/alumni`:

1. `lib/api/alumniApi.ts` — `interface Alumni` + CRUD functions using `api.*`.
2. `features/alumni/hooks/useAlumni.ts` — `useAlumniList` (useQuery) + create/update/delete
   mutations that `invalidateQueries(["alumni"])` and `toast` on success/error.
3. `components/alumni/AlumniTable.tsx` + `AlumniFormDialog.tsx`.
4. `pages/alumni/AlumniPage.tsx` — wraps `AppLayout`, wires query + mutations + dialog.
5. Add a route in `App.tsx` (inside `<Route element={<RequireAuth/>}>`) and a nav
   entry in `components/layout/AppSidebar.tsx` (`NAV_ITEMS`).

## Backend contract

Talks to the Go backend in `./backend`. Envelope: success `{ data: T }`, error `{ error: { code, message } }`.
Auth: `POST /auth/login` → `{ access_token, refresh_token }` (stored in localStorage);
`GET /users/me` backs the auth guard. Base URL from `VITE_API_URL` (defaults to the
dev proxy `/api` → `http://localhost:8081`).

## Site content CMS

Static public content (Beranda hero/stats, Visi & Misi, Akademik, Kewirausahaan, Kontak) is
**editable by admin** via a key-value store. Backend: `content` domain → `GET /public/content`
(no-auth read) + `GET/PUT /content` (admin). Admin edits at `/kelola/pengaturan`
(`pages/pengaturan/PengaturanSitusPage.tsx`, grouped form, bulk save). Public pages read via
`features/content/useSiteContent.ts` — `get(key, fallback)` / `getList(key, fallback[])` (newline
→ array), always with a fallback to the previous static text so nothing breaks if a key is missing.

## Public website (front door)

`/` is the **public program-studi website** (no login), wrapped in `components/layout/PublicLayout`
(nav + footer). Public pages live in `pages/public/`: Home, Berita (+`/berita/:id`), Galeri,
Visi-Misi, Kewirausahaan (IT Solution), Download, Kontak, Daftar (`AkademikPage` is public too).
They read via `lib/api/publicApi.ts` (no-auth `/public/*`); Daftar & Kontak forms `submitPendaftaran`
into the admin inbox. The **internal app** lives behind auth at `/dashboard` + domain routes;
content domains `berita/galeri/promosi/download/pendaftaran` are managed at `/kelola/*` (sidebar "Konten Publik").
**Promosi** (`/promosi/flyer` + `/promosi/video`, navbar dropdown) holds flyers (uploaded image or
Google Drive link; lightbox + download) and promo videos (upload / YouTube link / Google Drive link,
file or folder) — resolved to a player/embed by `lib/videoEmbed.ts` (`videoEmbed`/`flyerMedia`).
Login redirects to `/dashboard`.

## Design system (premium "Modern SaaS")

- **Per-domain accent colors** in `lib/moduleColors.ts` (`ModuleKey`, `MODULE_VAR`, `CHART_ORDER`,
  `accentStyle`). Set `--ma` ONCE on a wrapper via `style={accentStyle(key)}`; children read
  `hsl(var(--ma)/x)`. The variable is **`--ma`** — never `--accent` (a live token). Discipline: color is
  a **content-level** channel only (icon tiles, bars, donut, keylines, row-hover); chrome (sidebar,
  primary buttons, links, focus) stays violet `--primary`. Every color use carries a text label too (a11y).
- **Atmosphere utilities** in `index.css`: `.bg-app-aurora` (page ground), `.card-hairline` (gradient top
  edge), `.shadow-glow-hover`, `.bg-hero-aurora`, `.bg-mesh` (login), `.bg-grid`, plus motion
  (`.rise-in`, `.animate-aurora`) gated by `prefers-reduced-motion`.
- **Inline-SVG charts** (no chart deps): `Sparkline`, `DonutChart`, and the dashboard bar list; a counts
  chart uses a single hue, not a rainbow. `ChartCard` is the titled shell; `ModuleCard` the domain tile.
- **Display font** Fraunces (`font-display`) on hero/section headings + large numerals; body stays Inter.
- `StatCard` takes optional `accentKey` + `series` (backward-compatible). `AppLayout fluid` widens the
  dashboard to 1600px so it fills wide screens.

## Features

- **RBAC (frontend):** `me.role` drives `canManage(role)` (`features/auth/permissions.ts`).
  Non-admin roles (`dosen`/`mahasiswa`) get read-only pages — create/edit/delete UI is hidden.
  Four roles: `super_admin` (everything + System Version footer), `admin` (everything **except**
  System Version — gated by `isSuperAdmin`), `dosen`/`mahasiswa` (read-only, restricted sidebar).
- **Menu RBAC:** the sidebar is defined once in `lib/menu.ts` (`MENU`, `MenuKey`, `adminOnly`, `crud`).
  Admins see all; `dosen`/`mahasiswa` see only keys granted per-role via the **Hak Akses Menu**
  page (`/kelola/akses`, `features/menuAccess`, backend `role_menus`). `dashboard` is always on.
  `components/auth/RouteAccess` enforces the same rules per-route (admins bypass; `adminOnly`
  pages redirect lower roles to `/dashboard`).
- **Per-menu CRUD for lower roles:** `role_menus.write_keys` (⊆ `menu_keys`) grants a
  `dosen`/`mahasiswa` create/edit/delete on a specific menu. The Hak Akses Menu page has a
  **Kelola** toggle per menu (only for items with `crud: true`). Pages call
  `useCanWrite(menuKey)` (`features/auth/useMenuPermissions`) instead of `canManage(role)` to
  decide whether to show create/edit/delete UI — admins always true. Backend enforces it too
  (see backend CLAUDE.md `CRUDGuard`), so hiding the UI is not the only line of defense.
- **User management:** admins create/edit/delete accounts + reset passwords at `/kelola/pengguna`
  (`pages/pengguna`, `features/users`, backend `/users`). `super_admin` may assign any role;
  `admin` may only manage `dosen`/`mahasiswa` (`assignableRoles`, enforced server-side too).
- **Dark mode:** `lib/theme.ts` toggles the `.dark` class (persisted); toggle lives in the
  TopBar `UserMenu`. Applied on load in `App.tsx`.
- **File upload:** `FileUploadField` (used in forms for `file`/`foto`) posts to `/upload`
  via `lib/api/uploadApi.ts` and stores the returned URL.
- **Pagination:** client-side (`components/shared/Pagination.tsx`), `PAGE_SIZE=10` per list.
- **Public pages:** `LandingPage` (`/landing`) and `AkademikPage` (`/akademik`) render
  outside the auth guard. `ErrorBoundary` wraps all routes.
- **Tests:** Vitest + Testing Library (`bun run test`). Test files are excluded from `tsc`.

## Deliberate simplifications vs flow-connect

Lean subset — add back from `../flow-connect` if needed: PWA/service worker, the Radix
`use-toast` system (we use `sonner` only), `next-themes`, `react-hook-form`+`zod` (forms
are plain controlled `useState`), and server-side pagination.
