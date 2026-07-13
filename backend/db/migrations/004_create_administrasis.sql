-- +goose Up
-- +goose StatementBegin

CREATE TABLE administrasis (
    id TEXT PRIMARY KEY,
    nama TEXT NOT NULL DEFAULT '',
    npm TEXT NOT NULL DEFAULT '',
    kategori TEXT NOT NULL DEFAULT '',
    file TEXT NOT NULL DEFAULT '',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_administrasis_nama ON administrasis (nama);

CREATE TRIGGER trg_administrasis_updated_at
    BEFORE UPDATE ON administrasis
    FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- +goose StatementEnd

-- +goose Down
-- +goose StatementBegin
DROP TRIGGER IF EXISTS trg_administrasis_updated_at ON administrasis;
DROP TABLE IF EXISTS administrasis;
-- +goose StatementEnd
