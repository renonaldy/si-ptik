-- +goose Up
-- +goose StatementBegin

CREATE TABLE ujians (
    id          TEXT PRIMARY KEY,
    nama        TEXT NOT NULL,
    npm         TEXT NOT NULL DEFAULT '',
    jenis       TEXT NOT NULL DEFAULT 'sempro',   -- sempro | kompre
    judul       TEXT NOT NULL DEFAULT '',
    pembimbing  TEXT NOT NULL DEFAULT '',
    tanggal     TEXT NOT NULL DEFAULT '',
    ruang       TEXT NOT NULL DEFAULT '',
    status      TEXT NOT NULL DEFAULT 'akan',      -- akan | sedang | sudah
    created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_ujians_jenis_status ON ujians (jenis, status);

CREATE TRIGGER trg_ujians_updated_at
    BEFORE UPDATE ON ujians
    FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- +goose StatementEnd

-- +goose Down
-- +goose StatementBegin
DROP TRIGGER IF EXISTS trg_ujians_updated_at ON ujians;
DROP TABLE IF EXISTS ujians;
-- +goose StatementEnd
