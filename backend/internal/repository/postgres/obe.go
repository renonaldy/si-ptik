package postgres

import (
	"context"
	"errors"
	"fmt"

	"ptik/internal/domain/obe"

	"github.com/jackc/pgx/v5"
	"github.com/jackc/pgx/v5/pgxpool"
)

type OBERepository struct{ pool *pgxpool.Pool }

func NewOBERepository(pool *pgxpool.Pool) *OBERepository { return &OBERepository{pool: pool} }

// ─────────────────────────────── Curriculums ────────────────────────────────

const curriculumCols = `id, nama, tahun, nomor_sk, tanggal_berlaku, is_active, deskripsi, buku_url, struktur_url, threshold, created_at, updated_at`

func scanCurriculum(row pgx.Row, c *obe.Curriculum) error {
	return row.Scan(&c.ID, &c.Nama, &c.Tahun, &c.NomorSK, &c.TanggalBerlaku, &c.IsActive, &c.Deskripsi, &c.BukuURL, &c.StrukturURL, &c.Threshold, &c.CreatedAt, &c.UpdatedAt)
}

func (r *OBERepository) ListCurriculums(ctx context.Context) ([]obe.Curriculum, error) {
	rows, err := r.pool.Query(ctx, `SELECT `+curriculumCols+` FROM obe_curriculums ORDER BY is_active DESC, tahun DESC, created_at DESC`)
	if err != nil {
		return nil, fmt.Errorf("OBERepository.ListCurriculums: %w", err)
	}
	defer rows.Close()
	list := []obe.Curriculum{}
	for rows.Next() {
		var c obe.Curriculum
		if err := scanCurriculum(rows, &c); err != nil {
			return nil, fmt.Errorf("OBERepository.ListCurriculums scan: %w", err)
		}
		list = append(list, c)
	}
	return list, rows.Err()
}

func (r *OBERepository) GetCurriculum(ctx context.Context, id string) (*obe.Curriculum, error) {
	var c obe.Curriculum
	err := scanCurriculum(r.pool.QueryRow(ctx, `SELECT `+curriculumCols+` FROM obe_curriculums WHERE id=$1`, id), &c)
	if err != nil {
		if errors.Is(err, pgx.ErrNoRows) {
			return nil, nil
		}
		return nil, fmt.Errorf("OBERepository.GetCurriculum: %w", err)
	}
	return &c, nil
}

func (r *OBERepository) GetActiveCurriculum(ctx context.Context) (*obe.Curriculum, error) {
	var c obe.Curriculum
	err := scanCurriculum(r.pool.QueryRow(ctx, `SELECT `+curriculumCols+` FROM obe_curriculums WHERE is_active LIMIT 1`), &c)
	if err != nil {
		if errors.Is(err, pgx.ErrNoRows) {
			return nil, nil
		}
		return nil, fmt.Errorf("OBERepository.GetActiveCurriculum: %w", err)
	}
	return &c, nil
}

func (r *OBERepository) CreateCurriculum(ctx context.Context, id string, in obe.CurriculumInput) (*obe.Curriculum, error) {
	var c obe.Curriculum
	err := scanCurriculum(r.pool.QueryRow(ctx, `
		INSERT INTO obe_curriculums (id, nama, tahun, nomor_sk, tanggal_berlaku, deskripsi, buku_url, struktur_url, threshold)
		VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)
		RETURNING `+curriculumCols,
		id, in.Nama, in.Tahun, in.NomorSK, in.TanggalBerlaku, in.Deskripsi, in.BukuURL, in.StrukturURL, in.Threshold,
	), &c)
	if err != nil {
		return nil, fmt.Errorf("OBERepository.CreateCurriculum: %w", err)
	}
	return &c, nil
}

func (r *OBERepository) UpdateCurriculum(ctx context.Context, id string, in obe.CurriculumInput) (*obe.Curriculum, error) {
	var c obe.Curriculum
	err := scanCurriculum(r.pool.QueryRow(ctx, `
		UPDATE obe_curriculums
		SET nama=$2, tahun=$3, nomor_sk=$4, tanggal_berlaku=$5, deskripsi=$6, buku_url=$7, struktur_url=$8, threshold=$9
		WHERE id=$1
		RETURNING `+curriculumCols,
		id, in.Nama, in.Tahun, in.NomorSK, in.TanggalBerlaku, in.Deskripsi, in.BukuURL, in.StrukturURL, in.Threshold,
	), &c)
	if err != nil {
		return nil, fmt.Errorf("OBERepository.UpdateCurriculum: %w", err)
	}
	return &c, nil
}

