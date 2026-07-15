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

func (r *MenuAccessRepository) List(ctx context.Context) ([]menuaccess.UserMenu, error) {
	// Cast jsonb -> text so the driver hands us plain JSON strings to unmarshal
	// (avoids relying on pgx's binary jsonb decode into a byte slice).
	rows, err := r.pool.Query(ctx, `
		SELECT user_id, menu_keys::text, write_keys::text, updated_at
		FROM user_menus ORDER BY user_id ASC`)
	if err != nil {
		return nil, fmt.Errorf("MenuAccessRepository.List: %w", err)
	}
	defer rows.Close()

	list := []menuaccess.UserMenu{}
	for rows.Next() {
		m, err := scanUserMenu(rows)
		if err != nil {
			return nil, err
		}
		list = append(list, *m)
	}
	return list, rows.Err()
}

func (r *MenuAccessRepository) Get(ctx context.Context, userID string) (*menuaccess.UserMenu, error) {
	row := r.pool.QueryRow(ctx, `
		SELECT user_id, menu_keys::text, write_keys::text, updated_at
		FROM user_menus WHERE user_id = $1`, userID)
	m, err := scanUserMenu(row)
	if err != nil {
		if errors.Is(err, pgx.ErrNoRows) {
			return nil, nil
		}
		return nil, err
	}
	return m, nil
}

func scanUserMenu(row pgx.Row) (*menuaccess.UserMenu, error) {
	var m menuaccess.UserMenu
	var menuRaw, writeRaw string
	if err := row.Scan(&m.UserID, &menuRaw, &writeRaw, &m.UpdatedAt); err != nil {
		return nil, err
	}
	if m.MenuKeys = []string{}; menuRaw != "" {
		if err := json.Unmarshal([]byte(menuRaw), &m.MenuKeys); err != nil {
			return nil, fmt.Errorf("scanUserMenu menu_keys: %w", err)
		}
	}
	if m.WriteKeys = []string{}; writeRaw != "" {
		if err := json.Unmarshal([]byte(writeRaw), &m.WriteKeys); err != nil {
			return nil, fmt.Errorf("scanUserMenu write_keys: %w", err)
		}
	}
	return &m, nil
}

func (r *MenuAccessRepository) Upsert(ctx context.Context, userID string, menuKeys, writeKeys []string) error {
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
		INSERT INTO user_menus (user_id, menu_keys, write_keys)
		VALUES ($1, $2::jsonb, $3::jsonb)
		ON CONFLICT (user_id) DO UPDATE
		SET menu_keys = EXCLUDED.menu_keys, write_keys = EXCLUDED.write_keys, updated_at = NOW()
	`, userID, string(menuRaw), string(writeRaw))
	if err != nil {
		return fmt.Errorf("MenuAccessRepository.Upsert: %w", err)
	}
	return nil
}
