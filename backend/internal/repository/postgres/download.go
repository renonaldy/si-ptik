package postgres

import (
	"context"
	"errors"
	"fmt"

	"ptik/internal/domain/download"

	"github.com/jackc/pgx/v5"
	"github.com/jackc/pgx/v5/pgxpool"
)

type DownloadRepository struct{ pool *pgxpool.Pool }

func NewDownloadRepository(pool *pgxpool.Pool) *DownloadRepository {
	return &DownloadRepository{pool: pool}
}

const downloadColumns = `id, judul, keterangan, kategori, file, created_at, updated_at`

func scanDownload(row pgx.Row, x *download.Download) error {
	return row.Scan(&x.ID, &x.Judul, &x.Keterangan, &x.Kategori, &x.File, &x.CreatedAt, &x.UpdatedAt)
}

func (r *DownloadRepository) List(ctx context.Context, search string) ([]download.Download, error) {
	rows, err := r.pool.Query(ctx, `
		SELECT `+downloadColumns+`
		FROM downloads
		WHERE ($1 = '' OR judul ILIKE '%' || $1 || '%' OR kategori ILIKE '%' || $1 || '%')
		ORDER BY judul ASC
	`, search)
	if err != nil {
		return nil, fmt.Errorf("DownloadRepository.List: %w", err)
	}
	defer rows.Close()

	list := []download.Download{}
	for rows.Next() {
		var x download.Download
		if err := scanDownload(rows, &x); err != nil {
			return nil, fmt.Errorf("DownloadRepository.List scan: %w", err)
		}
		list = append(list, x)
	}
	return list, rows.Err()
}

func (r *DownloadRepository) GetByID(ctx context.Context, id string) (*download.Download, error) {
	var x download.Download
	err := scanDownload(r.pool.QueryRow(ctx, `SELECT `+downloadColumns+` FROM downloads WHERE id = $1`, id), &x)
	if err != nil {
		if errors.Is(err, pgx.ErrNoRows) {
			return nil, nil
		}
		return nil, fmt.Errorf("DownloadRepository.GetByID: %w", err)
	}
	return &x, nil
}

func (r *DownloadRepository) Create(ctx context.Context, id string, in download.Input) (*download.Download, error) {
	var x download.Download
	err := scanDownload(r.pool.QueryRow(ctx, `
		INSERT INTO downloads (id, judul, keterangan, kategori, file)
		VALUES ($1, $2, $3, $4, $5)
		RETURNING `+downloadColumns,
		id, in.Judul, in.Keterangan, in.Kategori, in.File,
	), &x)
	if err != nil {
		return nil, fmt.Errorf("DownloadRepository.Create: %w", err)
	}
	return &x, nil
}

func (r *DownloadRepository) Update(ctx context.Context, id string, in download.Input) (*download.Download, error) {
	var x download.Download
	err := scanDownload(r.pool.QueryRow(ctx, `
		UPDATE downloads SET judul=$2, keterangan=$3, kategori=$4, file=$5
		WHERE id=$1
		RETURNING `+downloadColumns,
		id, in.Judul, in.Keterangan, in.Kategori, in.File,
	), &x)
	if err != nil {
		return nil, fmt.Errorf("DownloadRepository.Update: %w", err)
	}
	return &x, nil
}

func (r *DownloadRepository) Delete(ctx context.Context, id string) error {
	if _, err := r.pool.Exec(ctx, `DELETE FROM downloads WHERE id = $1`, id); err != nil {
		return fmt.Errorf("DownloadRepository.Delete: %w", err)
	}
	return nil
}
