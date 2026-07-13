-- +goose Up
-- +goose StatementBegin

CREATE TABLE microsofts (
    id TEXT PRIMARY KEY,
    nama TEXT NOT NULL DEFAULT '',
    email TEXT NOT NULL DEFAULT '',
    jenis_pelatihan TEXT NOT NULL DEFAULT '',
    tanggal_pelatihan TEXT NOT NULL DEFAULT '',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_microsofts_nama ON microsofts (nama);

CREATE TRIGGER trg_microsofts_updated_at
    BEFORE UPDATE ON microsofts
    FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- +goose StatementEnd

-- +goose Down
-- +goose StatementBegin
DROP TRIGGER IF EXISTS trg_microsofts_updated_at ON microsofts;
DROP TABLE IF EXISTS microsofts;
-- +goose StatementEnd
