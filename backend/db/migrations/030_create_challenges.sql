-- +goose Up
-- +goose StatementBegin

CREATE TABLE challenges (
    id TEXT PRIMARY KEY,
    judul TEXT NOT NULL DEFAULT '',
    deskripsi TEXT NOT NULL DEFAULT '',
    poster TEXT NOT NULL DEFAULT '',
    lampiran TEXT NOT NULL DEFAULT '',
    link_daftar TEXT NOT NULL DEFAULT '',
    tanggal_mulai TEXT NOT NULL DEFAULT '',
    tanggal_selesai TEXT NOT NULL DEFAULT '',
    status TEXT NOT NULL DEFAULT 'aktif',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_challenges_status ON challenges (status);

CREATE TRIGGER trg_challenges_updated_at
    BEFORE UPDATE ON challenges
    FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- +goose StatementEnd

-- +goose Down
-- +goose StatementBegin
DROP TRIGGER IF EXISTS trg_challenges_updated_at ON challenges;
DROP TABLE IF EXISTS challenges;
-- +goose StatementEnd
