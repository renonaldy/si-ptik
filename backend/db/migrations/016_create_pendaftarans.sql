-- +goose Up
-- +goose StatementBegin

CREATE TABLE pendaftarans (
    id TEXT PRIMARY KEY,
    nama TEXT NOT NULL DEFAULT '',
    email TEXT NOT NULL DEFAULT '',
    no_hp TEXT NOT NULL DEFAULT '',
    asal_sekolah TEXT NOT NULL DEFAULT '',
    jenis TEXT NOT NULL DEFAULT '',
    pesan TEXT NOT NULL DEFAULT '',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_pendaftarans_nama ON pendaftarans (nama);

CREATE TRIGGER trg_pendaftarans_updated_at
    BEFORE UPDATE ON pendaftarans
    FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- +goose StatementEnd

-- +goose Down
-- +goose StatementBegin
DROP TRIGGER IF EXISTS trg_pendaftarans_updated_at ON pendaftarans;
DROP TABLE IF EXISTS pendaftarans;
-- +goose StatementEnd
