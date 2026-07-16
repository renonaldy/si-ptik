package postgres

import (
	"context"
	"errors"
	"fmt"

	"ptik/internal/domain/obe"

	"github.com/jackc/pgx/v5"
	"github.com/jackc/pgx/v5/pgxpool"
)

// OBEAssessmentRepository implements obe.AssessmentRepository (assessment &
// achievement half of the OBE module).
type OBEAssessmentRepository struct{ pool *pgxpool.Pool }

func NewOBEAssessmentRepository(pool *pgxpool.Pool) *OBEAssessmentRepository {
	return &OBEAssessmentRepository{pool: pool}
}

// ─────────────────────────────── Indicators (IK) ────────────────────────────

const indicatorCols = `id, cpl_id, kode, deskripsi, created_at, updated_at`

func scanIndicator(row pgx.Row, x *obe.Indicator) error {
	return row.Scan(&x.ID, &x.CPLID, &x.Kode, &x.Deskripsi, &x.CreatedAt, &x.UpdatedAt)
}

func (r *OBEAssessmentRepository) ListIndicators(ctx context.Context, curriculumID, cplID string) ([]obe.Indicator, error) {
	rows, err := r.pool.Query(ctx, `
		SELECT i.id, i.cpl_id, i.kode, i.deskripsi, i.created_at, i.updated_at
		FROM obe_indicators i
		JOIN obe_cpl c ON c.id = i.cpl_id
		WHERE ($1 = '' OR c.curriculum_id = $1) AND ($2 = '' OR i.cpl_id = $2)
		ORDER BY i.kode, i.created_at
	`, curriculumID, cplID)
	if err != nil {
		return nil, fmt.Errorf("OBEAssessmentRepository.ListIndicators: %w", err)
	}
	defer rows.Close()

	list := []obe.Indicator{}
	for rows.Next() {
		var x obe.Indicator
		if err := scanIndicator(rows, &x); err != nil {
			return nil, fmt.Errorf("OBEAssessmentRepository.ListIndicators scan: %w", err)
		}
		list = append(list, x)
	}
	return list, rows.Err()
}

func (r *OBEAssessmentRepository) GetIndicator(ctx context.Context, id string) (*obe.Indicator, error) {
	var x obe.Indicator
	err := scanIndicator(r.pool.QueryRow(ctx, `SELECT `+indicatorCols+` FROM obe_indicators WHERE id=$1`, id), &x)
	if err != nil {
		if errors.Is(err, pgx.ErrNoRows) {
			return nil, nil
		}
		return nil, fmt.Errorf("OBEAssessmentRepository.GetIndicator: %w", err)
	}
	return &x, nil
}

func (r *OBEAssessmentRepository) CreateIndicator(ctx context.Context, id string, in obe.IndicatorInput) (*obe.Indicator, error) {
	var x obe.Indicator
	err := scanIndicator(r.pool.QueryRow(ctx, `
		INSERT INTO obe_indicators (id, cpl_id, kode, deskripsi)
		VALUES ($1,$2,$3,$4)
		RETURNING `+indicatorCols,
		id, in.CPLID, in.Kode, in.Deskripsi,
	), &x)
	if err != nil {
		return nil, fmt.Errorf("OBEAssessmentRepository.CreateIndicator: %w", err)
	}
	return &x, nil
}

func (r *OBEAssessmentRepository) UpdateIndicator(ctx context.Context, id string, in obe.IndicatorInput) (*obe.Indicator, error) {
	var x obe.Indicator
	err := scanIndicator(r.pool.QueryRow(ctx, `
		UPDATE obe_indicators SET cpl_id=$2, kode=$3, deskripsi=$4
		WHERE id=$1
		RETURNING `+indicatorCols,
		id, in.CPLID, in.Kode, in.Deskripsi,
	), &x)
	if err != nil {
		return nil, fmt.Errorf("OBEAssessmentRepository.UpdateIndicator: %w", err)
	}
	return &x, nil
}

func (r *OBEAssessmentRepository) DeleteIndicator(ctx context.Context, id string) error {
	if _, err := r.pool.Exec(ctx, `DELETE FROM obe_indicators WHERE id=$1`, id); err != nil {
		return fmt.Errorf("OBEAssessmentRepository.DeleteIndicator: %w", err)
	}
	return nil
}

