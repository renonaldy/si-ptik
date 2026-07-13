package postgres

import (
	"context"
	"errors"
	"fmt"

	"ptik/internal/domain/berita"

	"github.com/jackc/pgx/v5"
	"github.com/jackc/pgx/v5/pgxpool"
)

type BeritaRepository struct{ pool *pgxpool.Pool }

func NewBeritaRepository(pool *pgxpool.Pool) *BeritaRepository { return &BeritaRepository{pool: pool} }

const beritaColumns = `id, judul, ringkasan, konten, gambar, penulis, tanggal, created_at, updated_at`

func scanBerita(row pgx.Row, x *berita.Berita) error {
	return row.Scan(&x.ID, &x.Judul, &x.Ringkasan, &x.Konten, &x.Gambar, &x.Penulis, &x.Tanggal, &x.CreatedAt, &x.UpdatedAt)
}

func (r *BeritaRepository) List(ctx context.Context, search string) ([]berita.Berita, error) {
	rows, err := r.pool.Query(ctx, `
		SELECT `+beritaColumns+`
		FROM beritas
		WHERE ($1 = '' OR judul ILIKE '%' || $1 || '%' OR penulis ILIKE '%' || $1 || '%')
		ORDER BY judul ASC
	`, search)
	if err != nil {
		return nil, fmt.Errorf("BeritaRepository.List: %w", err)
	}
	defer rows.Close()

	list := []berita.Berita{}
	for rows.Next() {
		var x berita.Berita
		if err := scanBerita(rows, &x); err != nil {
			return nil, fmt.Errorf("BeritaRepository.List scan: %w", err)
		}
		list = append(list, x)
	}
	return list, rows.Err()
}

func (r *BeritaRepository) GetByID(ctx context.Context, id string) (*berita.Berita, error) {
	var x berita.Berita
	err := scanBerita(r.pool.QueryRow(ctx, `SELECT `+beritaColumns+` FROM beritas WHERE id = $1`, id), &x)
	if err != nil {
		if errors.Is(err, pgx.ErrNoRows) {
			return nil, nil
		}
		return nil, fmt.Errorf("BeritaRepository.GetByID: %w", err)
	}
	return &x, nil
}

func (r *BeritaRepository) Create(ctx context.Context, id string, in berita.Input) (*berita.Berita, error) {
	var x berita.Berita
	err := scanBerita(r.pool.QueryRow(ctx, `
		INSERT INTO beritas (id, judul, ringkasan, konten, gambar, penulis, tanggal)
		VALUES ($1, $2, $3, $4, $5, $6, $7)
		RETURNING `+beritaColumns,
		id, in.Judul, in.Ringkasan, in.Konten, in.Gambar, in.Penulis, in.Tanggal,
	), &x)
	if err != nil {
		return nil, fmt.Errorf("BeritaRepository.Create: %w", err)
	}
	return &x, nil
}

func (r *BeritaRepository) Update(ctx context.Context, id string, in berita.Input) (*berita.Berita, error) {
	var x berita.Berita
	err := scanBerita(r.pool.QueryRow(ctx, `
		UPDATE beritas SET judul=$2, ringkasan=$3, konten=$4, gambar=$5, penulis=$6, tanggal=$7
		WHERE id=$1
		RETURNING `+beritaColumns,
		id, in.Judul, in.Ringkasan, in.Konten, in.Gambar, in.Penulis, in.Tanggal,
	), &x)
	if err != nil {
		return nil, fmt.Errorf("BeritaRepository.Update: %w", err)
	}
	return &x, nil
}

func (r *BeritaRepository) Delete(ctx context.Context, id string) error {
	if _, err := r.pool.Exec(ctx, `DELETE FROM beritas WHERE id = $1`, id); err != nil {
		return fmt.Errorf("BeritaRepository.Delete: %w", err)
	}
	return nil
}
