-- +goose Up
-- +goose StatementBegin

CREATE TABLE galeris (
    id TEXT PRIMARY KEY,
    judul TEXT NOT NULL DEFAULT '',
    gambar TEXT NOT NULL DEFAULT '',
    keterangan TEXT NOT NULL DEFAULT '',
    tanggal TEXT NOT NULL DEFAULT '',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_galeris_judul ON galeris (judul);

CREATE TRIGGER trg_galeris_updated_at
    BEFORE UPDATE ON galeris
    FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- +goose StatementEnd

-- +goose Down
-- +goose StatementBegin
DROP TRIGGER IF EXISTS trg_galeris_updated_at ON galeris;
DROP TABLE IF EXISTS galeris;
-- +goose StatementEnd