// ─────────────────────────────── IK ↔ CPMK links ────────────────────────────

func (r *OBEAssessmentRepository) ListIKLinksByCurriculum(ctx context.Context, curriculumID string) ([]obe.IKLink, error) {
	rows, err := r.pool.Query(ctx, `
		SELECT l.ik_id, l.cpmk_id
		FROM obe_ik_cpmk l
		JOIN obe_indicators i ON i.id = l.ik_id
		JOIN obe_cpl c ON c.id = i.cpl_id
		WHERE c.curriculum_id = $1
	`, curriculumID)
	if err != nil {
		return nil, fmt.Errorf("OBEAssessmentRepository.ListIKLinksByCurriculum: %w", err)
	}
	defer rows.Close()

	list := []obe.IKLink{}
	for rows.Next() {
		var l obe.IKLink
		if err := rows.Scan(&l.IKID, &l.CPMKID); err != nil {
			return nil, fmt.Errorf("OBEAssessmentRepository.ListIKLinksByCurriculum scan: %w", err)
		}
		list = append(list, l)
	}
	return list, rows.Err()
}

func (r *OBEAssessmentRepository) AddIKLink(ctx context.Context, ikID, cpmkID string) error {
	if _, err := r.pool.Exec(ctx, `
		INSERT INTO obe_ik_cpmk (ik_id, cpmk_id) VALUES ($1,$2) ON CONFLICT DO NOTHING
	`, ikID, cpmkID); err != nil {
		return fmt.Errorf("OBEAssessmentRepository.AddIKLink: %w", err)
	}
	return nil
}

func (r *OBEAssessmentRepository) RemoveIKLink(ctx context.Context, ikID, cpmkID string) error {
	if _, err := r.pool.Exec(ctx, `DELETE FROM obe_ik_cpmk WHERE ik_id=$1 AND cpmk_id=$2`, ikID, cpmkID); err != nil {
		return fmt.Errorf("OBEAssessmentRepository.RemoveIKLink: %w", err)
	}
	return nil
}

// ────────────────────────────────── Classes ─────────────────────────────────

// classSelect joins dosens for the denormalized dosen_nama.
const classSelect = `
	SELECT c.id, c.course_id, c.nama, c.tahun_akademik, c.periode, c.dosen_id,
	       COALESCE(d.nama_dosen, ''), c.created_at, c.updated_at
	FROM obe_classes c
	LEFT JOIN dosens d ON d.id = c.dosen_id`

func scanClass(row pgx.Row, x *obe.Class) error {
	return row.Scan(&x.ID, &x.CourseID, &x.Nama, &x.TahunAkademik, &x.Periode, &x.DosenID, &x.DosenNama, &x.CreatedAt, &x.UpdatedAt)
}

func (r *OBEAssessmentRepository) ListClasses(ctx context.Context, courseID, curriculumID string) ([]obe.Class, error) {
	rows, err := r.pool.Query(ctx, classSelect+`
		JOIN obe_courses co ON co.id = c.course_id
		WHERE ($1 = '' OR c.course_id = $1) AND ($2 = '' OR co.curriculum_id = $2)
		ORDER BY c.tahun_akademik DESC, c.nama, c.created_at
	`, courseID, curriculumID)
	if err != nil {
		return nil, fmt.Errorf("OBEAssessmentRepository.ListClasses: %w", err)
	}
	defer rows.Close()

	list := []obe.Class{}
	for rows.Next() {
		var x obe.Class
		if err := scanClass(rows, &x); err != nil {
			return nil, fmt.Errorf("OBEAssessmentRepository.ListClasses scan: %w", err)
		}
		list = append(list, x)
	}
	return list, rows.Err()
}

func (r *OBEAssessmentRepository) GetClass(ctx context.Context, id string) (*obe.Class, error) {
	var x obe.Class
	err := scanClass(r.pool.QueryRow(ctx, classSelect+` WHERE c.id = $1`, id), &x)
	if err != nil {
		if errors.Is(err, pgx.ErrNoRows) {
			return nil, nil
		}
		return nil, fmt.Errorf("OBEAssessmentRepository.GetClass: %w", err)
	}
	return &x, nil
}

