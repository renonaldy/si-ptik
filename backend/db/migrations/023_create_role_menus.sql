-- +goose Up
-- +goose StatementBegin

-- Per-role sidebar visibility. Only "configurable" roles (dosen, mahasiswa) are
-- stored here; super_admin/admin always see everything so they need no row.
CREATE TABLE role_menus (
    role       TEXT PRIMARY KEY,               -- 'dosen' | 'mahasiswa'
    menu_keys  JSONB NOT NULL DEFAULT '[]',    -- array of menu keys, e.g. ["dashboard","dosen"]
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TRIGGER trg_role_menus_updated_at
    BEFORE UPDATE ON role_menus
    FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- +goose StatementEnd

-- +goose Down
-- +goose StatementBegin
DROP TRIGGER IF EXISTS trg_role_menus_updated_at ON role_menus;
DROP TABLE IF EXISTS role_menus;
-- +goose StatementEnd
