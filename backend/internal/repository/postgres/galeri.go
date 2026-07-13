package postgres

import (
	"context"
	"errors"
	"fmt"

	"ptik/internal/domain/galeri"

	"github.com/jackc/pgx/v5"
	"github.com/jackc/pgx/v5/pgxpool"
)

type GaleriRepository struct{ pool *pgxpool.Pool }

func NewGaleriRepository(pool *pgxpool.Pool) *GaleriRepository { return &GaleriRepository{pool: pool} }

const galeriColumns = `id, judul, gambar, keterangan, tanggal, created_at, updated_at`

func scanGaleri(row pgx.Row, x *galeri.Galeri) error {
	return row.Scan(&x.ID, &x.Judul, &x.Gambar, &x.Keterangan, &x.Tanggal, &x.CreatedAt, &x.UpdatedAt)
}

func (r *GaleriRepository) List(ctx context.Context, search string) ([]galeri.Galeri, error) {
	rows, err := r.pool.Query(ctx, `
		SELECT `+galeriColumns+`
		FROM galeris
		WHERE ($1 = '' OR judul ILIKE '%' || $1 || '%' OR keterangan ILIKE '%' || $1 || '%')
		ORDER BY judul ASC
	`, search)
	if err != nil {
		return nil, fmt.Errorf("GaleriRepository.List: %w", err)
	}
	defer rows.Close()

	list := []galeri.Galeri{}
	for rows.Next() {
		var x galeri.Galeri
		if err := scanGaleri(rows, &x); err != nil {
			return nil, fmt.Errorf("GaleriRepository.List scan: %w", err)
		}
		list = append(list, x)
	}
	return list, rows.Err()
}

func (r *GaleriRepository) GetByID(ctx context.Context, id string) (*galeri.Galeri, error) {
	var x galeri.Galeri
	err := scanGaleri(r.pool.QueryRow(ctx, `SELECT `+galeriColumns+` FROM galeris WHERE id = $1`, id), &x)
	if err != nil {
		if errors.Is(err, pgx.ErrNoRows) {
			return nil, nil
		}
		return nil, fmt.Errorf("GaleriRepository.GetByID: %w", err)
	}
	return &x, nil
}

func (r *GaleriRepository) Create(ctx context.Context, id string, in galeri.Input) (*galeri.Galeri, error) {
	var x galeri.Galeri
	err := scanGaleri(r.pool.QueryRow(ctx, `
		INSERT INTO galeris (id, judul, gambar, keterangan, tanggal)
		VALUES ($1, $2, $3, $4, $5)
		RETURNING `+galeriColumns,
		id, in.Judul, in.Gambar, in.Keterangan, in.Tanggal,
	), &x)
	if err != nil {
		return nil, fmt.Errorf("GaleriRepository.Create: %w", err)
	}
	return &x, nil
}

func (r *GaleriRepository) Update(ctx context.Context, id string, in galeri.Input) (*galeri.Galeri, error) {
	var x galeri.Galeri
	err := scanGaleri(r.pool.QueryRow(ctx, `
		UPDATE galeris SET judul=$2, gambar=$3, keterangan=$4, tanggal=$5
		WHERE id=$1
		RETURNING `+galeriColumns,
		id, in.Judul, in.Gambar, in.Keterangan, in.Tanggal,
	), &x)
	if err != nil {
		return nil, fmt.Errorf("GaleriRepository.Update: %w", err)
	}
	return &x, nil
}

func (r *GaleriRepository) Delete(ctx context.Context, id string) error {
	if _, err := r.pool.Exec(ctx, `DELETE FROM galeris WHERE id = $1`, id); err != nil {
		return fmt.Errorf("GaleriRepository.Delete: %w", err)
	}
	return nil
}
