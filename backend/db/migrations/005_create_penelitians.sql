-- +goose Up
-- +goose StatementBegin

CREATE TABLE penelitians (
    id TEXT PRIMARY KEY,
    nama_penelitian TEXT NOT NULL DEFAULT '',
    jenis_penelitian TEXT NOT NULL DEFAULT '',
    author TEXT NOT NULL DEFAULT '',
    tanggal TEXT NOT NULL DEFAULT '',
    file TEXT NOT NULL DEFAULT '',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_penelitians_nama_penelitian ON penelitians (nama_penelitian);

CREATE TRIGGER trg_penelitians_updated_at
    BEFORE UPDATE ON penelitians
    FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- +goose StatementEnd

-- +goose Down
-- +goose StatementBegin
DROP TRIGGER IF EXISTS trg_penelitians_updated_at ON penelitians;
DROP TABLE IF EXISTS penelitians;
-- +goose StatementEnd
