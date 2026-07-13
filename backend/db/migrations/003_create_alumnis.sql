-- +goose Up
-- +goose StatementBegin

CREATE TABLE alumnis (
    id             TEXT PRIMARY KEY,              -- uuid as text, minted in Go
    nama_alumni    TEXT NOT NULL,
    npm            TEXT NOT NULL DEFAULT '',
    tempat_lahir   TEXT NOT NULL DEFAULT '',
    tanggal_lahir  TEXT NOT NULL DEFAULT '',      -- ISO date string (YYYY-MM-DD)
    created_at     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at     TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_alumnis_nama ON alumnis (nama_alumni);

CREATE TRIGGER trg_alumnis_updated_at
    BEFORE UPDATE ON alumnis
    FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- +goose StatementEnd

-- +goose Down
-- +goose StatementBegin
DROP TRIGGER IF EXISTS trg_alumnis_updated_at ON alumnis;
DROP TABLE IF EXISTS alumnis;
-- +goose StatementEnd
