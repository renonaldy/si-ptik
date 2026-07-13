-- +goose Up
-- +goose StatementBegin
ALTER TABLE ujians ADD COLUMN file_skripsi TEXT NOT NULL DEFAULT '';
ALTER TABLE ujians ADD COLUMN file_ppt TEXT NOT NULL DEFAULT '';
-- +goose StatementEnd

-- +goose Down
-- +goose StatementBegin
ALTER TABLE ujians DROP COLUMN IF EXISTS file_skripsi;
ALTER TABLE ujians DROP COLUMN IF EXISTS file_ppt;
-- +goose StatementEnd
