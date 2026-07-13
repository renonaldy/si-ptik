-- +goose Up
-- +goose StatementBegin

CREATE TABLE wisudawans (
    id TEXT PRIMARY KEY,
    nama_wisudawan TEXT NOT NULL DEFAULT '',
    npm TEXT NOT NULL DEFAULT '',
    judul_skripsi TEXT NOT NULL DEFAULT '',
    pembimbing TEXT NOT NULL DEFAULT '',
    tanggal_sidang TEXT NOT NULL DEFAULT '',
    foto TEXT NOT NULL DEFAULT '',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_wisudawans_nama_wisudawan ON wisudawans (nama_wisudawan);

CREATE TRIGGER trg_wisudawans_updated_at
    BEFORE UPDATE ON wisudawans
    FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- +goose StatementEnd

-- +goose Down
-- +goose StatementBegin
DROP TRIGGER IF EXISTS trg_wisudawans_updated_at ON wisudawans;
DROP TABLE IF EXISTS wisudawans;
-- +goose StatementEnd
