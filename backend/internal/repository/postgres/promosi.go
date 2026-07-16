package postgres

import (
	"context"
	"errors"
	"fmt"

	"ptik/internal/domain/promosi"

	"github.com/jackc/pgx/v5"
	"github.com/jackc/pgx/v5/pgxpool"
)

type PromosiRepository struct{ pool *pgxpool.Pool }

func NewPromosiRepository(pool *pgxpool.Pool) *PromosiRepository {
	return &PromosiRepository{pool: pool}
}

const promosiColumns = `id, judul, tipe, media, sumber, keterangan, tanggal, created_at, updated_at`

func scanPromosi(row pgx.Row, x *promosi.Promosi) error {
	return row.Scan(&x.ID, &x.Judul, &x.Tipe, &x.Media, &x.Sumber, &x.Keterangan, &x.Tanggal, &x.CreatedAt, &x.UpdatedAt)
}

func (r *PromosiRepository) List(ctx context.Context, search, tipe string) ([]promosi.Promosi, error) {
	rows, err := r.pool.Query(ctx, `
		SELECT `+promosiColumns+`
		FROM promosis
		WHERE ($1 = '' OR judul ILIKE '%' || $1 || '%' OR keterangan ILIKE '%' || $1 || '%')
		  AND ($2 = '' OR tipe = $2)
		ORDER BY tanggal DESC, created_at DESC
	`, search, tipe)
	if err != nil {
		return nil, fmt.Errorf("PromosiRepository.List: %w", err)
	}
	defer rows.Close()

	list := []promosi.Promosi{}
	for rows.Next() {
		var x promosi.Promosi
		if err := scanPromosi(rows, &x); err != nil {
			return nil, fmt.Errorf("PromosiRepository.List scan: %w", err)
		}
		list = append(list, x)
	}
	return list, rows.Err()
}

func (r *PromosiRepository) GetByID(ctx context.Context, id string) (*promosi.Promosi, error) {
	var x promosi.Promosi
	err := scanPromosi(r.pool.QueryRow(ctx, `SELECT `+promosiColumns+` FROM promosis WHERE id = $1`, id), &x)
	if err != nil {
		if errors.Is(err, pgx.ErrNoRows) {
			return nil, nil
		}
		return nil, fmt.Errorf("PromosiRepository.GetByID: %w", err)
	}
	return &x, nil
}

func (r *PromosiRepository) Create(ctx context.Context, id string, in promosi.Input) (*promosi.Promosi, error) {
	var x promosi.Promosi
	err := scanPromosi(r.pool.QueryRow(ctx, `
		INSERT INTO promosis (id, judul, tipe, media, sumber, keterangan, tanggal)
		VALUES ($1, $2, $3, $4, $5, $6, $7)
		RETURNING `+promosiColumns,
		id, in.Judul, in.Tipe, in.Media, in.Sumber, in.Keterangan, in.Tanggal,
	), &x)
	if err != nil {
		return nil, fmt.Errorf("PromosiRepository.Create: %w", err)
	}
	return &x, nil
}

func (r *PromosiRepository) Update(ctx context.Context, id string, in promosi.Input) (*promosi.Promosi, error) {
	var x promosi.Promosi
	err := scanPromosi(r.pool.QueryRow(ctx, `
		UPDATE promosis SET judul=$2, tipe=$3, media=$4, sumber=$5, keterangan=$6, tanggal=$7
		WHERE id=$1
		RETURNING `+promosiColumns,
		id, in.Judul, in.Tipe, in.Media, in.Sumber, in.Keterangan, in.Tanggal,
	), &x)
	if err != nil {
		return nil, fmt.Errorf("PromosiRepository.Update: %w", err)
	}
	return &x, nil
}

func (r *PromosiRepository) Delete(ctx context.Context, id string) error {
	if _, err := r.pool.Exec(ctx, `DELETE FROM promosis WHERE id = $1`, id); err != nil {
		return fmt.Errorf("PromosiRepository.Delete: %w", err)
	}
	return nil
}
