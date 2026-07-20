package postgres

import (
	"context"
	"encoding/json"
	"errors"
	"fmt"

	"ptik/internal/domain/challenge"

	"github.com/jackc/pgx/v5"
	"github.com/jackc/pgx/v5/pgxpool"
)

type ChallengeRepository struct{ pool *pgxpool.Pool }

func NewChallengeRepository(pool *pgxpool.Pool) *ChallengeRepository {
	return &ChallengeRepository{pool: pool}
}

// jsonb columns are cast to ::text so pgx hands back plain strings to unmarshal
// (same convention as MenuAccessRepository) instead of relying on binary jsonb decode.
const challengeColumns = `id, judul, deskripsi, poster, lampiran, link_daftar, tanggal_mulai, tanggal_selesai, status,
	tema_subjudul, tema::text, aturan::text, penilaian::text, penilaian_intro, hadiah::text, hadiah_intro,
	hashtags::text, caption_template, created_at, updated_at`

func scanChallenge(row pgx.Row, x *challenge.Challenge) error {
	var temaRaw, aturanRaw, penilaianRaw, hadiahRaw, hashtagsRaw string
	if err := row.Scan(
		&x.ID, &x.Judul, &x.Deskripsi, &x.Poster, &x.Lampiran, &x.LinkDaftar,
		&x.TanggalMulai, &x.TanggalSelesai, &x.Status,
		&x.TemaSubjudul, &temaRaw, &aturanRaw, &penilaianRaw, &x.PenilaianIntro, &hadiahRaw, &x.HadiahIntro,
		&hashtagsRaw, &x.CaptionTemplate,
		&x.CreatedAt, &x.UpdatedAt,
	); err != nil {
		return err
	}
	var err error
	if x.Tema, err = unmarshalPoints(temaRaw); err != nil {
		return err
	}
	if x.Aturan, err = unmarshalPoints(aturanRaw); err != nil {
		return err
	}
	if x.Penilaian, err = unmarshalPoints(penilaianRaw); err != nil {
		return err
	}
	if x.Hadiah, err = unmarshalPoints(hadiahRaw); err != nil {
		return err
	}
	if x.Hashtags, err = unmarshalStrings(hashtagsRaw); err != nil {
		return err
	}
	return nil
}

func unmarshalPoints(raw string) ([]challenge.Point, error) {
	points := []challenge.Point{}
	if raw == "" || raw == "null" {
		return points, nil
	}
	if err := json.Unmarshal([]byte(raw), &points); err != nil {
		return nil, fmt.Errorf("unmarshal points: %w", err)
	}
	return points, nil
}

func marshalPoints(points []challenge.Point) (string, error) {
	if points == nil {
		points = []challenge.Point{}
	}
	b, err := json.Marshal(points)
	if err != nil {
		return "", err
	}
	return string(b), nil
}

func unmarshalStrings(raw string) ([]string, error) {
	tags := []string{}
	if raw == "" || raw == "null" {
		return tags, nil
	}
	if err := json.Unmarshal([]byte(raw), &tags); err != nil {
		return nil, fmt.Errorf("unmarshal strings: %w", err)
	}
	return tags, nil
}

func marshalStrings(tags []string) (string, error) {
	if tags == nil {
		tags = []string{}
	}
	b, err := json.Marshal(tags)
	if err != nil {
		return "", err
	}
	return string(b), nil
}

func (r *ChallengeRepository) List(ctx context.Context, search, status string) ([]challenge.Challenge, error) {
	rows, err := r.pool.Query(ctx, `
		SELECT `+challengeColumns+`
		FROM challenges
		WHERE ($1 = '' OR judul ILIKE '%' || $1 || '%')
		  AND ($2 = '' OR status = $2)
		ORDER BY tanggal_mulai DESC, judul ASC
	`, search, status)
	if err != nil {
		return nil, fmt.Errorf("ChallengeRepository.List: %w", err)
	}
	defer rows.Close()

	list := []challenge.Challenge{}
	for rows.Next() {
		var x challenge.Challenge
		if err := scanChallenge(rows, &x); err != nil {
			return nil, fmt.Errorf("ChallengeRepository.List scan: %w", err)
		}
		list = append(list, x)
	}
	return list, rows.Err()
}

func (r *ChallengeRepository) GetByID(ctx context.Context, id string) (*challenge.Challenge, error) {
	var x challenge.Challenge
	err := scanChallenge(r.pool.QueryRow(ctx, `SELECT `+challengeColumns+` FROM challenges WHERE id = $1`, id), &x)
	if err != nil {
		if errors.Is(err, pgx.ErrNoRows) {
			return nil, nil
		}
		return nil, fmt.Errorf("ChallengeRepository.GetByID: %w", err)
	}
	return &x, nil
}