func (r *OBEAssessmentRepository) CreateClass(ctx context.Context, id string, in obe.ClassInput) (*obe.Class, error) {
	if _, err := r.pool.Exec(ctx, `
		INSERT INTO obe_classes (id, course_id, nama, tahun_akademik, periode, dosen_id)
		VALUES ($1,$2,$3,$4,$5,$6)
	`, id, in.CourseID, in.Nama, in.TahunAkademik, in.Periode, in.DosenID); err != nil {
		return nil, fmt.Errorf("OBEAssessmentRepository.CreateClass: %w", err)
	}
	return r.GetClass(ctx, id) // re-select to include dosen_nama
}

func (r *OBEAssessmentRepository) UpdateClass(ctx context.Context, id string, in obe.ClassInput) (*obe.Class, error) {
	if _, err := r.pool.Exec(ctx, `
		UPDATE obe_classes SET course_id=$2, nama=$3, tahun_akademik=$4, periode=$5, dosen_id=$6
		WHERE id=$1
	`, id, in.CourseID, in.Nama, in.TahunAkademik, in.Periode, in.DosenID); err != nil {
		return nil, fmt.Errorf("OBEAssessmentRepository.UpdateClass: %w", err)
	}
	return r.GetClass(ctx, id)
}

func (r *OBEAssessmentRepository) DeleteClass(ctx context.Context, id string) error {
	if _, err := r.pool.Exec(ctx, `DELETE FROM obe_classes WHERE id=$1`, id); err != nil {
		return fmt.Errorf("OBEAssessmentRepository.DeleteClass: %w", err)
	}
	return nil
}

// ─────────────────────────────── Class roster ───────────────────────────────

const studentCols = `id, class_id, npm, nama, created_at, updated_at`

func scanStudent(row pgx.Row, x *obe.ClassStudent) error {
	return row.Scan(&x.ID, &x.ClassID, &x.NPM, &x.Nama, &x.CreatedAt, &x.UpdatedAt)
}

func (r *OBEAssessmentRepository) ListStudents(ctx context.Context, classID string) ([]obe.ClassStudent, error) {
	rows, err := r.pool.Query(ctx, `
		SELECT `+studentCols+` FROM obe_class_students
		WHERE class_id = $1
		ORDER BY nama, created_at
	`, classID)
	if err != nil {
		return nil, fmt.Errorf("OBEAssessmentRepository.ListStudents: %w", err)
	}
	defer rows.Close()

	list := []obe.ClassStudent{}
	for rows.Next() {
		var x obe.ClassStudent
		if err := scanStudent(rows, &x); err != nil {
			return nil, fmt.Errorf("OBEAssessmentRepository.ListStudents scan: %w", err)
		}
		list = append(list, x)
	}
	return list, rows.Err()
}

func (r *OBEAssessmentRepository) GetStudent(ctx context.Context, id string) (*obe.ClassStudent, error) {
	var x obe.ClassStudent
	err := scanStudent(r.pool.QueryRow(ctx, `SELECT `+studentCols+` FROM obe_class_students WHERE id=$1`, id), &x)
	if err != nil {
		if errors.Is(err, pgx.ErrNoRows) {
			return nil, nil
		}
		return nil, fmt.Errorf("OBEAssessmentRepository.GetStudent: %w", err)
	}
	return &x, nil
}

func (r *OBEAssessmentRepository) CreateStudent(ctx context.Context, id string, in obe.ClassStudentInput) (*obe.ClassStudent, error) {
	var x obe.ClassStudent
	err := scanStudent(r.pool.QueryRow(ctx, `
		INSERT INTO obe_class_students (id, class_id, npm, nama)
		VALUES ($1,$2,$3,$4)
		RETURNING `+studentCols,
		id, in.ClassID, in.NPM, in.Nama,
	), &x)
	if err != nil {
		return nil, fmt.Errorf("OBEAssessmentRepository.CreateStudent: %w", err)
	}
	return &x, nil
}