func (r *OBERepository) DeleteCurriculum(ctx context.Context, id string) error {
	if _, err := r.pool.Exec(ctx, `DELETE FROM obe_curriculums WHERE id=$1`, id); err != nil {
		return fmt.Errorf("OBERepository.DeleteCurriculum: %w", err)
	}
	return nil
}

// SetActiveCurriculum flips the active flag in a transaction: clear all first
// (0 rows active), then set the target (1 row active), so the partial unique
// index is satisfied at every statement boundary.
func (r *OBERepository) SetActiveCurriculum(ctx context.Context, id string) (*obe.Curriculum, error) {
	tx, err := r.pool.Begin(ctx)
	if err != nil {
		return nil, fmt.Errorf("OBERepository.SetActiveCurriculum begin: %w", err)
	}
	defer tx.Rollback(ctx)

	if _, err := tx.Exec(ctx, `UPDATE obe_curriculums SET is_active=false WHERE is_active`); err != nil {
		return nil, fmt.Errorf("OBERepository.SetActiveCurriculum clear: %w", err)
	}
	var c obe.Curriculum
	err = scanCurriculum(tx.QueryRow(ctx, `UPDATE obe_curriculums SET is_active=true WHERE id=$1 RETURNING `+curriculumCols, id), &c)
	if err != nil {
		return nil, fmt.Errorf("OBERepository.SetActiveCurriculum set: %w", err)
	}
	if err := tx.Commit(ctx); err != nil {
		return nil, fmt.Errorf("OBERepository.SetActiveCurriculum commit: %w", err)
	}
	return &c, nil
}

// ───────────────────────────────── Courses ──────────────────────────────────

const courseCols = `id, curriculum_id, kode, nama, sks, semester, deskripsi, rps_url, created_at, updated_at`

func scanCourse(row pgx.Row, c *obe.Course) error {
	return row.Scan(&c.ID, &c.CurriculumID, &c.Kode, &c.Nama, &c.SKS, &c.Semester, &c.Deskripsi, &c.RPSURL, &c.CreatedAt, &c.UpdatedAt)
}

func (r *OBERepository) ListCourses(ctx context.Context, curriculumID string, semester int) ([]obe.Course, error) {
	rows, err := r.pool.Query(ctx, `
		SELECT `+courseCols+` FROM obe_courses
		WHERE ($1 = '' OR curriculum_id = $1) AND ($2 = 0 OR semester = $2)
		ORDER BY semester, kode, nama
	`, curriculumID, semester)
	if err != nil {
		return nil, fmt.Errorf("OBERepository.ListCourses: %w", err)
	}
	defer rows.Close()
	list := []obe.Course{}
	for rows.Next() {
		var c obe.Course
		if err := scanCourse(rows, &c); err != nil {
			return nil, fmt.Errorf("OBERepository.ListCourses scan: %w", err)
		}
		list = append(list, c)
	}
	return list, rows.Err()
}

func (r *OBERepository) GetCourse(ctx context.Context, id string) (*obe.Course, error) {
	var c obe.Course
	err := scanCourse(r.pool.QueryRow(ctx, `SELECT `+courseCols+` FROM obe_courses WHERE id=$1`, id), &c)
	if err != nil {
		if errors.Is(err, pgx.ErrNoRows) {
			return nil, nil
		}
		return nil, fmt.Errorf("OBERepository.GetCourse: %w", err)
	}
	return &c, nil
}

func (r *OBERepository) CreateCourse(ctx context.Context, id string, in obe.CourseInput) (*obe.Course, error) {
	var c obe.Course
	err := scanCourse(r.pool.QueryRow(ctx, `
		INSERT INTO obe_courses (id, curriculum_id, kode, nama, sks, semester, deskripsi, rps_url)
		VALUES ($1,$2,$3,$4,$5,$6,$7,$8)
		RETURNING `+courseCols,
		id, in.CurriculumID, in.Kode, in.Nama, in.SKS, in.Semester, in.Deskripsi, in.RPSURL,
	), &c)
	if err != nil {
		return nil, fmt.Errorf("OBERepository.CreateCourse: %w", err)
	}
	return &c, nil
}

