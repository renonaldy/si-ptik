-- +goose Up
-- +goose StatementBegin

CREATE TABLE sumbangans (
    id TEXT PRIMARY KEY,
    nama_alumni TEXT NOT NULL DEFAULT '',
    npm TEXT NOT NULL DEFAULT '',
    sumbangan TEXT NOT NULL DEFAULT '',
    jumlah TEXT NOT NULL DEFAULT '',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_sumbangans_nama_alumni ON sumbangans (nama_alumni);

CREATE TRIGGER trg_sumbangans_updated_at
    BEFORE UPDATE ON sumbangans
    FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- +goose StatementEnd

-- +goose Down
-- +goose StatementBegin
DROP TRIGGER IF EXISTS trg_sumbangans_updated_at ON sumbangans;
DROP TABLE IF EXISTS sumbangans;
-- +goose StatementEnd