// CreateStudents bulk-inserts a pasted roster inside one transaction. Rows whose
// NPM already exists in the class are skipped via the partial unique index.
func (r *OBEAssessmentRepository) CreateStudents(ctx context.Context, classID string, ids []string, rows []obe.BulkStudentRow) (int, error) {
	tx, err := r.pool.Begin(ctx)
	if err != nil {
		return 0, fmt.Errorf("OBEAssessmentRepository.CreateStudents begin: %w", err)
	}
	defer tx.Rollback(ctx) //nolint:errcheck

	inserted := 0
	for i, row := range rows {
		tag, err := tx.Exec(ctx, `
			INSERT INTO obe_class_students (id, class_id, npm, nama)
			VALUES ($1,$2,$3,$4)
			ON CONFLICT (class_id, npm) WHERE npm <> '' DO NOTHING
		`, ids[i], classID, row.NPM, row.Nama)
		if err != nil {
			return 0, fmt.Errorf("OBEAssessmentRepository.CreateStudents insert: %w", err)
		}
		inserted += int(tag.RowsAffected())
	}
	if err := tx.Commit(ctx); err != nil {
		return 0, fmt.Errorf("OBEAssessmentRepository.CreateStudents commit: %w", err)
	}
	return inserted, nil
}

func (r *OBEAssessmentRepository) UpdateStudent(ctx context.Context, id string, in obe.ClassStudentInput) (*obe.ClassStudent, error) {
	var x obe.ClassStudent
	err := scanStudent(r.pool.QueryRow(ctx, `
		UPDATE obe_class_students SET npm=$2, nama=$3
		WHERE id=$1
		RETURNING `+studentCols,
		id, in.NPM, in.Nama,
	), &x)
	if err != nil {
		return nil, fmt.Errorf("OBEAssessmentRepository.UpdateStudent: %w", err)
	}
	return &x, nil
}

func (r *OBEAssessmentRepository) DeleteStudent(ctx context.Context, id string) error {
	if _, err := r.pool.Exec(ctx, `DELETE FROM obe_class_students WHERE id=$1`, id); err != nil {
		return fmt.Errorf("OBEAssessmentRepository.DeleteStudent: %w", err)
	}
	return nil
}

// ──────────────────────────────── Assessments ───────────────────────────────

const assessmentCols = `id, course_id, nama, jenis, bobot, semester, tahun_akademik, created_at, updated_at`

func scanAssessment(row pgx.Row, x *obe.Assessment) error {
	return row.Scan(&x.ID, &x.CourseID, &x.Nama, &x.Jenis, &x.Bobot, &x.Semester, &x.TahunAkademik, &x.CreatedAt, &x.UpdatedAt)
}

func (r *OBEAssessmentRepository) ListAssessments(ctx context.Context, courseID string) ([]obe.Assessment, error) {
	rows, err := r.pool.Query(ctx, `
		SELECT `+assessmentCols+` FROM obe_assessments
		WHERE course_id = $1
		ORDER BY tahun_akademik DESC, created_at
	`, courseID)
	if err != nil {
		return nil, fmt.Errorf("OBEAssessmentRepository.ListAssessments: %w", err)
	}
	defer rows.Close()

	list := []obe.Assessment{}
	for rows.Next() {
		var x obe.Assessment
		if err := scanAssessment(rows, &x); err != nil {
			return nil, fmt.Errorf("OBEAssessmentRepository.ListAssessments scan: %w", err)
		}
		list = append(list, x)
	}
	return list, rows.Err()
}

func (r *OBEAssessmentRepository) GetAssessment(ctx context.Context, id string) (*obe.Assessment, error) {
	var x obe.Assessment
	err := scanAssessment(r.pool.QueryRow(ctx, `SELECT `+assessmentCols+` FROM obe_assessments WHERE id=$1`, id), &x)
	if err != nil {
		if errors.Is(err, pgx.ErrNoRows) {
			return nil, nil
		}
		return nil, fmt.Errorf("OBEAssessmentRepository.GetAssessment: %w", err)
	}
	return &x, nil
}

func (r *OBEAssessmentRepository) CreateAssessment(ctx context.Context, id string, in obe.AssessmentInput) (*obe.Assessment, error) {
	var x obe.Assessment
	err := scanAssessment(r.pool.QueryRow(ctx, `
		INSERT INTO obe_assessments (id, course_id, nama, jenis, bobot, semester, tahun_akademik)
		VALUES ($1,$2,$3,$4,$5,$6,$7)
		RETURNING `+assessmentCols,
		id, in.CourseID, in.Nama, in.Jenis, in.Bobot, in.Semester, in.TahunAkademik,
	), &x)
	if err != nil {
		return nil, fmt.Errorf("OBEAssessmentRepository.CreateAssessment: %w", err)
	}
	return &x, nil
}