func (r *OBERepository) UpdateCourse(ctx context.Context, id string, in obe.CourseInput) (*obe.Course, error) {
	var c obe.Course
	err := scanCourse(r.pool.QueryRow(ctx, `
		UPDATE obe_courses
		SET curriculum_id=$2, kode=$3, nama=$4, sks=$5, semester=$6, deskripsi=$7, rps_url=$8
		WHERE id=$1
		RETURNING `+courseCols,
		id, in.CurriculumID, in.Kode, in.Nama, in.SKS, in.Semester, in.Deskripsi, in.RPSURL,
	), &c)
	if err != nil {
		return nil, fmt.Errorf("OBERepository.UpdateCourse: %w", err)
	}
	return &c, nil
}

func (r *OBERepository) DeleteCourse(ctx context.Context, id string) error {
	if _, err := r.pool.Exec(ctx, `DELETE FROM obe_courses WHERE id=$1`, id); err != nil {
		return fmt.Errorf("OBERepository.DeleteCourse: %w", err)
	}
	return nil
}

// ─────────────────────────────────── CPL ────────────────────────────────────

const cplCols = `id, curriculum_id, kode, deskripsi, kategori, created_at, updated_at`

func scanCPL(row pgx.Row, c *obe.CPL) error {
	return row.Scan(&c.ID, &c.CurriculumID, &c.Kode, &c.Deskripsi, &c.Kategori, &c.CreatedAt, &c.UpdatedAt)
}

func (r *OBERepository) ListCPL(ctx context.Context, curriculumID string) ([]obe.CPL, error) {
	rows, err := r.pool.Query(ctx, `
		SELECT `+cplCols+` FROM obe_cpl
		WHERE ($1 = '' OR curriculum_id = $1)
		ORDER BY kode, created_at
	`, curriculumID)
	if err != nil {
		return nil, fmt.Errorf("OBERepository.ListCPL: %w", err)
	}
	defer rows.Close()
	list := []obe.CPL{}
	for rows.Next() {
		var c obe.CPL
		if err := scanCPL(rows, &c); err != nil {
			return nil, fmt.Errorf("OBERepository.ListCPL scan: %w", err)
		}
		list = append(list, c)
	}
	return list, rows.Err()
}

func (r *OBERepository) GetCPL(ctx context.Context, id string) (*obe.CPL, error) {
	var c obe.CPL
	err := scanCPL(r.pool.QueryRow(ctx, `SELECT `+cplCols+` FROM obe_cpl WHERE id=$1`, id), &c)
	if err != nil {
		if errors.Is(err, pgx.ErrNoRows) {
			return nil, nil
		}
		return nil, fmt.Errorf("OBERepository.GetCPL: %w", err)
	}
	return &c, nil
}

func (r *OBERepository) CreateCPL(ctx context.Context, id string, in obe.CPLInput) (*obe.CPL, error) {
	var c obe.CPL
	err := scanCPL(r.pool.QueryRow(ctx, `
		INSERT INTO obe_cpl (id, curriculum_id, kode, deskripsi, kategori)
		VALUES ($1,$2,$3,$4,$5)
		RETURNING `+cplCols,
		id, in.CurriculumID, in.Kode, in.Deskripsi, in.Kategori,
	), &c)
	if err != nil {
		return nil, fmt.Errorf("OBERepository.CreateCPL: %w", err)
	}
	return &c, nil
}

func (r *OBERepository) UpdateCPL(ctx context.Context, id string, in obe.CPLInput) (*obe.CPL, error) {
	var c obe.CPL
	err := scanCPL(r.pool.QueryRow(ctx, `
		UPDATE obe_cpl SET curriculum_id=$2, kode=$3, deskripsi=$4, kategori=$5
		WHERE id=$1
		RETURNING `+cplCols,
		id, in.CurriculumID, in.Kode, in.Deskripsi, in.Kategori,
	), &c)
	if err != nil {
		return nil, fmt.Errorf("OBERepository.UpdateCPL: %w", err)
	}
	return &c, nil
}

func (r *OBERepository) DeleteCPL(ctx context.Context, id string) error {
	if _, err := r.pool.Exec(ctx, `DELETE FROM obe_cpl WHERE id=$1`, id); err != nil {
		return fmt.Errorf("OBERepository.DeleteCPL: %w", err)
	}
	return nil
}