func (r *ChallengeRepository) Create(ctx context.Context, id string, in challenge.Input) (*challenge.Challenge, error) {
	tema, err := marshalPoints(in.Tema)
	if err != nil {
		return nil, fmt.Errorf("ChallengeRepository.Create marshal tema: %w", err)
	}
	aturan, err := marshalPoints(in.Aturan)
	if err != nil {
		return nil, fmt.Errorf("ChallengeRepository.Create marshal aturan: %w", err)
	}
	penilaian, err := marshalPoints(in.Penilaian)
	if err != nil {
		return nil, fmt.Errorf("ChallengeRepository.Create marshal penilaian: %w", err)
	}
	hadiah, err := marshalPoints(in.Hadiah)
	if err != nil {
		return nil, fmt.Errorf("ChallengeRepository.Create marshal hadiah: %w", err)
	}
	hashtags, err := marshalStrings(in.Hashtags)
	if err != nil {
		return nil, fmt.Errorf("ChallengeRepository.Create marshal hashtags: %w", err)
	}

	var x challenge.Challenge
	err = scanChallenge(r.pool.QueryRow(ctx, `
		INSERT INTO challenges (id, judul, deskripsi, poster, lampiran, link_daftar, tanggal_mulai, tanggal_selesai, status,
			tema_subjudul, tema, aturan, penilaian, penilaian_intro, hadiah, hadiah_intro, hashtags, caption_template)
		VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11::jsonb, $12::jsonb, $13::jsonb, $14, $15::jsonb, $16, $17::jsonb, $18)
		RETURNING `+challengeColumns,
		id, in.Judul, in.Deskripsi, in.Poster, in.Lampiran, in.LinkDaftar, in.TanggalMulai, in.TanggalSelesai, in.Status,
		in.TemaSubjudul, tema, aturan, penilaian, in.PenilaianIntro, hadiah, in.HadiahIntro, hashtags, in.CaptionTemplate,
	), &x)
	if err != nil {
		return nil, fmt.Errorf("ChallengeRepository.Create: %w", err)
	}
	return &x, nil
}

func (r *ChallengeRepository) Update(ctx context.Context, id string, in challenge.Input) (*challenge.Challenge, error) {
	tema, err := marshalPoints(in.Tema)
	if err != nil {
		return nil, fmt.Errorf("ChallengeRepository.Update marshal tema: %w", err)
	}
	aturan, err := marshalPoints(in.Aturan)
	if err != nil {
		return nil, fmt.Errorf("ChallengeRepository.Update marshal aturan: %w", err)
	}
	penilaian, err := marshalPoints(in.Penilaian)
	if err != nil {
		return nil, fmt.Errorf("ChallengeRepository.Update marshal penilaian: %w", err)
	}
	hadiah, err := marshalPoints(in.Hadiah)
	if err != nil {
		return nil, fmt.Errorf("ChallengeRepository.Update marshal hadiah: %w", err)
	}
	hashtags, err := marshalStrings(in.Hashtags)
	if err != nil {
		return nil, fmt.Errorf("ChallengeRepository.Update marshal hashtags: %w", err)
	}

	var x challenge.Challenge
	err = scanChallenge(r.pool.QueryRow(ctx, `
		UPDATE challenges SET judul=$2, deskripsi=$3, poster=$4, lampiran=$5, link_daftar=$6,
			tanggal_mulai=$7, tanggal_selesai=$8, status=$9, tema_subjudul=$10,
			tema=$11::jsonb, aturan=$12::jsonb, penilaian=$13::jsonb, penilaian_intro=$14,
			hadiah=$15::jsonb, hadiah_intro=$16, hashtags=$17::jsonb, caption_template=$18
		WHERE id=$1
		RETURNING `+challengeColumns,
		id, in.Judul, in.Deskripsi, in.Poster, in.Lampiran, in.LinkDaftar, in.TanggalMulai, in.TanggalSelesai, in.Status,
		in.TemaSubjudul, tema, aturan, penilaian, in.PenilaianIntro, hadiah, in.HadiahIntro, hashtags, in.CaptionTemplate,
	), &x)
	if err != nil {
		return nil, fmt.Errorf("ChallengeRepository.Update: %w", err)
	}
	return &x, nil
}

func (r *ChallengeRepository) Delete(ctx context.Context, id string) error {
	if _, err := r.pool.Exec(ctx, `DELETE FROM challenges WHERE id = $1`, id); err != nil {
		return fmt.Errorf("ChallengeRepository.Delete: %w", err)
	}
	return nil
}
