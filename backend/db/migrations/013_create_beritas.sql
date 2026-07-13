-- +goose Up
-- +goose StatementBegin

CREATE TABLE beritas (
    id TEXT PRIMARY KEY,
    judul TEXT NOT NULL DEFAULT '',
    ringkasan TEXT NOT NULL DEFAULT '',
    konten TEXT NOT NULL DEFAULT '',
    gambar TEXT NOT NULL DEFAULT '',
    penulis TEXT NOT NULL DEFAULT '',
    tanggal TEXT NOT NULL DEFAULT '',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_beritas_judul ON beritas (judul);

CREATE TRIGGER trg_beritas_updated_at
    BEFORE UPDATE ON beritas
    FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- +goose StatementEnd

-- +goose Down
-- +goose StatementBegin
DROP TRIGGER IF EXISTS trg_beritas_updated_at ON beritas;
DROP TABLE IF EXISTS beritas;
-- +goose StatementEnd