// ─────────────────────────────────── CPMK ───────────────────────────────────

const cpmkCols = `id, course_id, kode, deskripsi, level_bloom, target, created_at, updated_at`

func scanCPMK(row pgx.Row, c *obe.CPMK) error {
	return row.Scan(&c.ID, &c.CourseID, &c.Kode, &c.Deskripsi, &c.LevelBloom, &c.Target, &c.CreatedAt, &c.UpdatedAt)
}

func (r *OBERepository) ListCPMKByCourse(ctx context.Context, courseID string) ([]obe.CPMK, error) {
	rows, err := r.pool.Query(ctx, `SELECT `+cpmkCols+` FROM obe_cpmk WHERE course_id=$1 ORDER BY kode, created_at`, courseID)
	if err != nil {
		return nil, fmt.Errorf("OBERepository.ListCPMKByCourse: %w", err)
	}
	defer rows.Close()
	return collectCPMK(rows)
}

func (r *OBERepository) ListCPMKByCurriculum(ctx context.Context, curriculumID string) ([]obe.CPMK, error) {
	rows, err := r.pool.Query(ctx, `
		SELECT m.id, m.course_id, m.kode, m.deskripsi, m.level_bloom, m.target, m.created_at, m.updated_at
		FROM obe_cpmk m JOIN obe_courses c ON c.id = m.course_id
		WHERE c.curriculum_id = $1
		ORDER BY m.kode, m.created_at
	`, curriculumID)
	if err != nil {
		return nil, fmt.Errorf("OBERepository.ListCPMKByCurriculum: %w", err)
	}
	defer rows.Close()
	return collectCPMK(rows)
}

func collectCPMK(rows pgx.Rows) ([]obe.CPMK, error) {
	list := []obe.CPMK{}
	for rows.Next() {
		var c obe.CPMK
		if err := scanCPMK(rows, &c); err != nil {
			return nil, fmt.Errorf("collectCPMK scan: %w", err)
		}
		list = append(list, c)
	}
	return list, rows.Err()
}

func (r *OBERepository) GetCPMK(ctx context.Context, id string) (*obe.CPMK, error) {
	var c obe.CPMK
	err := scanCPMK(r.pool.QueryRow(ctx, `SELECT `+cpmkCols+` FROM obe_cpmk WHERE id=$1`, id), &c)
	if err != nil {
		if errors.Is(err, pgx.ErrNoRows) {
			return nil, nil
		}
		return nil, fmt.Errorf("OBERepository.GetCPMK: %w", err)
	}
	return &c, nil
}

func (r *OBERepository) CreateCPMK(ctx context.Context, id string, in obe.CPMKInput) (*obe.CPMK, error) {
	var c obe.CPMK
	err := scanCPMK(r.pool.QueryRow(ctx, `
		INSERT INTO obe_cpmk (id, course_id, kode, deskripsi, level_bloom, target)
		VALUES ($1,$2,$3,$4,$5,$6)
		RETURNING `+cpmkCols,
		id, in.CourseID, in.Kode, in.Deskripsi, in.LevelBloom, in.Target,
	), &c)
	if err != nil {
		return nil, fmt.Errorf("OBERepository.CreateCPMK: %w", err)
	}
	return &c, nil
}

func (r *OBERepository) UpdateCPMK(ctx context.Context, id string, in obe.CPMKInput) (*obe.CPMK, error) {
	var c obe.CPMK
	err := scanCPMK(r.pool.QueryRow(ctx, `
		UPDATE obe_cpmk SET course_id=$2, kode=$3, deskripsi=$4, level_bloom=$5, target=$6
		WHERE id=$1
		RETURNING `+cpmkCols,
		id, in.CourseID, in.Kode, in.Deskripsi, in.LevelBloom, in.Target,
	), &c)
	if err != nil {
		return nil, fmt.Errorf("OBERepository.UpdateCPMK: %w", err)
	}
	return &c, nil
}

func (r *OBERepository) DeleteCPMK(ctx context.Context, id string) error {
	if _, err := r.pool.Exec(ctx, `DELETE FROM obe_cpmk WHERE id=$1`, id); err != nil {
		return fmt.Errorf("OBERepository.DeleteCPMK: %w", err)
	}
	return nil
}

