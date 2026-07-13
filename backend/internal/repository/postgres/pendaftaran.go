package postgres

import (
	"context"
	"errors"
	"fmt"

	"ptik/internal/domain/pendaftaran"

	"github.com/jackc/pgx/v5"
	"github.com/jackc/pgx/v5/pgxpool"
)

type PendaftaranRepository struct{ pool *pgxpool.Pool }

func NewPendaftaranRepository(pool *pgxpool.Pool) *PendaftaranRepository {
	return &PendaftaranRepository{pool: pool}
}

const pendaftaranColumns = `id, nama, email, no_hp, asal_sekolah, jenis, pesan, created_at, updated_at`

func scanPendaftaran(row pgx.Row, x *pendaftaran.Pendaftaran) error {
	return row.Scan(&x.ID, &x.Nama, &x.Email, &x.NoHP, &x.AsalSekolah, &x.Jenis, &x.Pesan, &x.CreatedAt, &x.UpdatedAt)
}

func (r *PendaftaranRepository) List(ctx context.Context, search string) ([]pendaftaran.Pendaftaran, error) {
	rows, err := r.pool.Query(ctx, `
		SELECT `+pendaftaranColumns+`
		FROM pendaftarans
		WHERE ($1 = '' OR nama ILIKE '%' || $1 || '%' OR email ILIKE '%' || $1 || '%')
		ORDER BY nama ASC
	`, search)
	if err != nil {
		return nil, fmt.Errorf("PendaftaranRepository.List: %w", err)
	}
	defer rows.Close()

	list := []pendaftaran.Pendaftaran{}
	for rows.Next() {
		var x pendaftaran.Pendaftaran
		if err := scanPendaftaran(rows, &x); err != nil {
			return nil, fmt.Errorf("PendaftaranRepository.List scan: %w", err)
		}
		list = append(list, x)
	}
	return list, rows.Err()
}

func (r *PendaftaranRepository) GetByID(ctx context.Context, id string) (*pendaftaran.Pendaftaran, error) {
	var x pendaftaran.Pendaftaran
	err := scanPendaftaran(r.pool.QueryRow(ctx, `SELECT `+pendaftaranColumns+` FROM pendaftarans WHERE id = $1`, id), &x)
	if err != nil {
		if errors.Is(err, pgx.ErrNoRows) {
			return nil, nil
		}
		return nil, fmt.Errorf("PendaftaranRepository.GetByID: %w", err)
	}
	return &x, nil
}

func (r *PendaftaranRepository) Create(ctx context.Context, id string, in pendaftaran.Input) (*pendaftaran.Pendaftaran, error) {
	var x pendaftaran.Pendaftaran
	err := scanPendaftaran(r.pool.QueryRow(ctx, `
		INSERT INTO pendaftarans (id, nama, email, no_hp, asal_sekolah, jenis, pesan)
		VALUES ($1, $2, $3, $4, $5, $6, $7)
		RETURNING `+pendaftaranColumns,
		id, in.Nama, in.Email, in.NoHP, in.AsalSekolah, in.Jenis, in.Pesan,
	), &x)
	if err != nil {
		return nil, fmt.Errorf("PendaftaranRepository.Create: %w", err)
	}
	return &x, nil
}

func (r *PendaftaranRepository) Update(ctx context.Context, id string, in pendaftaran.Input) (*pendaftaran.Pendaftaran, error) {
	var x pendaftaran.Pendaftaran
	err := scanPendaftaran(r.pool.QueryRow(ctx, `
		UPDATE pendaftarans SET nama=$2, email=$3, no_hp=$4, asal_sekolah=$5, jenis=$6, pesan=$7
		WHERE id=$1
		RETURNING `+pendaftaranColumns,
		id, in.Nama, in.Email, in.NoHP, in.AsalSekolah, in.Jenis, in.Pesan,
	), &x)
	if err != nil {
		return nil, fmt.Errorf("PendaftaranRepository.Update: %w", err)
	}
	return &x, nil
}

func (r *PendaftaranRepository) Delete(ctx context.Context, id string) error {
	if _, err := r.pool.Exec(ctx, `DELETE FROM pendaftarans WHERE id = $1`, id); err != nil {
		return fmt.Errorf("PendaftaranRepository.Delete: %w", err)
	}
	return nil
}
