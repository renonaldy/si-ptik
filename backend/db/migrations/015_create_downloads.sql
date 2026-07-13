-- +goose Up
-- +goose StatementBegin

CREATE TABLE downloads (
    id TEXT PRIMARY KEY,
    judul TEXT NOT NULL DEFAULT '',
    keterangan TEXT NOT NULL DEFAULT '',
    kategori TEXT NOT NULL DEFAULT '',
    file TEXT NOT NULL DEFAULT '',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_downloads_judul ON downloads (judul);

CREATE TRIGGER trg_downloads_updated_at
    BEFORE UPDATE ON downloads
    FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- +goose StatementEnd

-- +goose Down
-- +goose StatementBegin
DROP TRIGGER IF EXISTS trg_downloads_updated_at ON downloads;
DROP TABLE IF EXISTS downloads;
-- +goose StatementEnd