// ─────────────────────────────────── RPS ────────────────────────────────────

const rpsCols = `id, course_id, minggu, cpmk_id, materi, metode, assessment, created_at, updated_at`

func scanRPS(row pgx.Row, c *obe.RPS) error {
	return row.Scan(&c.ID, &c.CourseID, &c.Minggu, &c.CPMKID, &c.Materi, &c.Metode, &c.Assessment, &c.CreatedAt, &c.UpdatedAt)
}

func (r *OBERepository) ListRPS(ctx context.Context, courseID string) ([]obe.RPS, error) {
	rows, err := r.pool.Query(ctx, `SELECT `+rpsCols+` FROM obe_rps WHERE course_id=$1 ORDER BY minggu, created_at`, courseID)
	if err != nil {
		return nil, fmt.Errorf("OBERepository.ListRPS: %w", err)
	}
	defer rows.Close()
	list := []obe.RPS{}
	for rows.Next() {
		var c obe.RPS
		if err := scanRPS(rows, &c); err != nil {
			return nil, fmt.Errorf("OBERepository.ListRPS scan: %w", err)
		}
		list = append(list, c)
	}
	return list, rows.Err()
}

func (r *OBERepository) GetRPS(ctx context.Context, id string) (*obe.RPS, error) {
	var c obe.RPS
	err := scanRPS(r.pool.QueryRow(ctx, `SELECT `+rpsCols+` FROM obe_rps WHERE id=$1`, id), &c)
	if err != nil {
		if errors.Is(err, pgx.ErrNoRows) {
			return nil, nil
		}
		return nil, fmt.Errorf("OBERepository.GetRPS: %w", err)
	}
	return &c, nil
}

func (r *OBERepository) CreateRPS(ctx context.Context, id string, in obe.RPSInput) (*obe.RPS, error) {
	var c obe.RPS
	err := scanRPS(r.pool.QueryRow(ctx, `
		INSERT INTO obe_rps (id, course_id, minggu, cpmk_id, materi, metode, assessment)
		VALUES ($1,$2,$3,$4,$5,$6,$7)
		RETURNING `+rpsCols,
		id, in.CourseID, in.Minggu, in.CPMKID, in.Materi, in.Metode, in.Assessment,
	), &c)
	if err != nil {
		return nil, fmt.Errorf("OBERepository.CreateRPS: %w", err)
	}
	return &c, nil
}

func (r *OBERepository) UpdateRPS(ctx context.Context, id string, in obe.RPSInput) (*obe.RPS, error) {
	var c obe.RPS
	err := scanRPS(r.pool.QueryRow(ctx, `
		UPDATE obe_rps SET course_id=$2, minggu=$3, cpmk_id=$4, materi=$5, metode=$6, assessment=$7
		WHERE id=$1
		RETURNING `+rpsCols,
		id, in.CourseID, in.Minggu, in.CPMKID, in.Materi, in.Metode, in.Assessment,
	), &c)
	if err != nil {
		return nil, fmt.Errorf("OBERepository.UpdateRPS: %w", err)
	}
	return &c, nil
}

func (r *OBERepository) DeleteRPS(ctx context.Context, id string) error {
	if _, err := r.pool.Exec(ctx, `DELETE FROM obe_rps WHERE id=$1`, id); err != nil {
		return fmt.Errorf("OBERepository.DeleteRPS: %w", err)
	}
	return nil
}

// ─────────────────────────────── Mapping ────────────────────────────────────

func (r *OBERepository) ListLinksByCurriculum(ctx context.Context, curriculumID string) ([]obe.Link, error) {
	rows, err := r.pool.Query(ctx, `
		SELECT mm.cpl_id, mm.cpmk_id
		FROM obe_cpl_cpmk mm JOIN obe_cpl l ON l.id = mm.cpl_id
		WHERE l.curriculum_id = $1
	`, curriculumID)
	if err != nil {
		return nil, fmt.Errorf("OBERepository.ListLinksByCurriculum: %w", err)
	}
	defer rows.Close()
	list := []obe.Link{}
	for rows.Next() {
		var l obe.Link
		if err := rows.Scan(&l.CPLID, &l.CPMKID); err != nil {
			return nil, fmt.Errorf("OBERepository.ListLinksByCurriculum scan: %w", err)
		}
		list = append(list, l)
	}
	return list, rows.Err()
}

