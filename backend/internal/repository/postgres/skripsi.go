package postgres

import (
	"context"
	"errors"
	"fmt"

	"ptik/internal/domain/skripsi"

	"github.com/jackc/pgx/v5"
	"github.com/jackc/pgx/v5/pgxpool"
)

type SkripsiRepository struct{ pool *pgxpool.Pool }

func NewSkripsiRepository(pool *pgxpool.Pool) *SkripsiRepository {
	return &SkripsiRepository{pool: pool}
}

const skripsiColumns = `id, nama, npm, judul_skripsi, pembimbing, file, created_at, updated_at`

func scanSkripsi(row pgx.Row, x *skripsi.Skripsi) error {
	return row.Scan(&x.ID, &x.Nama, &x.NPM, &x.JudulSkripsi, &x.Pembimbing, &x.File, &x.CreatedAt, &x.UpdatedAt)
}

func (r *SkripsiRepository) List(ctx context.Context, search string) ([]skripsi.Skripsi, error) {
	rows, err := r.pool.Query(ctx, `
		SELECT `+skripsiColumns+`
		FROM skripsis
		WHERE ($1 = '' OR nama ILIKE '%' || $1 || '%' OR npm ILIKE '%' || $1 || '%')
		ORDER BY nama ASC
	`, search)
	if err != nil {
		return nil, fmt.Errorf("SkripsiRepository.List: %w", err)
	}
	defer rows.Close()

	list := []skripsi.Skripsi{}
	for rows.Next() {
		var x skripsi.Skripsi
		if err := scanSkripsi(rows, &x); err != nil {
			return nil, fmt.Errorf("SkripsiRepository.List scan: %w", err)
		}
		list = append(list, x)
	}
	return list, rows.Err()
}

func (r *SkripsiRepository) GetByID(ctx context.Context, id string) (*skripsi.Skripsi, error) {
	var x skripsi.Skripsi
	err := scanSkripsi(r.pool.QueryRow(ctx, `SELECT `+skripsiColumns+` FROM skripsis WHERE id = $1`, id), &x)
	if err != nil {
		if errors.Is(err, pgx.ErrNoRows) {
			return nil, nil
		}
		return nil, fmt.Errorf("SkripsiRepository.GetByID: %w", err)
	}
	return &x, nil
}

func (r *SkripsiRepository) Create(ctx context.Context, id string, in skripsi.Input) (*skripsi.Skripsi, error) {
	var x skripsi.Skripsi
	err := scanSkripsi(r.pool.QueryRow(ctx, `
		INSERT INTO skripsis (id, nama, npm, judul_skripsi, pembimbing, file)
		VALUES ($1, $2, $3, $4, $5, $6)
		RETURNING `+skripsiColumns,
		id, in.Nama, in.NPM, in.JudulSkripsi, in.Pembimbing, in.File,
	), &x)
	if err != nil {
		return nil, fmt.Errorf("SkripsiRepository.Create: %w", err)
	}
	return &x, nil
}

func (r *SkripsiRepository) Update(ctx context.Context, id string, in skripsi.Input) (*skripsi.Skripsi, error) {
	var x skripsi.Skripsi
	err := scanSkripsi(r.pool.QueryRow(ctx, `
		UPDATE skripsis SET nama=$2, npm=$3, judul_skripsi=$4, pembimbing=$5, file=$6
		WHERE id=$1
		RETURNING `+skripsiColumns,
		id, in.Nama, in.NPM, in.JudulSkripsi, in.Pembimbing, in.File,
	), &x)
	if err != nil {
		return nil, fmt.Errorf("SkripsiRepository.Update: %w", err)
	}
	return &x, nil
}

func (r *SkripsiRepository) Delete(ctx context.Context, id string) error {
	if _, err := r.pool.Exec(ctx, `DELETE FROM skripsis WHERE id = $1`, id); err != nil {
		return fmt.Errorf("SkripsiRepository.Delete: %w", err)
	}
	return nil
}
