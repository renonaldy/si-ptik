package postgres

import (
	"context"
	"encoding/json"
	"errors"
	"fmt"

	"ptik/internal/domain/menuaccess"

	"github.com/jackc/pgx/v5"
	"github.com/jackc/pgx/v5/pgxpool"
)

type MenuAccessRepository struct{ pool *pgxpool.Pool }

func NewMenuAccessRepository(pool *pgxpool.Pool) *MenuAccessRepository {
	return &MenuAccessRepository{pool: pool}
}

func (r *MenuAccessRepository) List(ctx context.Context) ([]menuaccess.RoleMenu, error) {
	// Cast jsonb -> text so the driver hands us plain JSON strings to unmarshal
	// (avoids relying on pgx's binary jsonb decode into a byte slice).
	rows, err := r.pool.Query(ctx, `
		SELECT role, menu_keys::text, write_keys::text, updated_at
		FROM role_menus ORDER BY role ASC`)
	if err != nil {
		return nil, fmt.Errorf("MenuAccessRepository.List: %w", err)
	}
	defer rows.Close()

	list := []menuaccess.RoleMenu{}
	for rows.Next() {
		m, err := scanRoleMenu(rows)
		if err != nil {
			return nil, err
		}
		list = append(list, *m)
	}
	return list, rows.Err()
}

func (r *MenuAccessRepository) Get(ctx context.Context, role string) (*menuaccess.RoleMenu, error) {
	row := r.pool.QueryRow(ctx, `
		SELECT role, menu_keys::text, write_keys::text, updated_at
		FROM role_menus WHERE role = $1`, role)
	m, err := scanRoleMenu(row)
	if err != nil {
		if errors.Is(err, pgx.ErrNoRows) {
			return nil, nil
		}
		return nil, err
	}
	return m, nil
}

func scanRoleMenu(row pgx.Row) (*menuaccess.RoleMenu, error) {
	var m menuaccess.RoleMenu
	var menuRaw, writeRaw string
	if err := row.Scan(&m.Role, &menuRaw, &writeRaw, &m.UpdatedAt); err != nil {
		return nil, err
	}
	if m.MenuKeys = []string{}; menuRaw != "" {
		if err := json.Unmarshal([]byte(menuRaw), &m.MenuKeys); err != nil {
			return nil, fmt.Errorf("scanRoleMenu menu_keys: %w", err)
		}
	}
	if m.WriteKeys = []string{}; writeRaw != "" {
		if err := json.Unmarshal([]byte(writeRaw), &m.WriteKeys); err != nil {
			return nil, fmt.Errorf("scanRoleMenu write_keys: %w", err)
		}
	}
	return &m, nil
}

func (r *MenuAccessRepository) Upsert(ctx context.Context, role string, menuKeys, writeKeys []string) error {
	if menuKeys == nil {
		menuKeys = []string{}
	}
	if writeKeys == nil {
		writeKeys = []string{}
	}
	menuRaw, err := json.Marshal(menuKeys)
	if err != nil {
		return fmt.Errorf("MenuAccessRepository.Upsert marshal menu_keys: %w", err)
	}
	writeRaw, err := json.Marshal(writeKeys)
	if err != nil {
		return fmt.Errorf("MenuAccessRepository.Upsert marshal write_keys: %w", err)
	}
	// Pass JSON as text and cast to jsonb so pgx encodes it correctly.
	_, err = r.pool.Exec(ctx, `
		INSERT INTO role_menus (role, menu_keys, write_keys)
		VALUES ($1, $2::jsonb, $3::jsonb)
		ON CONFLICT (role) DO UPDATE
		SET menu_keys = EXCLUDED.menu_keys, write_keys = EXCLUDED.write_keys, updated_at = NOW()
	`, role, string(menuRaw), string(writeRaw))
	if err != nil {
		return fmt.Errorf("MenuAccessRepository.Upsert: %w", err)
	}
	return nil
}
