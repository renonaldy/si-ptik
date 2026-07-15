-- +goose Up
-- +goose StatementBegin

-- Per-account sidebar visibility + CRUD rights, replacing the old per-role
-- role_menus table. Only "configurable" accounts (dosen, mahasiswa) get a row;
-- super_admin/admin always see and manage everything, so they need no row.
CREATE TABLE user_menus (
    user_id    TEXT PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
    menu_keys  JSONB NOT NULL DEFAULT '[]',    -- visible menus, e.g. ["dashboard","dosen"]
    write_keys JSONB NOT NULL DEFAULT '[]',    -- subset of menu_keys this account may CRUD
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TRIGGER trg_user_menus_updated_at
    BEFORE UPDATE ON user_menus
    FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- The per-role table is superseded by per-account config.
DROP TABLE IF EXISTS role_menus;

-- +goose StatementEnd

-- +goose Down
-- +goose StatementBegin

-- Restore the per-role table (contents of migrations 023 + 024).
CREATE TABLE role_menus (
    role       TEXT PRIMARY KEY,
    menu_keys  JSONB NOT NULL DEFAULT '[]',
    write_keys JSONB NOT NULL DEFAULT '[]',
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TRIGGER trg_role_menus_updated_at
    BEFORE UPDATE ON role_menus
    FOR EACH ROW EXECUTE FUNCTION set_updated_at();

DROP TRIGGER IF EXISTS trg_user_menus_updated_at ON user_menus;
DROP TABLE IF EXISTS user_menus;

-- +goose StatementEnd
