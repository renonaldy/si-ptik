-- +goose Up
-- +goose StatementBegin

-- Extra landing-page content: intro blurbs for the Penilaian/Hadiah cards,
-- a hashtag list, and a copy-paste caption template (matches the reference
-- design's "Wajib Pakai Hashtag" + "Template Caption" blocks).
ALTER TABLE challenges
    ADD COLUMN penilaian_intro TEXT NOT NULL DEFAULT '',
    ADD COLUMN hadiah_intro TEXT NOT NULL DEFAULT '',
    ADD COLUMN hashtags JSONB NOT NULL DEFAULT '[]',
    ADD COLUMN caption_template TEXT NOT NULL DEFAULT '';

-- +goose StatementEnd

-- +goose Down
-- +goose StatementBegin
ALTER TABLE challenges
    DROP COLUMN IF EXISTS penilaian_intro,
    DROP COLUMN IF EXISTS hadiah_intro,
    DROP COLUMN IF EXISTS hashtags,
    DROP COLUMN IF EXISTS caption_template;
-- +goose StatementEnd