func (r *OBEAssessmentRepository) UpdateAssessment(ctx context.Context, id string, in obe.AssessmentInput) (*obe.Assessment, error) {
	var x obe.Assessment
	err := scanAssessment(r.pool.QueryRow(ctx, `
		UPDATE obe_assessments SET nama=$2, jenis=$3, bobot=$4, semester=$5, tahun_akademik=$6
		WHERE id=$1
		RETURNING `+assessmentCols,
		id, in.Nama, in.Jenis, in.Bobot, in.Semester, in.TahunAkademik,
	), &x)
	if err != nil {
		return nil, fmt.Errorf("OBEAssessmentRepository.UpdateAssessment: %w", err)
	}
	return &x, nil
}

func (r *OBEAssessmentRepository) DeleteAssessment(ctx context.Context, id string) error {
	if _, err := r.pool.Exec(ctx, `DELETE FROM obe_assessments WHERE id=$1`, id); err != nil {
		return fmt.Errorf("OBEAssessmentRepository.DeleteAssessment: %w", err)
	}
	return nil
}

func (r *OBEAssessmentRepository) SumBobot(ctx context.Context, courseID, tahunAkademik, excludeID string) (int, error) {
	var sum int
	err := r.pool.QueryRow(ctx, `
		SELECT COALESCE(SUM(bobot), 0) FROM obe_assessments
		WHERE course_id = $1 AND tahun_akademik = $2 AND id <> $3
	`, courseID, tahunAkademik, excludeID).Scan(&sum)
	if err != nil {
		return 0, fmt.Errorf("OBEAssessmentRepository.SumBobot: %w", err)
	}
	return sum, nil
}

// ─────────────────────────── Assessment ↔ CPMK links ────────────────────────

func (r *OBEAssessmentRepository) ListAssessmentLinksByCourse(ctx context.Context, courseID string) ([]obe.AssessmentLink, error) {
	rows, err := r.pool.Query(ctx, `
		SELECT l.assessment_id, l.cpmk_id
		FROM obe_assessment_cpmk l
		JOIN obe_assessments a ON a.id = l.assessment_id
		WHERE a.course_id = $1
	`, courseID)
	if err != nil {
		return nil, fmt.Errorf("OBEAssessmentRepository.ListAssessmentLinksByCourse: %w", err)
	}
	defer rows.Close()

	list := []obe.AssessmentLink{}
	for rows.Next() {
		var l obe.AssessmentLink
		if err := rows.Scan(&l.AssessmentID, &l.CPMKID); err != nil {
			return nil, fmt.Errorf("OBEAssessmentRepository.ListAssessmentLinksByCourse scan: %w", err)
		}
		list = append(list, l)
	}
	return list, rows.Err()
}

func (r *OBEAssessmentRepository) AddAssessmentLink(ctx context.Context, assessmentID, cpmkID string) error {
	if _, err := r.pool.Exec(ctx, `
		INSERT INTO obe_assessment_cpmk (assessment_id, cpmk_id) VALUES ($1,$2) ON CONFLICT DO NOTHING
	`, assessmentID, cpmkID); err != nil {
		return fmt.Errorf("OBEAssessmentRepository.AddAssessmentLink: %w", err)
	}
	return nil
}

func (r *OBEAssessmentRepository) RemoveAssessmentLink(ctx context.Context, assessmentID, cpmkID string) error {
	if _, err := r.pool.Exec(ctx, `DELETE FROM obe_assessment_cpmk WHERE assessment_id=$1 AND cpmk_id=$2`, assessmentID, cpmkID); err != nil {
		return fmt.Errorf("OBEAssessmentRepository.RemoveAssessmentLink: %w", err)
	}
	return nil
}

// ────────────────────────────────── Scores ──────────────────────────────────

func (r *OBEAssessmentRepository) ListScoresByClass(ctx context.Context, classID string) ([]obe.ScoreCell, error) {
	rows, err := r.pool.Query(ctx, `
		SELECT s.student_id, s.assessment_id, s.score
		FROM obe_student_scores s
		JOIN obe_class_students st ON st.id = s.student_id
		WHERE st.class_id = $1
	`, classID)
	if err != nil {
		return nil, fmt.Errorf("OBEAssessmentRepository.ListScoresByClass: %w", err)
	}
	defer rows.Close()

	list := []obe.ScoreCell{}
	for rows.Next() {
		var c obe.ScoreCell
		if err := rows.Scan(&c.StudentID, &c.AssessmentID, &c.Score); err != nil {
			return nil, fmt.Errorf("OBEAssessmentRepository.ListScoresByClass scan: %w", err)
		}
		list = append(list, c)
	}
	return list, rows.Err()
}

