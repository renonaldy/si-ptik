package postgres

import (
	"context"
	"errors"
	"fmt"

	"ptik/internal/domain/microsoft"

	"github.com/jackc/pgx/v5"
	"github.com/jackc/pgx/v5/pgxpool"
)

type MicrosoftRepository struct{ pool *pgxpool.Pool }

func NewMicrosoftRepository(pool *pgxpool.Pool) *MicrosoftRepository {
	return &MicrosoftRepository{pool: pool}
}

const microsoftColumns = `id, nama, npm, jenis_pelatihan, bukti_pembayaran, status, created_at, updated_at`

func scanMicrosoft(row pgx.Row, x *microsoft.Microsoft) error {
	return row.Scan(&x.ID, &x.Nama, &x.NPM, &x.JenisPelatihan, &x.BuktiPembayaran, &x.Status, &x.CreatedAt, &x.UpdatedAt)
}

func (r *MicrosoftRepository) List(ctx context.Context, search string) ([]microsoft.Microsoft, error) {
	rows, err := r.pool.Query(ctx, `
		SELECT `+microsoftColumns+`
		FROM microsofts
		WHERE ($1 = '' OR nama ILIKE '%' || $1 || '%' OR npm ILIKE '%' || $1 || '%')
		ORDER BY created_at DESC
	`, search)
	if err != nil {
		return nil, fmt.Errorf("MicrosoftRepository.List: %w", err)
	}
	defer rows.Close()

	list := []microsoft.Microsoft{}
	for rows.Next() {
		var x microsoft.Microsoft
		if err := scanMicrosoft(rows, &x); err != nil {
			return nil, fmt.Errorf("MicrosoftRepository.List scan: %w", err)
		}
		list = append(list, x)
	}
	return list, rows.Err()
}

func (r *MicrosoftRepository) GetByID(ctx context.Context, id string) (*microsoft.Microsoft, error) {
	var x microsoft.Microsoft
	err := scanMicrosoft(r.pool.QueryRow(ctx, `SELECT `+microsoftColumns+` FROM microsofts WHERE id = $1`, id), &x)
	if err != nil {
		if errors.Is(err, pgx.ErrNoRows) {
			return nil, nil
		}
		return nil, fmt.Errorf("MicrosoftRepository.GetByID: %w", err)
	}
	return &x, nil
}

func (r *MicrosoftRepository) Create(ctx context.Context, id string, in microsoft.Input) (*microsoft.Microsoft, error) {
	var x microsoft.Microsoft
	err := scanMicrosoft(r.pool.QueryRow(ctx, `
		INSERT INTO microsofts (id, nama, npm, jenis_pelatihan, bukti_pembayaran)
		VALUES ($1, $2, $3, $4, $5)
		RETURNING `+microsoftColumns,
		id, in.Nama, in.NPM, in.JenisPelatihan, in.BuktiPembayaran,
	), &x)
	if err != nil {
		return nil, fmt.Errorf("MicrosoftRepository.Create: %w", err)
	}
	return &x, nil
}

func (r *MicrosoftRepository) Update(ctx context.Context, id string, in microsoft.Input) (*microsoft.Microsoft, error) {
	var x microsoft.Microsoft
	err := scanMicrosoft(r.pool.QueryRow(ctx, `
		UPDATE microsofts SET nama=$2, npm=$3, jenis_pelatihan=$4, bukti_pembayaran=$5
		WHERE id=$1
		RETURNING `+microsoftColumns,
		id, in.Nama, in.NPM, in.JenisPelatihan, in.BuktiPembayaran,
	), &x)
	if err != nil {
		return nil, fmt.Errorf("MicrosoftRepository.Update: %w", err)
	}
	return &x, nil
}

func (r *MicrosoftRepository) UpdateStatus(ctx context.Context, id, status string) (*microsoft.Microsoft, error) {
	var x microsoft.Microsoft
	err := scanMicrosoft(r.pool.QueryRow(ctx, `
		UPDATE microsofts SET status=$2
		WHERE id=$1
		RETURNING `+microsoftColumns,
		id, status,
	), &x)
	if err != nil {
		return nil, fmt.Errorf("MicrosoftRepository.UpdateStatus: %w", err)
	}
	return &x, nil
}

func (r *MicrosoftRepository) Delete(ctx context.Context, id string) error {
	if _, err := r.pool.Exec(ctx, `DELETE FROM microsofts WHERE id = $1`, id); err != nil {
		return fmt.Errorf("MicrosoftRepository.Delete: %w", err)
	}
	return nil
}
