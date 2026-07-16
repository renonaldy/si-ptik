-- +goose Up
-- +goose StatementBegin

CREATE TABLE promosis (
    id TEXT PRIMARY KEY,
    judul TEXT NOT NULL DEFAULT '',
    tipe TEXT NOT NULL DEFAULT 'flyer',
    media TEXT NOT NULL DEFAULT '',
    sumber TEXT NOT NULL DEFAULT '',
    keterangan TEXT NOT NULL DEFAULT '',
    tanggal TEXT NOT NULL DEFAULT '',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_promosis_tipe ON promosis (tipe);

CREATE TRIGGER trg_promosis_updated_at
    BEFORE UPDATE ON promosis
    FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- +goose StatementEnd

-- +goose Down
-- +goose StatementBegin
DROP TRIGGER IF EXISTS trg_promosis_updated_at ON promosis;
DROP TABLE IF EXISTS promosis;
-- +goose StatementEnd
