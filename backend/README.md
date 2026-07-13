# ptik-api

Go backend for **SI PTIK** — a rewrite of the legacy Laravel `ptik` app into a
clean-architecture Go service, following the same conventions as `flow-connect`.

- **Router:** chi v5 · **DB:** PostgreSQL via pgx v5 (`pgxpool`, hand-written SQL)
- **Auth:** JWT (HS256) access + refresh tokens (stateless) · **Logging:** `log/slog`
- **Migrations:** goose · **Envelope:** `{ data, error, meta }`

## Layout

```
cmd/
  server/            # HTTP entrypoint (wires config→db→repos→services→handlers→router)
  seed/              # inserts a default admin + sample dosen
internal/
  config/            # env loading (validate-and-fail-fast)
  domain/<x>/        # entity.go + repository.go (interface) + service.go  — pure logic
  handler/           # thin HTTP handlers; middleware/ (auth, cors, logger, recover)
  repository/postgres/  # hand-written pgx implementations of domain repositories
pkg/
  apperror/          # typed, client-safe errors
  response/          # JSON envelope writers + error→status mapping
  jwtutil/           # access/refresh token signing & validation
db/migrations/       # goose SQL migrations (NNN_name.sql, up+down in one file)
```

## Quickstart (Docker — recommended)

```bash
cp .env.example .env          # then set a real JWT_SECRET (>= 32 chars)
docker compose up --build     # postgres + migrate + seed + api (hot-reload)
```

API is served at `http://localhost:${API_PORT:-8081}`. Default login after seed:
`admin@ptik.id` / `admin12345`.

## Quickstart (native)

Requires Go 1.25+, a running Postgres, and `goose` (`go install github.com/pressly/goose/v3/cmd/goose@latest`).

```bash
cp .env.example .env          # set DATABASE_URL + JWT_SECRET
export $(grep -v '^#' .env | xargs)   # or `. .env` in bash

make migrate-up               # apply schema
make seed                     # default admin + sample dosen
make dev                      # go run ./cmd/server
```

> **Port note (this machine):** a native PostgreSQL already listens on `5433` and
> `flow-connect` uses API port `8081`. If you hit "address already in use" or auth
> failures, change `POSTGRES_PORT` / `API_PORT` / `PORT` in `.env`.

## API surface

| Method | Path                     | Auth | Description            |
|--------|--------------------------|------|------------------------|
| GET    | `/healthz`               | no   | liveness + db ping     |
| POST   | `/api/v1/auth/login`     | no   | `{email,password}` → token pair |
| POST   | `/api/v1/auth/refresh`   | no   | `{refresh_token}` → rotated pair |
| POST   | `/api/v1/auth/logout`    | no   | `{refresh_token}` → revoke (204) |
| GET    | `/api/v1/users/me`       | yes  | current user           |
| POST   | `/api/v1/upload`         | admin| multipart file → `{url}` |
| GET    | `/api/v1/dosen?search=`  | yes  | list dosen             |
| POST   | `/api/v1/dosen`          | yes  | create dosen           |
| GET    | `/api/v1/dosen/{id}`     | yes  | get one                |
| PUT    | `/api/v1/dosen/{id}`     | yes  | update                 |
| DELETE | `/api/v1/dosen/{id}`     | yes  | delete (204)           |
| *(same CRUD 5 routes)* | `/api/v1/<domain>` | yes | for each domain below |
| GET | `/api/v1/public/berita` · `/berita/{id}` · `/galeri` · `/download` | **no** | public-site reads |
| POST | `/api/v1/public/pendaftaran` | **no** | public Daftar/Kontak form submissions |

**Ported academic domains** (standard 5-route CRUD `GET /`, `POST /`, `GET /{id}`,
`PUT /{id}`, `DELETE /{id}` with `?search=`, admin-write):
`dosen`, `alumni`, `administrasi`, `penelitian`, `skripsi`, `skripsi-alumni`,
`sempro`, `wisudawan`, `sumbangan`, `microsoft`.

**Public-site content domains** (admin-managed CRUD **+ public read** at `/public/*`):
`berita`, `galeri`, `download`, and `pendaftaran` (public **create**; admin list/delete = inbox).

See [CLAUDE.md](CLAUDE.md) for architecture conventions and how to add a new domain.
