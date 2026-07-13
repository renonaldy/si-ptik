package postgres

import (
	"context"
	"fmt"

	"ptik/internal/domain/content"

	"github.com/jackc/pgx/v5/pgxpool"
)

type ContentRepository struct{ pool *pgxpool.Pool }

func NewContentRepository(pool *pgxpool.Pool) *ContentRepository {
	return &ContentRepository{pool: pool}
}

func (r *ContentRepository) List(ctx context.Context) ([]content.SiteContent, error) {
	rows, err := r.pool.Query(ctx, `SELECT key, value, updated_at FROM site_contents ORDER BY key ASC`)
	if err != nil {
		return nil, fmt.Errorf("ContentRepository.List: %w", err)
	}
	defer rows.Close()

	list := []content.SiteContent{}
	for rows.Next() {
		var c content.SiteContent
		if err := rows.Scan(&c.Key, &c.Value, &c.UpdatedAt); err != nil {
			return nil, fmt.Errorf("ContentRepository.List scan: %w", err)
		}
		list = append(list, c)
	}
	return list, rows.Err()
}

func (r *ContentRepository) Upsert(ctx context.Context, key, value string) error {
	_, err := r.pool.Exec(ctx, `
		INSERT INTO site_contents (key, value) VALUES ($1, $2)
		ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value, updated_at = NOW()
	`, key, value)
	if err != nil {
		return fmt.Errorf("ContentRepository.Upsert: %w", err)
	}
	return nil
}