// UpsertScores writes the grid cells in one transaction, keyed on
// (student_id, assessment_id); pre-minted ids are only used on fresh inserts.
func (r *OBEAssessmentRepository) UpsertScores(ctx context.Context, ids []string, cells []obe.ScoreCell) error {
	tx, err := r.pool.Begin(ctx)
	if err != nil {
		return fmt.Errorf("OBEAssessmentRepository.UpsertScores begin: %w", err)
	}
	defer tx.Rollback(ctx) //nolint:errcheck

	for i, c := range cells {
		if _, err := tx.Exec(ctx, `
			INSERT INTO obe_student_scores (id, student_id, assessment_id, score)
			VALUES ($1,$2,$3,$4)
			ON CONFLICT (student_id, assessment_id) DO UPDATE SET score = EXCLUDED.score
		`, ids[i], c.StudentID, c.AssessmentID, c.Score); err != nil {
			return fmt.Errorf("OBEAssessmentRepository.UpsertScores insert: %w", err)
		}
	}
	if err := tx.Commit(ctx); err != nil {
		return fmt.Errorf("OBEAssessmentRepository.UpsertScores commit: %w", err)
	}
	return nil
}

// ────────────────────────────────── Results ─────────────────────────────────

// ReplaceResults wipes and rewrites every stored result for the given students
// in one transaction, so readers never observe a half-updated state.
func (r *OBEAssessmentRepository) ReplaceResults(ctx context.Context, classID string, studentIDs []string, cpmk, cpl, ik []obe.StoredResult) error {
	if len(studentIDs) == 0 {
		return nil
	}
	tx, err := r.pool.Begin(ctx)
	if err != nil {
		return fmt.Errorf("OBEAssessmentRepository.ReplaceResults begin: %w", err)
	}
	defer tx.Rollback(ctx) //nolint:errcheck

	// Serialize recomputes per class: results are recomputed on every read, so
	// two parallel reads would otherwise deadlock on the shared delete+insert
	// (observed 40P01). The xact lock releases automatically on commit/rollback.
	if _, err := tx.Exec(ctx, `SELECT pg_advisory_xact_lock(hashtextextended($1, 42))`, classID); err != nil {
		return fmt.Errorf("OBEAssessmentRepository.ReplaceResults lock: %w", err)
	}

	for _, table := range []string{"obe_cpmk_results", "obe_cpl_results", "obe_ik_results"} {
		if _, err := tx.Exec(ctx, `DELETE FROM `+table+` WHERE student_id = ANY($1)`, studentIDs); err != nil {
			return fmt.Errorf("OBEAssessmentRepository.ReplaceResults delete %s: %w", table, err)
		}
	}

	// ON CONFLICT DO UPDATE: two concurrent recomputes (e.g. parallel results
	// reads) may interleave delete+insert; both compute identical values from the
	// same scores, so converging via upsert is safe and avoids duplicate-key 500s.
	insert := func(table, refCol string, rows []obe.StoredResult) error {
		for _, x := range rows {
			if _, err := tx.Exec(ctx, `
				INSERT INTO `+table+` (id, student_id, `+refCol+`, nilai, status)
				VALUES ($1,$2,$3,$4,$5)
				ON CONFLICT (student_id, `+refCol+`) DO UPDATE
				SET nilai = EXCLUDED.nilai, status = EXCLUDED.status, updated_at = NOW()
			`, x.ID, x.StudentID, x.RefID, x.Nilai, x.Status); err != nil {
				return fmt.Errorf("OBEAssessmentRepository.ReplaceResults insert %s: %w", table, err)
			}
		}
		return nil
	}
	if err := insert("obe_cpmk_results", "cpmk_id", cpmk); err != nil {
		return err
	}
	if err := insert("obe_cpl_results", "cpl_id", cpl); err != nil {
		return err
	}
	if err := insert("obe_ik_results", "ik_id", ik); err != nil {
		return err
	}

	if err := tx.Commit(ctx); err != nil {
		return fmt.Errorf("OBEAssessmentRepository.ReplaceResults commit: %w", err)
	}
	return nil
}
