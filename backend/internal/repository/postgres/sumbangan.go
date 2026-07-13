package postgres

import (
	"context"
	"errors"
	"fmt"

	"ptik/internal/domain/sumbangan"

	"github.com/jackc/pgx/v5"
	"github.com/jackc/pgx/v5/pgxpool"
)

type SumbanganRepository struct{ pool *pgxpool.Pool }

func NewSumbanganRepository(pool *pgxpool.Pool) *SumbanganRepository {
	return &SumbanganRepository{pool: pool}
}

const sumbanganColumns = `id, nama_alumni, npm, sumbangan, jumlah, created_at, updated_at`

func scanSumbangan(row pgx.Row, x *sumbangan.Sumbangan) error {
	return row.Scan(&x.ID, &x.NamaAlumni, &x.NPM, &x.Sumbangan, &x.Jumlah, &x.CreatedAt, &x.UpdatedAt)
}

func (r *SumbanganRepository) List(ctx context.Context, search string) ([]sumbangan.Sumbangan, error) {
	rows, err := r.pool.Query(ctx, `
		SELECT `+sumbanganColumns+`
		FROM sumbangans
		WHERE ($1 = '' OR nama_alumni ILIKE '%' || $1 || '%' OR npm ILIKE '%' || $1 || '%')
		ORDER BY nama_alumni ASC
	`, search)
	if err != nil {
		return nil, fmt.Errorf("SumbanganRepository.List: %w", err)
	}
	defer rows.Close()

	list := []sumbangan.Sumbangan{}
	for rows.Next() {
		var x sumbangan.Sumbangan
		if err := scanSumbangan(rows, &x); err != nil {
			return nil, fmt.Errorf("SumbanganRepository.List scan: %w", err)
		}
		list = append(list, x)
	}
	return list, rows.Err()
}

func (r *SumbanganRepository) GetByID(ctx context.Context, id string) (*sumbangan.Sumbangan, error) {
	var x sumbangan.Sumbangan
	err := scanSumbangan(r.pool.QueryRow(ctx, `SELECT `+sumbanganColumns+` FROM sumbangans WHERE id = $1`, id), &x)
	if err != nil {
		if errors.Is(err, pgx.ErrNoRows) {
			return nil, nil
		}
		return nil, fmt.Errorf("SumbanganRepository.GetByID: %w", err)
	}
	return &x, nil
}

func (r *SumbanganRepository) Create(ctx context.Context, id string, in sumbangan.Input) (*sumbangan.Sumbangan, error) {
	var x sumbangan.Sumbangan
	err := scanSumbangan(r.pool.QueryRow(ctx, `
		INSERT INTO sumbangans (id, nama_alumni, npm, sumbangan, jumlah)
		VALUES ($1, $2, $3, $4, $5)
		RETURNING `+sumbanganColumns,
		id, in.NamaAlumni, in.NPM, in.Sumbangan, in.Jumlah,
	), &x)
	if err != nil {
		return nil, fmt.Errorf("SumbanganRepository.Create: %w", err)
	}
	return &x, nil
}

func (r *SumbanganRepository) Update(ctx context.Context, id string, in sumbangan.Input) (*sumbangan.Sumbangan, error) {
	var x sumbangan.Sumbangan
	err := scanSumbangan(r.pool.QueryRow(ctx, `
		UPDATE sumbangans SET nama_alumni=$2, npm=$3, sumbangan=$4, jumlah=$5
		WHERE id=$1
		RETURNING `+sumbanganColumns,
		id, in.NamaAlumni, in.NPM, in.Sumbangan, in.Jumlah,
	), &x)
	if err != nil {
		return nil, fmt.Errorf("SumbanganRepository.Update: %w", err)
	}
	return &x, nil
}

func (r *SumbanganRepository) Delete(ctx context.Context, id string) error {
	if _, err := r.pool.Exec(ctx, `DELETE FROM sumbangans WHERE id = $1`, id); err != nil {
		return fmt.Errorf("SumbanganRepository.Delete: %w", err)
	}
	return nil
}
