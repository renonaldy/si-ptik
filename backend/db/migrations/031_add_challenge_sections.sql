-- +goose Up
-- +goose StatementBegin

-- Landing-page style sections for the Challenge detail page (Tema, Aturan,
-- Penilaian, Hadiah), each a JSONB array of {icon, judul, keterangan} points.
ALTER TABLE challenges
    ADD COLUMN tema_subjudul TEXT NOT NULL DEFAULT '',
    ADD COLUMN tema JSONB NOT NULL DEFAULT '[]',
    ADD COLUMN aturan JSONB NOT NULL DEFAULT '[]',
    ADD COLUMN penilaian JSONB NOT NULL DEFAULT '[]',
    ADD COLUMN hadiah JSONB NOT NULL DEFAULT '[]';

-- +goose StatementEnd

-- +goose Down
-- +goose StatementBegin
ALTER TABLE challenges
    DROP COLUMN IF EXISTS tema_subjudul,
    DROP COLUMN IF EXISTS tema,
    DROP COLUMN IF EXISTS aturan,
    DROP COLUMN IF EXISTS penilaian,
    DROP COLUMN IF EXISTS hadiah;
-- +goose StatementEnd
