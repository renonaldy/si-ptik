-- +goose Up
-- +goose StatementBegin
ALTER TABLE ujians ADD COLUMN foto TEXT NOT NULL DEFAULT '';
-- +goose StatementEnd

-- +goose Down
-- +goose StatementBegin
ALTER TABLE ujians DROP COLUMN IF EXISTS foto;
-- +goose StatementEnd
