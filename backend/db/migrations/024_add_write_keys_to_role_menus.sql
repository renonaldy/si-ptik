-- +goose Up
-- +goose StatementBegin
-- write_keys is the subset of menu_keys a role may also CREATE/UPDATE/DELETE on.
ALTER TABLE role_menus ADD COLUMN write_keys JSONB NOT NULL DEFAULT '[]';
-- +goose StatementEnd

-- +goose Down
-- +goose StatementBegin
ALTER TABLE role_menus DROP COLUMN write_keys;
-- +goose StatementEnd
