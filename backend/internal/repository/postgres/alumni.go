package postgres

import (
	"context"
	"errors"
	"fmt"

	"ptik/internal/domain/alumni"

	"github.com/jackc/pgx/v5"
	"github.com/jackc/pgx/v5/pgxpool"
)

type AlumniRepository struct{ pool *pgxpool.Pool }

func NewAlumniRepository(pool *pgxpool.Pool) *AlumniRepository { return &AlumniRepository{pool: pool} }

const alumniColumns = `id, nama_alumni, npm, tempat_lahir, tanggal_lahir, created_at, updated_at`

func scanAlumni(row pgx.Row, a *alumni.Alumni) error {
	return row.Scan(&a.ID, &a.NamaAlumni, &a.NPM, &a.TempatLahir, &a.TanggalLahir, &a.CreatedAt, &a.UpdatedAt)
}

func (r *AlumniRepository) List(ctx context.Context, search string) ([]alumni.Alumni, error) {
	rows, err := r.pool.Query(ctx, `
		SELECT `+alumniColumns+`
		FROM alumnis
		WHERE ($1 = '' OR nama_alumni ILIKE '%' || $1 || '%' OR npm ILIKE '%' || $1 || '%')
		ORDER BY nama_alumni ASC
	`, search)
	if err != nil {
		return nil, fmt.Errorf("AlumniRepository.List: %w", err)
	}
	defer rows.Close()

	list := []alumni.Alumni{}
	for rows.Next() {
		var a alumni.Alumni
		if err := scanAlumni(rows, &a); err != nil {
			return nil, fmt.Errorf("AlumniRepository.List scan: %w", err)
		}
		list = append(list, a)
	}
	return list, rows.Err()
}

func (r *AlumniRepository) GetByID(ctx context.Context, id string) (*alumni.Alumni, error) {
	var a alumni.Alumni
	err := scanAlumni(r.pool.QueryRow(ctx, `SELECT `+alumniColumns+` FROM alumnis WHERE id = $1`, id), &a)
	if err != nil {
		if errors.Is(err, pgx.ErrNoRows) {
			return nil, nil
		}
		return nil, fmt.Errorf("AlumniRepository.GetByID: %w", err)
	}
	return &a, nil
}

func (r *AlumniRepository) Create(ctx context.Context, id string, in alumni.Input) (*alumni.Alumni, error) {
	var a alumni.Alumni
	err := scanAlumni(r.pool.QueryRow(ctx, `
		INSERT INTO alumnis (id, nama_alumni, npm, tempat_lahir, tanggal_lahir)
		VALUES ($1,$2,$3,$4,$5)
		RETURNING `+alumniColumns,
		id, in.NamaAlumni, in.NPM, in.TempatLahir, in.TanggalLahir,
	), &a)
	if err != nil {
		return nil, fmt.Errorf("AlumniRepository.Create: %w", err)
	}
	return &a, nil
}

func (r *AlumniRepository) Update(ctx context.Context, id string, in alumni.Input) (*alumni.Alumni, error) {
	var a alumni.Alumni
	err := scanAlumni(r.pool.QueryRow(ctx, `
		UPDATE alumnis SET nama_alumni=$2, npm=$3, tempat_lahir=$4, tanggal_lahir=$5
		WHERE id=$1
		RETURNING `+alumniColumns,
		id, in.NamaAlumni, in.NPM, in.TempatLahir, in.TanggalLahir,
	), &a)
	if err != nil {
		return nil, fmt.Errorf("AlumniRepository.Update: %w", err)
	}
	return &a, nil
}

func (r *AlumniRepository) Delete(ctx context.Context, id string) error {
	if _, err := r.pool.Exec(ctx, `DELETE FROM alumnis WHERE id = $1`, id); err != nil {
		return fmt.Errorf("AlumniRepository.Delete: %w", err)
	}
	return nil
}
