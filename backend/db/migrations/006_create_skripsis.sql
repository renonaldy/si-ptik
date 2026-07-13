-- +goose Up
-- +goose StatementBegin

CREATE TABLE skripsis (
    id TEXT PRIMARY KEY,
    nama TEXT NOT NULL DEFAULT '',
    npm TEXT NOT NULL DEFAULT '',
    judul_skripsi TEXT NOT NULL DEFAULT '',
    pembimbing TEXT NOT NULL DEFAULT '',
    file TEXT NOT NULL DEFAULT '',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_skripsis_nama ON skripsis (nama);

CREATE TRIGGER trg_skripsis_updated_at
    BEFORE UPDATE ON skripsis
    FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- +goose StatementEnd

-- +goose Down
-- +goose StatementBegin
DROP TRIGGER IF EXISTS trg_skripsis_updated_at ON skripsis;
DROP TABLE IF EXISTS skripsis;
-- +goose StatementEnd
