-- +goose Up
-- +goose StatementBegin

CREATE TABLE dosens (
    id              TEXT PRIMARY KEY,             -- uuid as text, minted in Go
    nama_dosen      TEXT NOT NULL,
    nik             TEXT NOT NULL DEFAULT '',
    nidn            TEXT NOT NULL DEFAULT '',
    no_hp           TEXT NOT NULL DEFAULT '',
    jabatan         TEXT NOT NULL DEFAULT '',
    pangkat         TEXT NOT NULL DEFAULT '',
    no_sertifikasi  TEXT NOT NULL DEFAULT '',
    status          TEXT NOT NULL DEFAULT '',
    foto            TEXT NOT NULL DEFAULT '',
    tempat_lahir    TEXT NOT NULL DEFAULT '',
    tanggal_lahir   TEXT NOT NULL DEFAULT '',     -- ISO date string (YYYY-MM-DD)
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_dosens_nama ON dosens (nama_dosen);

CREATE TRIGGER trg_dosens_updated_at
    BEFORE UPDATE ON dosens
    FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- +goose StatementEnd

-- +goose Down
-- +goose StatementBegin
DROP TRIGGER IF EXISTS trg_dosens_updated_at ON dosens;
DROP TABLE IF EXISTS dosens;
-- +goose StatementEnd
