-- +goose Up
-- +goose StatementBegin

CREATE TABLE skripsi_alumnis (
    id TEXT PRIMARY KEY,
    nama_alumni TEXT NOT NULL DEFAULT '',
    npm TEXT NOT NULL DEFAULT '',
    judul_skripsi TEXT NOT NULL DEFAULT '',
    pembimbing TEXT NOT NULL DEFAULT '',
    file TEXT NOT NULL DEFAULT '',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_skripsi_alumnis_nama_alumni ON skripsi_alumnis (nama_alumni);

CREATE TRIGGER trg_skripsi_alumnis_updated_at
    BEFORE UPDATE ON skripsi_alumnis
    FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- +goose StatementEnd

-- +goose Down
-- +goose StatementBegin
DROP TRIGGER IF EXISTS trg_skripsi_alumnis_updated_at ON skripsi_alumnis;
DROP TABLE IF EXISTS skripsi_alumnis;
-- +goose StatementEnd