func (r *OBERepository) AddLink(ctx context.Context, cplID, cpmkID string) error {
	if _, err := r.pool.Exec(ctx, `
		INSERT INTO obe_cpl_cpmk (cpl_id, cpmk_id) VALUES ($1,$2)
		ON CONFLICT (cpl_id, cpmk_id) DO NOTHING
	`, cplID, cpmkID); err != nil {
		return fmt.Errorf("OBERepository.AddLink: %w", err)
	}
	return nil
}

func (r *OBERepository) RemoveLink(ctx context.Context, cplID, cpmkID string) error {
	if _, err := r.pool.Exec(ctx, `DELETE FROM obe_cpl_cpmk WHERE cpl_id=$1 AND cpmk_id=$2`, cplID, cpmkID); err != nil {
		return fmt.Errorf("OBERepository.RemoveLink: %w", err)
	}
	return nil
}

// ─────────────────────────────────── Stats ──────────────────────────────────

func (r *OBERepository) CountsFor(ctx context.Context, curriculumID string) (*obe.Counts, error) {
	c := &obe.Counts{CoursesBySemester: map[int]int{}, CPLByKategori: map[string]int{}}

	// Courses + total SKS, grouped by semester.
	courseRows, err := r.pool.Query(ctx, `
		SELECT semester, COUNT(*), COALESCE(SUM(sks), 0)
		FROM obe_courses WHERE curriculum_id=$1 GROUP BY semester
	`, curriculumID)
	if err != nil {
		return nil, fmt.Errorf("OBERepository.CountsFor courses: %w", err)
	}
	for courseRows.Next() {
		var sem, cnt, sks int
		if err := courseRows.Scan(&sem, &cnt, &sks); err != nil {
			courseRows.Close()
			return nil, fmt.Errorf("OBERepository.CountsFor courses scan: %w", err)
		}
		c.CoursesBySemester[sem] = cnt
		c.CourseCount += cnt
		c.TotalSKS += sks
	}
	courseRows.Close()
	if err := courseRows.Err(); err != nil {
		return nil, fmt.Errorf("OBERepository.CountsFor courses rows: %w", err)
	}

	// CPL grouped by kategori.
	cplRows, err := r.pool.Query(ctx, `SELECT kategori, COUNT(*) FROM obe_cpl WHERE curriculum_id=$1 GROUP BY kategori`, curriculumID)
	if err != nil {
		return nil, fmt.Errorf("OBERepository.CountsFor cpl: %w", err)
	}
	for cplRows.Next() {
		var kat string
		var cnt int
		if err := cplRows.Scan(&kat, &cnt); err != nil {
			cplRows.Close()
			return nil, fmt.Errorf("OBERepository.CountsFor cpl scan: %w", err)
		}
		c.CPLByKategori[kat] = cnt
		c.CPLCount += cnt
	}
	cplRows.Close()
	if err := cplRows.Err(); err != nil {
		return nil, fmt.Errorf("OBERepository.CountsFor cpl rows: %w", err)
	}

	// CPMK count, RPS count, and CPMK linked to ≥1 CPL — all scoped to the curriculum.
	if err := r.pool.QueryRow(ctx, `
		SELECT COUNT(*) FROM obe_cpmk m JOIN obe_courses c ON c.id=m.course_id WHERE c.curriculum_id=$1
	`, curriculumID).Scan(&c.CPMKCount); err != nil {
		return nil, fmt.Errorf("OBERepository.CountsFor cpmk: %w", err)
	}
	if err := r.pool.QueryRow(ctx, `
		SELECT COUNT(*) FROM obe_rps r JOIN obe_courses c ON c.id=r.course_id WHERE c.curriculum_id=$1
	`, curriculumID).Scan(&c.RPSCount); err != nil {
		return nil, fmt.Errorf("OBERepository.CountsFor rps: %w", err)
	}
	if err := r.pool.QueryRow(ctx, `
		SELECT COUNT(DISTINCT mm.cpmk_id) FROM obe_cpl_cpmk mm JOIN obe_cpl l ON l.id=mm.cpl_id WHERE l.curriculum_id=$1
	`, curriculumID).Scan(&c.MappedCPMK); err != nil {
		return nil, fmt.Errorf("OBERepository.CountsFor mapped: %w", err)
	}

	return c, nil
}
