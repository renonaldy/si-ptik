-- +goose Up
-- +goose StatementBegin
ALTER TABLE ujians ADD COLUMN penguji1 TEXT NOT NULL DEFAULT '';
ALTER TABLE ujians ADD COLUMN penguji2 TEXT NOT NULL DEFAULT '';
-- +goose StatementEnd

-- +goose Down
-- +goose StatementBegin
ALTER TABLE ujians DROP COLUMN IF EXISTS penguji1;
ALTER TABLE ujians DROP COLUMN IF EXISTS penguji2;
-- +goose StatementEnd
