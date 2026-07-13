-- +goose Up
-- +goose StatementBegin

CREATE TABLE sempros (
    id TEXT PRIMARY KEY,
    nama TEXT NOT NULL DEFAULT '',
    npm TEXT NOT NULL DEFAULT '',
    judul TEXT NOT NULL DEFAULT '',
    pembimbing TEXT NOT NULL DEFAULT '',
    file TEXT NOT NULL DEFAULT '',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_sempros_nama ON sempros (nama);

CREATE TRIGGER trg_sempros_updated_at
    BEFORE UPDATE ON sempros
    FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- +goose StatementEnd

-- +goose Down
-- +goose StatementBegin
DROP TRIGGER IF EXISTS trg_sempros_updated_at ON sempros;
DROP TABLE IF EXISTS sempros;
-- +goose StatementEnd
