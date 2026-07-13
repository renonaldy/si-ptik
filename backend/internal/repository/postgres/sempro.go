package postgres

import (
	"context"
	"errors"
	"fmt"

	"ptik/internal/domain/sempro"

	"github.com/jackc/pgx/v5"
	"github.com/jackc/pgx/v5/pgxpool"
)

type SemproRepository struct{ pool *pgxpool.Pool }

func NewSemproRepository(pool *pgxpool.Pool) *SemproRepository { return &SemproRepository{pool: pool} }

const semproColumns = `id, nama, npm, judul, pembimbing, file, created_at, updated_at`

func scanSempro(row pgx.Row, x *sempro.Sempro) error {
	return row.Scan(&x.ID, &x.Nama, &x.NPM, &x.Judul, &x.Pembimbing, &x.File, &x.CreatedAt, &x.UpdatedAt)
}

func (r *SemproRepository) List(ctx context.Context, search string) ([]sempro.Sempro, error) {
	rows, err := r.pool.Query(ctx, `
		SELECT `+semproColumns+`
		FROM sempros
		WHERE ($1 = '' OR nama ILIKE '%' || $1 || '%' OR npm ILIKE '%' || $1 || '%')
		ORDER BY nama ASC
	`, search)
	if err != nil {
		return nil, fmt.Errorf("SemproRepository.List: %w", err)
	}
	defer rows.Close()

	list := []sempro.Sempro{}
	for rows.Next() {
		var x sempro.Sempro
		if err := scanSempro(rows, &x); err != nil {
			return nil, fmt.Errorf("SemproRepository.List scan: %w", err)
		}
		list = append(list, x)
	}
	return list, rows.Err()
}

func (r *SemproRepository) GetByID(ctx context.Context, id string) (*sempro.Sempro, error) {
	var x sempro.Sempro
	err := scanSempro(r.pool.QueryRow(ctx, `SELECT `+semproColumns+` FROM sempros WHERE id = $1`, id), &x)
	if err != nil {
		if errors.Is(err, pgx.ErrNoRows) {
			return nil, nil
		}
		return nil, fmt.Errorf("SemproRepository.GetByID: %w", err)
	}
	return &x, nil
}

func (r *SemproRepository) Create(ctx context.Context, id string, in sempro.Input) (*sempro.Sempro, error) {
	var x sempro.Sempro
	err := scanSempro(r.pool.QueryRow(ctx, `
		INSERT INTO sempros (id, nama, npm, judul, pembimbing, file)
		VALUES ($1, $2, $3, $4, $5, $6)
		RETURNING `+semproColumns,
		id, in.Nama, in.NPM, in.Judul, in.Pembimbing, in.File,
	), &x)
	if err != nil {
		return nil, fmt.Errorf("SemproRepository.Create: %w", err)
	}
	return &x, nil
}

func (r *SemproRepository) Update(ctx context.Context, id string, in sempro.Input) (*sempro.Sempro, error) {
	var x sempro.Sempro
	err := scanSempro(r.pool.QueryRow(ctx, `
		UPDATE sempros SET nama=$2, npm=$3, judul=$4, pembimbing=$5, file=$6
		WHERE id=$1
		RETURNING `+semproColumns,
		id, in.Nama, in.NPM, in.Judul, in.Pembimbing, in.File,
	), &x)
	if err != nil {
		return nil, fmt.Errorf("SemproRepository.Update: %w", err)
	}
	return &x, nil
}

func (r *SemproRepository) Delete(ctx context.Context, id string) error {
	if _, err := r.pool.Exec(ctx, `DELETE FROM sempros WHERE id = $1`, id); err != nil {
		return fmt.Errorf("SemproRepository.Delete: %w", err)
	}
	return nil
}
