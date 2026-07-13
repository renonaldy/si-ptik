-- +goose Up
-- +goose StatementBegin
ALTER TABLE ujians ADD COLUMN jam TEXT NOT NULL DEFAULT '';
ALTER TABLE ujians ADD COLUMN jam_selesai TEXT NOT NULL DEFAULT '';
-- +goose StatementEnd

-- +goose Down
-- +goose StatementBegin
ALTER TABLE ujians DROP COLUMN IF EXISTS jam;
ALTER TABLE ujians DROP COLUMN IF EXISTS jam_selesai;
-- +goose StatementEnd
