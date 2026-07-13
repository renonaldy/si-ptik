package postgres

import (
	"context"
	"errors"
	"fmt"

	"ptik/internal/domain/administrasi"

	"github.com/jackc/pgx/v5"
	"github.com/jackc/pgx/v5/pgxpool"
)

type AdministrasiRepository struct{ pool *pgxpool.Pool }

func NewAdministrasiRepository(pool *pgxpool.Pool) *AdministrasiRepository {
	return &AdministrasiRepository{pool: pool}
}

const administrasiColumns = `id, nama, npm, kategori, file, created_at, updated_at`

func scanAdministrasi(row pgx.Row, x *administrasi.Administrasi) error {
	return row.Scan(&x.ID, &x.Nama, &x.NPM, &x.Kategori, &x.File, &x.CreatedAt, &x.UpdatedAt)
}

func (r *AdministrasiRepository) List(ctx context.Context, search string) ([]administrasi.Administrasi, error) {
	rows, err := r.pool.Query(ctx, `
		SELECT `+administrasiColumns+`
		FROM administrasis
		WHERE ($1 = '' OR nama ILIKE '%' || $1 || '%' OR npm ILIKE '%' || $1 || '%')
		ORDER BY nama ASC
	`, search)
	if err != nil {
		return nil, fmt.Errorf("AdministrasiRepository.List: %w", err)
	}
	defer rows.Close()

	list := []administrasi.Administrasi{}
	for rows.Next() {
		var x administrasi.Administrasi
		if err := scanAdministrasi(rows, &x); err != nil {
			return nil, fmt.Errorf("AdministrasiRepository.List scan: %w", err)
		}
		list = append(list, x)
	}
	return list, rows.Err()
}

func (r *AdministrasiRepository) GetByID(ctx context.Context, id string) (*administrasi.Administrasi, error) {
	var x administrasi.Administrasi
	err := scanAdministrasi(r.pool.QueryRow(ctx, `SELECT `+administrasiColumns+` FROM administrasis WHERE id = $1`, id), &x)
	if err != nil {
		if errors.Is(err, pgx.ErrNoRows) {
			return nil, nil
		}
		return nil, fmt.Errorf("AdministrasiRepository.GetByID: %w", err)
	}
	return &x, nil
}

func (r *AdministrasiRepository) Create(ctx context.Context, id string, in administrasi.Input) (*administrasi.Administrasi, error) {
	var x administrasi.Administrasi
	err := scanAdministrasi(r.pool.QueryRow(ctx, `
		INSERT INTO administrasis (id, nama, npm, kategori, file)
		VALUES ($1, $2, $3, $4, $5)
		RETURNING `+administrasiColumns,
		id, in.Nama, in.NPM, in.Kategori, in.File,
	), &x)
	if err != nil {
		return nil, fmt.Errorf("AdministrasiRepository.Create: %w", err)
	}
	return &x, nil
}

func (r *AdministrasiRepository) Update(ctx context.Context, id string, in administrasi.Input) (*administrasi.Administrasi, error) {
	var x administrasi.Administrasi
	err := scanAdministrasi(r.pool.QueryRow(ctx, `
		UPDATE administrasis SET nama=$2, npm=$3, kategori=$4, file=$5
		WHERE id=$1
		RETURNING `+administrasiColumns,
		id, in.Nama, in.NPM, in.Kategori, in.File,
	), &x)
	if err != nil {
		return nil, fmt.Errorf("AdministrasiRepository.Update: %w", err)
	}
	return &x, nil
}

func (r *AdministrasiRepository) Delete(ctx context.Context, id string) error {
	if _, err := r.pool.Exec(ctx, `DELETE FROM administrasis WHERE id = $1`, id); err != nil {
		return fmt.Errorf("AdministrasiRepository.Delete: %w", err)
	}
	return nil
}
