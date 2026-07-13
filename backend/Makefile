.PHONY: dev build test tidy seed \
        migrate-up migrate-down migrate-status migrate-reset \
        up down nuke restart logs ps infra infra-down db-shell docker-build

# ── Local development (native) ──────────────────────────────────────────────
dev:
	go run ./cmd/server

tidy:
	go mod tidy

build:
	CGO_ENABLED=0 go build -ldflags="-s -w" -o bin/server ./cmd/server

test:
	go test -race -cover ./...

seed:
	@. ./.env 2>/dev/null || true; \
	go run ./cmd/seed

# ── Migrations (requires DATABASE_URL) — goose ──────────────────────────────
migrate-up:
	@. ./.env 2>/dev/null || true; \
	goose -dir db/migrations postgres "$(DATABASE_URL)" up
migrate-down:
	@. ./.env 2>/dev/null || true; \
	goose -dir db/migrations postgres "$(DATABASE_URL)" down 1
migrate-status:
	@. ./.env 2>/dev/null || true; \
	goose -dir db/migrations postgres "$(DATABASE_URL)" status
migrate-reset:
	@. ./.env 2>/dev/null || true; \
	goose -dir db/migrations postgres "$(DATABASE_URL)" reset

# ── Docker Compose (local dev) ──────────────────────────────────────────────
up:            # infra + api hot-reload + migrate + seed
	docker compose up --build
infra:         # only postgres
	docker compose up postgres --wait
infra-down:
	docker compose stop postgres
down:          # remove containers, KEEP volumes
	docker compose down
nuke:          # remove containers AND volumes
	docker compose down -v
restart:
	docker compose restart api
logs:
	docker compose logs -f
ps:
	docker compose ps
db-shell:
	docker compose exec postgres psql -U $${POSTGRES_USER:-ptik} -d $${POSTGRES_DB:-ptik_dev}

docker-build:
	docker build -t ptik-api:local .
