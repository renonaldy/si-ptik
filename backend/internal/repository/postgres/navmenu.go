package postgres

import (
	"context"
	"encoding/json"
	"errors"
	"fmt"

	"ptik/internal/domain/navmenu"

	"github.com/jackc/pgx/v5"
	"github.com/jackc/pgx/v5/pgxpool"
)

type NavMenuRepository struct{ pool *pgxpool.Pool }

func NewNavMenuRepository(pool *pgxpool.Pool) *NavMenuRepository {
	return &NavMenuRepository{pool: pool}
}

// items is cast to ::text so pgx hands back a plain string to unmarshal (same
// convention as ChallengeRepository) instead of relying on binary jsonb decode.
const navMenuColumns = `id, type, label, path, external, items::text, order_index, created_at, updated_at`

func scanNavItem(row pgx.Row, x *navmenu.NavItem) error {
	var itemsRaw string
	if err := row.Scan(
		&x.ID, &x.Type, &x.Label, &x.Path, &x.External, &itemsRaw, &x.OrderIndex,
		&x.CreatedAt, &x.UpdatedAt,
	); err != nil {
		return err
	}
	var err error
	if x.Items, err = unmarshalLeaves(itemsRaw); err != nil {
		return err
	}
	return nil
}

func unmarshalLeaves(raw string) ([]navmenu.NavLeaf, error) {
	leaves := []navmenu.NavLeaf{}
	if raw == "" || raw == "null" {
		return leaves, nil
	}
	if err := json.Unmarshal([]byte(raw), &leaves); err != nil {
		return nil, fmt.Errorf("unmarshal leaves: %w", err)
	}
	return leaves, nil
}

func marshalLeaves(leaves []navmenu.NavLeaf) (string, error) {
	if leaves == nil {
		leaves = []navmenu.NavLeaf{}
	}
	b, err := json.Marshal(leaves)
	if err != nil {
		return "", err
	}
	return string(b), nil
}

func (r *NavMenuRepository) List(ctx context.Context) ([]navmenu.NavItem, error) {
	rows, err := r.pool.Query(ctx, `SELECT `+navMenuColumns+` FROM nav_menu_items ORDER BY order_index ASC, created_at ASC`)
	if err != nil {
		return nil, fmt.Errorf("NavMenuRepository.List: %w", err)
	}
	defer rows.Close()

	list := []navmenu.NavItem{}
	for rows.Next() {
		var x navmenu.NavItem
		if err := scanNavItem(rows, &x); err != nil {
			return nil, fmt.Errorf("NavMenuRepository.List scan: %w", err)
		}
		list = append(list, x)
	}
	return list, rows.Err()
}

func (r *NavMenuRepository) GetByID(ctx context.Context, id string) (*navmenu.NavItem, error) {
	var x navmenu.NavItem
	err := scanNavItem(r.pool.QueryRow(ctx, `SELECT `+navMenuColumns+` FROM nav_menu_items WHERE id = $1`, id), &x)
	if err != nil {
		if errors.Is(err, pgx.ErrNoRows) {
			return nil, nil
		}
		return nil, fmt.Errorf("NavMenuRepository.GetByID: %w", err)
	}
	return &x, nil
}

func (r *NavMenuRepository) Create(ctx context.Context, id string, in navmenu.Input) (*navmenu.NavItem, error) {
	items, err := marshalLeaves(in.Items)
	if err != nil {
		return nil, fmt.Errorf("NavMenuRepository.Create marshal items: %w", err)
	}

	var x navmenu.NavItem
	err = scanNavItem(r.pool.QueryRow(ctx, `
		INSERT INTO nav_menu_items (id, type, label, path, external, items, order_index)
		VALUES ($1, $2, $3, $4, $5, $6::jsonb, COALESCE((SELECT MAX(order_index)+1 FROM nav_menu_items), 0))
		RETURNING `+navMenuColumns,
		id, in.Type, in.Label, in.Path, in.External, items,
	), &x)
	if err != nil {
		return nil, fmt.Errorf("NavMenuRepository.Create: %w", err)
	}
	return &x, nil
}

func (r *NavMenuRepository) Update(ctx context.Context, id string, in navmenu.Input) (*navmenu.NavItem, error) {
	items, err := marshalLeaves(in.Items)
	if err != nil {
		return nil, fmt.Errorf("NavMenuRepository.Update marshal items: %w", err)
	}

	var x navmenu.NavItem
	err = scanNavItem(r.pool.QueryRow(ctx, `
		UPDATE nav_menu_items SET type=$2, label=$3, path=$4, external=$5, items=$6::jsonb
		WHERE id=$1
		RETURNING `+navMenuColumns,
		id, in.Type, in.Label, in.Path, in.External, items,
	), &x)
	if err != nil {
		return nil, fmt.Errorf("NavMenuRepository.Update: %w", err)
	}
	return &x, nil
}

func (r *NavMenuRepository) Delete(ctx context.Context, id string) error {
	if _, err := r.pool.Exec(ctx, `DELETE FROM nav_menu_items WHERE id = $1`, id); err != nil {
		return fmt.Errorf("NavMenuRepository.Delete: %w", err)
	}
	return nil
}

// Reorder sets order_index = position in the given slice for each id.
func (r *NavMenuRepository) Reorder(ctx context.Context, ids []string) error {
	tx, err := r.pool.Begin(ctx)
	if err != nil {
		return fmt.Errorf("NavMenuRepository.Reorder begin: %w", err)
	}
	defer tx.Rollback(ctx)

	for i, id := range ids {
		if _, err := tx.Exec(ctx, `UPDATE nav_menu_items SET order_index=$2 WHERE id=$1`, id, i); err != nil {
			return fmt.Errorf("NavMenuRepository.Reorder update: %w", err)
		}
	}
	if err := tx.Commit(ctx); err != nil {
		return fmt.Errorf("NavMenuRepository.Reorder commit: %w", err)
	}
	return nil
}
