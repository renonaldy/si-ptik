package postgres

import (
	"context"
	"errors"
	"fmt"

	"ptik/internal/domain/ujian"

	"github.com/jackc/pgx/v5"
	"github.com/jackc/pgx/v5/pgxpool"
)

type UjianRepository struct{ pool *pgxpool.Pool }

func NewUjianRepository(pool *pgxpool.Pool) *UjianRepository { return &UjianRepository{pool: pool} }

const ujianColumns = `id, nama, npm, jenis, judul, pembimbing, penguji1, penguji2, tanggal, jam, jam_selesai, ruang, status, foto, file_skripsi, file_ppt, created_at, updated_at`

func scanUjian(row pgx.Row, x *ujian.Ujian) error {
	return row.Scan(&x.ID, &x.Nama, &x.NPM, &x.Jenis, &x.Judul, &x.Pembimbing, &x.Penguji1, &x.Penguji2, &x.Tanggal, &x.Jam, &x.JamSelesai, &x.Ruang, &x.Status, &x.Foto, &x.FileSkripsi, &x.FilePPT, &x.CreatedAt, &x.UpdatedAt)
}

func (r *UjianRepository) List(ctx context.Context, search string) ([]ujian.Ujian, error) {
	rows, err := r.pool.Query(ctx, `
		SELECT `+ujianColumns+`
		FROM ujians
		WHERE ($1 = '' OR nama ILIKE '%' || $1 || '%' OR npm ILIKE '%' || $1 || '%')
		ORDER BY tanggal ASC, nama ASC
	`, search)
	if err != nil {
		return nil, fmt.Errorf("UjianRepository.List: %w", err)
	}
	defer rows.Close()

	list := []ujian.Ujian{}
	for rows.Next() {
		var x ujian.Ujian
		if err := scanUjian(rows, &x); err != nil {
			return nil, fmt.Errorf("UjianRepository.List scan: %w", err)
		}
		list = append(list, x)
	}
	return list, rows.Err()
}

func (r *UjianRepository) GetByID(ctx context.Context, id string) (*ujian.Ujian, error) {
	var x ujian.Ujian
	err := scanUjian(r.pool.QueryRow(ctx, `SELECT `+ujianColumns+` FROM ujians WHERE id = $1`, id), &x)
	if err != nil {
		if errors.Is(err, pgx.ErrNoRows) {
			return nil, nil
		}
		return nil, fmt.Errorf("UjianRepository.GetByID: %w", err)
	}
	return &x, nil
}

func (r *UjianRepository) Create(ctx context.Context, id string, in ujian.Input) (*ujian.Ujian, error) {
	var x ujian.Ujian
	err := scanUjian(r.pool.QueryRow(ctx, `
		INSERT INTO ujians (id, nama, npm, jenis, judul, pembimbing, penguji1, penguji2, tanggal, jam, jam_selesai, ruang, status, foto, file_skripsi, file_ppt)
		VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16)
		RETURNING `+ujianColumns,
		id, in.Nama, in.NPM, in.Jenis, in.Judul, in.Pembimbing, in.Penguji1, in.Penguji2, in.Tanggal, in.Jam, in.JamSelesai, in.Ruang, in.Status, in.Foto, in.FileSkripsi, in.FilePPT,
	), &x)
	if err != nil {
		return nil, fmt.Errorf("UjianRepository.Create: %w", err)
	}
	return &x, nil
}

func (r *UjianRepository) Update(ctx context.Context, id string, in ujian.Input) (*ujian.Ujian, error) {
	var x ujian.Ujian
	err := scanUjian(r.pool.QueryRow(ctx, `
		UPDATE ujians SET nama=$2, npm=$3, jenis=$4, judul=$5, pembimbing=$6, penguji1=$7, penguji2=$8, tanggal=$9, jam=$10, jam_selesai=$11, ruang=$12, status=$13, foto=$14, file_skripsi=$15, file_ppt=$16
		WHERE id=$1
		RETURNING `+ujianColumns,
		id, in.Nama, in.NPM, in.Jenis, in.Judul, in.Pembimbing, in.Penguji1, in.Penguji2, in.Tanggal, in.Jam, in.JamSelesai, in.Ruang, in.Status, in.Foto, in.FileSkripsi, in.FilePPT,
	), &x)
	if err != nil {
		return nil, fmt.Errorf("UjianRepository.Update: %w", err)
	}
	return &x, nil
}

func (r *UjianRepository) Delete(ctx context.Context, id string) error {
	if _, err := r.pool.Exec(ctx, `DELETE FROM ujians WHERE id = $1`, id); err != nil {
		return fmt.Errorf("UjianRepository.Delete: %w", err)
	}
	return nil
}
