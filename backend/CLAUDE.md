# CLAUDE.md — ptik-api

Go backend for **SI PTIK**, rewritten from the legacy Laravel `../../ptik` app using
the same clean-architecture conventions as `../../flow-connect/backend`.
Frontend counterpart (React/Vite) lives at the repo root `..` in this same monorepo.

Apply senior engineering judgment. Prefer correctness and maintainability. Keep
handlers thin, business logic in services, DB access in repositories.

## Stack

| Concern | Choice |
|---------|--------|
| Router | chi v5 (`github.com/go-chi/chi/v5`) |
| DB | PostgreSQL, pgx v5 `pgxpool`, **hand-written SQL** (no ORM, no sqlc) |
| Auth | JWT HS256 access + refresh (stateless), bcrypt password hashes |
| Errors | `pkg/apperror.AppError` (code + message + private cause) |
| Responses | `pkg/response` envelope `{ data, error?, meta? }` |
| Logging | stdlib `log/slog` (structured) |
| Migrations | goose (`db/migrations/NNN_*.sql`) |
| Config | plain `os.Getenv` + validate-and-fail-fast in `config.Load()` |

## Architecture rules

- **Clean layering:** `handler` → `service` → `repository`. Handlers never touch
  the DB; repositories never contain business rules.
- **Repository interface lives in the domain package** (`internal/domain/<x>/repository.go`);
  the concrete implementation lives in `internal/repository/postgres/<x>.go`.
- **Handlers depend on a locally-defined service interface** (e.g. `DosenService`
  in `handler/dosen.go`), not the concrete `*service.Service` — this keeps them mockable.
- **Errors:** services return `apperror.New(Code…, msg)` for expected failures and
  wrap infra errors with `fmt.Errorf("<pkg>.<Type>.<Method>: %w", err)`. Handlers
  call `response.Error(w, err)` — never set error status codes by hand.
- **IDs** are minted in the service layer with a prefix: `"dosen-"+uuid.NewString()`.
- **Repos return `[]T{}` (never nil)** so JSON serializes `[]`, and not-found reads
  return `(nil, nil)` — the service maps that to `apperror.CodeNotFound`.
- Routing is wired **inline in `cmd/server/main.go`**; each handler exposes
  `func (h *H) Routes(r chi.Router)` mounted via `r.Route("/x", h.Routes)`.

## Adding a domain (recipe — the Dosen module is the reference)

To port another Laravel model (e.g. `Alumni`):

1. `internal/domain/alumni/entity.go` — `Alumni` struct + `Input` struct (JSON tags
   matching the frontend). Mirror the Laravel column names.
2. `internal/domain/alumni/repository.go` — `Repository` interface (List/GetByID/Create/Update/Delete).
3. `internal/domain/alumni/service.go` — validation, normalization, `uuid` id minting.
4. `internal/repository/postgres/alumni.go` — hand-written pgx implementing the interface.
5. `internal/handler/alumni.go` — `AlumniService` interface + `AlumniHandler` + `Routes`.
6. `db/migrations/00N_create_alumnis.sql` — goose up/down; `id TEXT PRIMARY KEY`,
   `TIMESTAMPTZ … DEFAULT NOW()`, and the shared `set_updated_at()` trigger.
7. Wire it in `cmd/server/main.go`: repo → service → handler → `r.Route("/alumni", …)`
   inside the authenticated group.

## Legacy → new mapping

Source of truth for fields is the Laravel controller's mass-assignment (the original
migrations were stubs). **All 10 data domains are ported end-to-end:** `dosen`, `alumni`,
`administrasi`, `penelitian`, `skripsi`, `skripsi_alumni` (pkg `skripsialumni`, route
`/skripsi-alumni`), `sempro`, `wisudawan`, `sumbangan`, `microsoft`. `dosen`/`alumni`
were written by hand; the other 8 were generated from the same template and verified.

File/photo fields (`file`, `foto`) are stored as **TEXT columns holding a URL/path** —
there is no upload endpoint yet. Add a multipart upload service (adapt flow-connect's
media pattern) if real file storage is needed.

## Commands

```bash
make dev            # go run ./cmd/server
make build          # static binary -> bin/server
make test           # go test -race -cover ./...
make migrate-up     # goose up   (needs DATABASE_URL)
make seed           # default admin + sample dosen
make up             # docker compose: postgres + migrate + seed + api
```

## Security & features

- **RBAC:** access tokens carry a `role` claim. `mw.WriteGuard("super_admin","admin")`
  wraps the protected group — any authenticated user may **read** (GET), but only admin
  roles may **write** (POST/PUT/PATCH/DELETE). `dosen`/`mahasiswa` are read-only.
  `mw.RequireRole(...)` blocks **all** methods for non-listed roles (used to hide the
  `/users` management API entirely from `dosen`/`mahasiswa`; `/users/me` stays open).
- **User management (`/users`):** super_admin/admin only. `super_admin` may assign any
  role; `admin` may only create/edit/delete `dosen`/`mahasiswa` (enforced in `user.Service`
  via `canAssign`, not just the frontend). Password reset is `PUT /users/{id}/password`.
- **Menu access (`/menu-access`):** per-role sidebar config for `dosen`/`mahasiswa`
  (`role_menus` table, JSONB `menu_keys` = visible, `write_keys` = CRUD-allowed ⊆ `menu_keys`).
  GET is readable by any authenticated user (a dosen needs its own config to render the sidebar
  + know its rights); PUT is admin-gated.
- **Per-menu write permission:** `mw.CRUDGuard(adminRoles, canWrite)` replaces the old blanket
  `WriteGuard` on the protected group. Reads are always allowed; writes pass for admin roles,
  else `canWrite(role, menuKey)` consults `menuaccess.Service.CanWrite` (menuKey = first path
  segment, e.g. `/api/v1/dosen/x` → `dosen`). `/upload` is allowed if the role has any write
  grant (`HasAnyWrite`). `/content`, `/users`, `/menu-access` are never in a lower role's
  `write_keys`, so they stay admin-only.
- **Token revocation:** refresh tokens are **opaque, stored hashed** in `refresh_tokens`
  (not stateless). Refresh rotates (revoke old + issue new); `POST /auth/logout` revokes.
- **File upload:** `POST /api/v1/upload` (multipart, admin-only) saves to `UPLOAD_DIR`
  (local disk) and returns a URL; files are served read-only at `/uploads/*`. Swap for
  S3/MinIO in production by replacing `UploadHandler`.

## Deliberate simplifications vs flow-connect

Kept lean for a single-tenant campus app; add back if needed:
- **No Redis** — refresh tokens live in Postgres instead.
- **No company/tenant scope** — flow-connect's `X-Company-ID` middleware is omitted.
- **No OTel.** Object storage is local disk (not MinIO/S3).
