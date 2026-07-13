package postgres

import (
	"context"
	"errors"
	"fmt"

	"ptik/internal/domain/skripsialumni"

	"github.com/jackc/pgx/v5"
	"github.com/jackc/pgx/v5/pgxpool"
)

type SkripsiAlumniRepository struct{ pool *pgxpool.Pool }

func NewSkripsiAlumniRepository(pool *pgxpool.Pool) *SkripsiAlumniRepository {
	return &SkripsiAlumniRepository{pool: pool}
}

const skripsialumniColumns = `id, nama_alumni, npm, judul_skripsi, pembimbing, file, created_at, updated_at`

func scanSkripsiAlumni(row pgx.Row, x *skripsialumni.SkripsiAlumni) error {
	return row.Scan(&x.ID, &x.NamaAlumni, &x.NPM, &x.JudulSkripsi, &x.Pembimbing, &x.File, &x.CreatedAt, &x.UpdatedAt)
}

func (r *SkripsiAlumniRepository) List(ctx context.Context, search string) ([]skripsialumni.SkripsiAlumni, error) {
	rows, err := r.pool.Query(ctx, `
		SELECT `+skripsialumniColumns+`
		FROM skripsi_alumnis
		WHERE ($1 = '' OR nama_alumni ILIKE '%' || $1 || '%' OR npm ILIKE '%' || $1 || '%')
		ORDER BY nama_alumni ASC
	`, search)
	if err != nil {
		return nil, fmt.Errorf("SkripsiAlumniRepository.List: %w", err)
	}
	defer rows.Close()

	list := []skripsialumni.SkripsiAlumni{}
	for rows.Next() {
		var x skripsialumni.SkripsiAlumni
		if err := scanSkripsiAlumni(rows, &x); err != nil {
			return nil, fmt.Errorf("SkripsiAlumniRepository.List scan: %w", err)
		}
		list = append(list, x)
	}
	return list, rows.Err()
}

func (r *SkripsiAlumniRepository) GetByID(ctx context.Context, id string) (*skripsialumni.SkripsiAlumni, error) {
	var x skripsialumni.SkripsiAlumni
	err := scanSkripsiAlumni(r.pool.QueryRow(ctx, `SELECT `+skripsialumniColumns+` FROM skripsi_alumnis WHERE id = $1`, id), &x)
	if err != nil {
		if errors.Is(err, pgx.ErrNoRows) {
			return nil, nil
		}
		return nil, fmt.Errorf("SkripsiAlumniRepository.GetByID: %w", err)
	}
	return &x, nil
}

func (r *SkripsiAlumniRepository) Create(ctx context.Context, id string, in skripsialumni.Input) (*skripsialumni.SkripsiAlumni, error) {
	var x skripsialumni.SkripsiAlumni
	err := scanSkripsiAlumni(r.pool.QueryRow(ctx, `
		INSERT INTO skripsi_alumnis (id, nama_alumni, npm, judul_skripsi, pembimbing, file)
		VALUES ($1, $2, $3, $4, $5, $6)
		RETURNING `+skripsialumniColumns,
		id, in.NamaAlumni, in.NPM, in.JudulSkripsi, in.Pembimbing, in.File,
	), &x)
	if err != nil {
		return nil, fmt.Errorf("SkripsiAlumniRepository.Create: %w", err)
	}
	return &x, nil
}

func (r *SkripsiAlumniRepository) Update(ctx context.Context, id string, in skripsialumni.Input) (*skripsialumni.SkripsiAlumni, error) {
	var x skripsialumni.SkripsiAlumni
	err := scanSkripsiAlumni(r.pool.QueryRow(ctx, `
		UPDATE skripsi_alumnis SET nama_alumni=$2, npm=$3, judul_skripsi=$4, pembimbing=$5, file=$6
		WHERE id=$1
		RETURNING `+skripsialumniColumns,
		id, in.NamaAlumni, in.NPM, in.JudulSkripsi, in.Pembimbing, in.File,
	), &x)
	if err != nil {
		return nil, fmt.Errorf("SkripsiAlumniRepository.Update: %w", err)
	}
	return &x, nil
}

func (r *SkripsiAlumniRepository) Delete(ctx context.Context, id string) error {
	if _, err := r.pool.Exec(ctx, `DELETE FROM skripsi_alumnis WHERE id = $1`, id); err != nil {
		return fmt.Errorf("SkripsiAlumniRepository.Delete: %w", err)
	}
	return nil
}
