package postgres

import (
	"context"
	"errors"
	"fmt"

	"ptik/internal/domain/dosen"

	"github.com/jackc/pgx/v5"
	"github.com/jackc/pgx/v5/pgxpool"
)

type DosenRepository struct{ pool *pgxpool.Pool }

func NewDosenRepository(pool *pgxpool.Pool) *DosenRepository { return &DosenRepository{pool: pool} }

const dosenColumns = `id, nama_dosen, nik, nidn, no_hp, jabatan, pangkat, no_sertifikasi,
	status, foto, tempat_lahir, tanggal_lahir, created_at, updated_at`

func scanDosen(row pgx.Row, d *dosen.Dosen) error {
	return row.Scan(
		&d.ID, &d.NamaDosen, &d.NIK, &d.NIDN, &d.NoHP, &d.Jabatan, &d.Pangkat, &d.NoSertifikasi,
		&d.Status, &d.Foto, &d.TempatLahir, &d.TanggalLahir, &d.CreatedAt, &d.UpdatedAt,
	)
}

func (r *DosenRepository) List(ctx context.Context, search string) ([]dosen.Dosen, error) {
	rows, err := r.pool.Query(ctx, `
		SELECT `+dosenColumns+`
		FROM dosens
		WHERE ($1 = '' OR nama_dosen ILIKE '%' || $1 || '%' OR nidn ILIKE '%' || $1 || '%')
		ORDER BY nama_dosen ASC
	`, search)
	if err != nil {
		return nil, fmt.Errorf("DosenRepository.List: %w", err)
	}
	defer rows.Close()

	list := []dosen.Dosen{}
	for rows.Next() {
		var d dosen.Dosen
		if err := scanDosen(rows, &d); err != nil {
			return nil, fmt.Errorf("DosenRepository.List scan: %w", err)
		}
		list = append(list, d)
	}
	return list, rows.Err()
}

func (r *DosenRepository) GetByID(ctx context.Context, id string) (*dosen.Dosen, error) {
	var d dosen.Dosen
	err := scanDosen(r.pool.QueryRow(ctx, `SELECT `+dosenColumns+` FROM dosens WHERE id = $1`, id), &d)
	if err != nil {
		if errors.Is(err, pgx.ErrNoRows) {
			return nil, nil
		}
		return nil, fmt.Errorf("DosenRepository.GetByID: %w", err)
	}
	return &d, nil
}

func (r *DosenRepository) Create(ctx context.Context, id string, in dosen.Input) (*dosen.Dosen, error) {
	var d dosen.Dosen
	err := scanDosen(r.pool.QueryRow(ctx, `
		INSERT INTO dosens
			(id, nama_dosen, nik, nidn, no_hp, jabatan, pangkat, no_sertifikasi,
			 status, foto, tempat_lahir, tanggal_lahir)
		VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12)
		RETURNING `+dosenColumns,
		id, in.NamaDosen, in.NIK, in.NIDN, in.NoHP, in.Jabatan, in.Pangkat, in.NoSertifikasi,
		in.Status, in.Foto, in.TempatLahir, in.TanggalLahir,
	), &d)
	if err != nil {
		return nil, fmt.Errorf("DosenRepository.Create: %w", err)
	}
	return &d, nil
}

func (r *DosenRepository) Update(ctx context.Context, id string, in dosen.Input) (*dosen.Dosen, error) {
	var d dosen.Dosen
	err := scanDosen(r.pool.QueryRow(ctx, `
		UPDATE dosens SET
			nama_dosen=$2, nik=$3, nidn=$4, no_hp=$5, jabatan=$6, pangkat=$7, no_sertifikasi=$8,
			status=$9, foto=$10, tempat_lahir=$11, tanggal_lahir=$12
		WHERE id=$1
		RETURNING `+dosenColumns,
		id, in.NamaDosen, in.NIK, in.NIDN, in.NoHP, in.Jabatan, in.Pangkat, in.NoSertifikasi,
		in.Status, in.Foto, in.TempatLahir, in.TanggalLahir,
	), &d)
	if err != nil {
		return nil, fmt.Errorf("DosenRepository.Update: %w", err)
	}
	return &d, nil
}

func (r *DosenRepository) Delete(ctx context.Context, id string) error {
	if _, err := r.pool.Exec(ctx, `DELETE FROM dosens WHERE id = $1`, id); err != nil {
		return fmt.Errorf("DosenRepository.Delete: %w", err)
	}
	return nil
}
