package postgres

import (
	"context"
	"errors"
	"fmt"

	"ptik/internal/domain/penelitian"

	"github.com/jackc/pgx/v5"
	"github.com/jackc/pgx/v5/pgxpool"
)

type PenelitianRepository struct{ pool *pgxpool.Pool }

func NewPenelitianRepository(pool *pgxpool.Pool) *PenelitianRepository {
	return &PenelitianRepository{pool: pool}
}

const penelitianColumns = `id, nama_penelitian, jenis_penelitian, author, tanggal, file, created_at, updated_at`

func scanPenelitian(row pgx.Row, x *penelitian.Penelitian) error {
	return row.Scan(&x.ID, &x.NamaPenelitian, &x.JenisPenelitian, &x.Author, &x.Tanggal, &x.File, &x.CreatedAt, &x.UpdatedAt)
}

func (r *PenelitianRepository) List(ctx context.Context, search string) ([]penelitian.Penelitian, error) {
	rows, err := r.pool.Query(ctx, `
		SELECT `+penelitianColumns+`
		FROM penelitians
		WHERE ($1 = '' OR nama_penelitian ILIKE '%' || $1 || '%' OR author ILIKE '%' || $1 || '%')
		ORDER BY nama_penelitian ASC
	`, search)
	if err != nil {
		return nil, fmt.Errorf("PenelitianRepository.List: %w", err)
	}
	defer rows.Close()

	list := []penelitian.Penelitian{}
	for rows.Next() {
		var x penelitian.Penelitian
		if err := scanPenelitian(rows, &x); err != nil {
			return nil, fmt.Errorf("PenelitianRepository.List scan: %w", err)
		}
		list = append(list, x)
	}
	return list, rows.Err()
}

func (r *PenelitianRepository) GetByID(ctx context.Context, id string) (*penelitian.Penelitian, error) {
	var x penelitian.Penelitian
	err := scanPenelitian(r.pool.QueryRow(ctx, `SELECT `+penelitianColumns+` FROM penelitians WHERE id = $1`, id), &x)
	if err != nil {
		if errors.Is(err, pgx.ErrNoRows) {
			return nil, nil
		}
		return nil, fmt.Errorf("PenelitianRepository.GetByID: %w", err)
	}
	return &x, nil
}

func (r *PenelitianRepository) Create(ctx context.Context, id string, in penelitian.Input) (*penelitian.Penelitian, error) {
	var x penelitian.Penelitian
	err := scanPenelitian(r.pool.QueryRow(ctx, `
		INSERT INTO penelitians (id, nama_penelitian, jenis_penelitian, author, tanggal, file)
		VALUES ($1, $2, $3, $4, $5, $6)
		RETURNING `+penelitianColumns,
		id, in.NamaPenelitian, in.JenisPenelitian, in.Author, in.Tanggal, in.File,
	), &x)
	if err != nil {
		return nil, fmt.Errorf("PenelitianRepository.Create: %w", err)
	}
	return &x, nil
}

func (r *PenelitianRepository) Update(ctx context.Context, id string, in penelitian.Input) (*penelitian.Penelitian, error) {
	var x penelitian.Penelitian
	err := scanPenelitian(r.pool.QueryRow(ctx, `
		UPDATE penelitians SET nama_penelitian=$2, jenis_penelitian=$3, author=$4, tanggal=$5, file=$6
		WHERE id=$1
		RETURNING `+penelitianColumns,
		id, in.NamaPenelitian, in.JenisPenelitian, in.Author, in.Tanggal, in.File,
	), &x)
	if err != nil {
		return nil, fmt.Errorf("PenelitianRepository.Update: %w", err)
	}
	return &x, nil
}

func (r *PenelitianRepository) Delete(ctx context.Context, id string) error {
	if _, err := r.pool.Exec(ctx, `DELETE FROM penelitians WHERE id = $1`, id); err != nil {
		return fmt.Errorf("PenelitianRepository.Delete: %w", err)
	}
	return nil
}
