package postgres

import (
	"context"
	"errors"
	"fmt"

	"ptik/internal/domain/wisudawan"

	"github.com/jackc/pgx/v5"
	"github.com/jackc/pgx/v5/pgxpool"
)

type WisudawanRepository struct{ pool *pgxpool.Pool }

func NewWisudawanRepository(pool *pgxpool.Pool) *WisudawanRepository {
	return &WisudawanRepository{pool: pool}
}

const wisudawanColumns = `id, nama_wisudawan, npm, judul_skripsi, pembimbing, tanggal_sidang, foto, created_at, updated_at`

func scanWisudawan(row pgx.Row, x *wisudawan.Wisudawan) error {
	return row.Scan(&x.ID, &x.NamaWisudawan, &x.NPM, &x.JudulSkripsi, &x.Pembimbing, &x.TanggalSidang, &x.Foto, &x.CreatedAt, &x.UpdatedAt)
}

func (r *WisudawanRepository) List(ctx context.Context, search string) ([]wisudawan.Wisudawan, error) {
	rows, err := r.pool.Query(ctx, `
		SELECT `+wisudawanColumns+`
		FROM wisudawans
		WHERE ($1 = '' OR nama_wisudawan ILIKE '%' || $1 || '%' OR npm ILIKE '%' || $1 || '%')
		ORDER BY nama_wisudawan ASC
	`, search)
	if err != nil {
		return nil, fmt.Errorf("WisudawanRepository.List: %w", err)
	}
	defer rows.Close()

	list := []wisudawan.Wisudawan{}
	for rows.Next() {
		var x wisudawan.Wisudawan
		if err := scanWisudawan(rows, &x); err != nil {
			return nil, fmt.Errorf("WisudawanRepository.List scan: %w", err)
		}
		list = append(list, x)
	}
	return list, rows.Err()
}

func (r *WisudawanRepository) GetByID(ctx context.Context, id string) (*wisudawan.Wisudawan, error) {
	var x wisudawan.Wisudawan
	err := scanWisudawan(r.pool.QueryRow(ctx, `SELECT `+wisudawanColumns+` FROM wisudawans WHERE id = $1`, id), &x)
	if err != nil {
		if errors.Is(err, pgx.ErrNoRows) {
			return nil, nil
		}
		return nil, fmt.Errorf("WisudawanRepository.GetByID: %w", err)
	}
	return &x, nil
}

func (r *WisudawanRepository) Create(ctx context.Context, id string, in wisudawan.Input) (*wisudawan.Wisudawan, error) {
	var x wisudawan.Wisudawan
	err := scanWisudawan(r.pool.QueryRow(ctx, `
		INSERT INTO wisudawans (id, nama_wisudawan, npm, judul_skripsi, pembimbing, tanggal_sidang, foto)
		VALUES ($1, $2, $3, $4, $5, $6, $7)
		RETURNING `+wisudawanColumns,
		id, in.NamaWisudawan, in.NPM, in.JudulSkripsi, in.Pembimbing, in.TanggalSidang, in.Foto,
	), &x)
	if err != nil {
		return nil, fmt.Errorf("WisudawanRepository.Create: %w", err)
	}
	return &x, nil
}

func (r *WisudawanRepository) Update(ctx context.Context, id string, in wisudawan.Input) (*wisudawan.Wisudawan, error) {
	var x wisudawan.Wisudawan
	err := scanWisudawan(r.pool.QueryRow(ctx, `
		UPDATE wisudawans SET nama_wisudawan=$2, npm=$3, judul_skripsi=$4, pembimbing=$5, tanggal_sidang=$6, foto=$7
		WHERE id=$1
		RETURNING `+wisudawanColumns,
		id, in.NamaWisudawan, in.NPM, in.JudulSkripsi, in.Pembimbing, in.TanggalSidang, in.Foto,
	), &x)
	if err != nil {
		return nil, fmt.Errorf("WisudawanRepository.Update: %w", err)
	}
	return &x, nil
}

func (r *WisudawanRepository) Delete(ctx context.Context, id string) error {
	if _, err := r.pool.Exec(ctx, `DELETE FROM wisudawans WHERE id = $1`, id); err != nil {
		return fmt.Errorf("WisudawanRepository.Delete: %w", err)
	}
	return nil
}
