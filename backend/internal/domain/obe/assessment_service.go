package obe

import (
	"context"
	"fmt"
	"strings"

	"ptik/pkg/apperror"

	"github.com/google/uuid"
)

// AssessmentService owns the assessment & achievement half of the OBE module.
// It also reads through the core Repository for curriculum/course/CPMK/CPL data
// (validation + the achievement engine in achievement_service.go).
type AssessmentService struct {
	repo AssessmentRepository
	core Repository
}

func NewAssessmentService(repo AssessmentRepository, core Repository) *AssessmentService {
	return &AssessmentService{repo: repo, core: core}
}

// ─────────────────────────────── Indicators (IK) ────────────────────────────

func (s *AssessmentService) ListIndicators(ctx context.Context, curriculumID, cplID string) ([]Indicator, error) {
	return s.repo.ListIndicators(ctx, strings.TrimSpace(curriculumID), strings.TrimSpace(cplID))
}

func (s *AssessmentService) GetIndicator(ctx context.Context, id string) (*Indicator, error) {
	x, err := s.repo.GetIndicator(ctx, id)
	if err != nil {
		return nil, fmt.Errorf("obe.AssessmentService.GetIndicator: %w", err)
	}
	if x == nil {
		return nil, apperror.New(apperror.CodeNotFound, "indikator kinerja tidak ditemukan")
	}
	return x, nil
}

func (s *AssessmentService) CreateIndicator(ctx context.Context, in IndicatorInput) (*Indicator, error) {
	in = normalizeIndicator(in)
	if err := s.validateIndicator(ctx, in); err != nil {
		return nil, err
	}
	x, err := s.repo.CreateIndicator(ctx, "obeik-"+uuid.NewString(), in)
	if err != nil {
		return nil, fmt.Errorf("obe.AssessmentService.CreateIndicator: %w", err)
	}
	return x, nil
}

func (s *AssessmentService) UpdateIndicator(ctx context.Context, id string, in IndicatorInput) (*Indicator, error) {
	in = normalizeIndicator(in)
	if err := s.validateIndicator(ctx, in); err != nil {
		return nil, err
	}
	if _, err := s.GetIndicator(ctx, id); err != nil {
		return nil, err
	}
	x, err := s.repo.UpdateIndicator(ctx, id, in)
	if err != nil {
		return nil, fmt.Errorf("obe.AssessmentService.UpdateIndicator: %w", err)
	}
	return x, nil
}

func (s *AssessmentService) DeleteIndicator(ctx context.Context, id string) error {
	if err := s.repo.DeleteIndicator(ctx, id); err != nil {
		return fmt.Errorf("obe.AssessmentService.DeleteIndicator: %w", err)
	}
	return nil
}

func (s *AssessmentService) validateIndicator(ctx context.Context, in IndicatorInput) error {
	if in.Deskripsi == "" {
		return apperror.New(apperror.CodeValidation, "deskripsi IK wajib diisi")
	}
	cpl, err := s.core.GetCPL(ctx, in.CPLID)
	if err != nil {
		return fmt.Errorf("obe.AssessmentService.validateIndicator: %w", err)
	}
	if cpl == nil {
		return apperror.New(apperror.CodeValidation, "CPL induk tidak ditemukan")
	}
	return nil
}

func normalizeIndicator(in IndicatorInput) IndicatorInput {
	in.CPLID = strings.TrimSpace(in.CPLID)
	in.Kode = strings.TrimSpace(in.Kode)
	in.Deskripsi = strings.TrimSpace(in.Deskripsi)
	return in
}

// ─────────────────────────────── IK ↔ CPMK mapping ──────────────────────────

func (s *AssessmentService) IKMapping(ctx context.Context, curriculumID string) (*IKMappingMatrix, error) {
	curriculumID = strings.TrimSpace(curriculumID)
	if curriculumID == "" {
		return nil, apperror.New(apperror.CodeValidation, "curriculum_id wajib diisi")
	}
	iks, err := s.repo.ListIndicators(ctx, curriculumID, "")
	if err != nil {
		return nil, fmt.Errorf("obe.AssessmentService.IKMapping indicators: %w", err)
	}
	cpls, err := s.core.ListCPL(ctx, curriculumID)
	if err != nil {
		return nil, fmt.Errorf("obe.AssessmentService.IKMapping cpls: %w", err)
	}
	cpmks, err := s.core.ListCPMKByCurriculum(ctx, curriculumID)
	if err != nil {
		return nil, fmt.Errorf("obe.AssessmentService.IKMapping cpmks: %w", err)
	}
	links, err := s.repo.ListIKLinksByCurriculum(ctx, curriculumID)
	if err != nil {
		return nil, fmt.Errorf("obe.AssessmentService.IKMapping links: %w", err)
	}
	return &IKMappingMatrix{IKs: iks, CPLs: cpls, CPMKs: cpmks, Links: links}, nil
}

func (s *AssessmentService) SetIKMapping(ctx context.Context, in IKMappingSetInput) error {
	if _, err := s.GetIndicator(ctx, strings.TrimSpace(in.IKID)); err != nil {
		return err
	}
	cpmk, err := s.core.GetCPMK(ctx, strings.TrimSpace(in.CPMKID))
	if err != nil {
		return fmt.Errorf("obe.AssessmentService.SetIKMapping: %w", err)
	}
	if cpmk == nil {
		return apperror.New(apperror.CodeNotFound, "CPMK tidak ditemukan")
	}
	if in.Linked {
		err = s.repo.AddIKLink(ctx, in.IKID, in.CPMKID)
	} else {
		err = s.repo.RemoveIKLink(ctx, in.IKID, in.CPMKID)
	}
	if err != nil {
		return fmt.Errorf("obe.AssessmentService.SetIKMapping: %w", err)
	}
	return nil
}

// ────────────────────────────────── Classes ─────────────────────────────────

func (s *AssessmentService) ListClasses(ctx context.Context, courseID, curriculumID string) ([]Class, error) {
	return s.repo.ListClasses(ctx, strings.TrimSpace(courseID), strings.TrimSpace(curriculumID))
}

func (s *AssessmentService) GetClass(ctx context.Context, id string) (*Class, error) {
	x, err := s.repo.GetClass(ctx, id)
	if err != nil {
		return nil, fmt.Errorf("obe.AssessmentService.GetClass: %w", err)
	}
	if x == nil {
		return nil, apperror.New(apperror.CodeNotFound, "kelas tidak ditemukan")
	}
	return x, nil
}

func (s *AssessmentService) CreateClass(ctx context.Context, in ClassInput) (*Class, error) {
	in, err := s.normalizeValidateClass(ctx, in)
	if err != nil {
		return nil, err
	}
	x, err := s.repo.CreateClass(ctx, "obecls-"+uuid.NewString(), in)
	if err != nil {
		return nil, fmt.Errorf("obe.AssessmentService.CreateClass: %w", err)
	}
	return x, nil
}

func (s *AssessmentService) UpdateClass(ctx context.Context, id string, in ClassInput) (*Class, error) {
	if _, err := s.GetClass(ctx, id); err != nil {
		return nil, err
	}
	in, err := s.normalizeValidateClass(ctx, in)
	if err != nil {
		return nil, err
	}
	x, err := s.repo.UpdateClass(ctx, id, in)
	if err != nil {
		return nil, fmt.Errorf("obe.AssessmentService.UpdateClass: %w", err)
	}
	return x, nil
}

func (s *AssessmentService) DeleteClass(ctx context.Context, id string) error {
	if err := s.repo.DeleteClass(ctx, id); err != nil {
		return fmt.Errorf("obe.AssessmentService.DeleteClass: %w", err)
	}
	return nil
}

func (s *AssessmentService) normalizeValidateClass(ctx context.Context, in ClassInput) (ClassInput, error) {
	in.CourseID = strings.TrimSpace(in.CourseID)
	in.Nama = strings.TrimSpace(in.Nama)
	in.TahunAkademik = strings.TrimSpace(in.TahunAkademik)
	in.Periode = strings.ToLower(strings.TrimSpace(in.Periode))
	if in.Periode != "genap" {
		in.Periode = "ganjil"
	}
	if in.DosenID != nil && strings.TrimSpace(*in.DosenID) == "" {
		in.DosenID = nil
	}
	if in.Nama == "" {
		return in, apperror.New(apperror.CodeValidation, "nama kelas wajib diisi")
	}
	course, err := s.core.GetCourse(ctx, in.CourseID)
	if err != nil {
		return in, fmt.Errorf("obe.AssessmentService.normalizeValidateClass: %w", err)
	}
	if course == nil {
		return in, apperror.New(apperror.CodeValidation, "mata kuliah tidak ditemukan")
	}
	return in, nil
}

// ─────────────────────────────── Class roster ───────────────────────────────

func (s *AssessmentService) ListStudents(ctx context.Context, classID string) ([]ClassStudent, error) {
	return s.repo.ListStudents(ctx, strings.TrimSpace(classID))
}

func (s *AssessmentService) CreateStudent(ctx context.Context, in ClassStudentInput) (*ClassStudent, error) {
	in.ClassID = strings.TrimSpace(in.ClassID)
	in.NPM = strings.TrimSpace(in.NPM)
	in.Nama = strings.TrimSpace(in.Nama)
	if in.Nama == "" {
		return nil, apperror.New(apperror.CodeValidation, "nama mahasiswa wajib diisi")
	}
	if _, err := s.GetClass(ctx, in.ClassID); err != nil {
		return nil, err
	}
	if in.NPM != "" {
		existing, err := s.repo.ListStudents(ctx, in.ClassID)
		if err != nil {
			return nil, fmt.Errorf("obe.AssessmentService.CreateStudent: %w", err)
		}
		for _, st := range existing {
			if st.NPM == in.NPM {
				return nil, apperror.New(apperror.CodeValidation, "NPM sudah terdaftar di kelas ini")
			}
		}
	}
	x, err := s.repo.CreateStudent(ctx, "obestu-"+uuid.NewString(), in)
	if err != nil {
		return nil, fmt.Errorf("obe.AssessmentService.CreateStudent: %w", err)
	}
	return x, nil
}

// CreateStudentsBulk adds a pasted roster; rows without a nama are dropped and
// duplicate NPMs (in-batch or already enrolled) are skipped. Returns #inserted.
func (s *AssessmentService) CreateStudentsBulk(ctx context.Context, in StudentsBulkInput) (int, error) {
	in.ClassID = strings.TrimSpace(in.ClassID)
	if _, err := s.GetClass(ctx, in.ClassID); err != nil {
		return 0, err
	}
	if len(in.Students) > 500 {
		return 0, apperror.New(apperror.CodeValidation, "maksimal 500 mahasiswa per unggahan")
	}
	seen := map[string]bool{}
	rows := make([]BulkStudentRow, 0, len(in.Students))
	for _, r := range in.Students {
		r.NPM = strings.TrimSpace(r.NPM)
		r.Nama = strings.TrimSpace(r.Nama)
		if r.Nama == "" {
			continue
		}
		if r.NPM != "" {
			if seen[r.NPM] {
				continue
			}
			seen[r.NPM] = true
		}
		rows = append(rows, r)
	}
	if len(rows) == 0 {
		return 0, apperror.New(apperror.CodeValidation, "tidak ada baris mahasiswa yang valid")
	}
	ids := make([]string, len(rows))
	for i := range rows {
		ids[i] = "obestu-" + uuid.NewString()
	}
	n, err := s.repo.CreateStudents(ctx, in.ClassID, ids, rows)
	if err != nil {
		return 0, fmt.Errorf("obe.AssessmentService.CreateStudentsBulk: %w", err)
	}
	return n, nil
}

func (s *AssessmentService) UpdateStudent(ctx context.Context, id string, in ClassStudentInput) (*ClassStudent, error) {
	in.NPM = strings.TrimSpace(in.NPM)
	in.Nama = strings.TrimSpace(in.Nama)
	if in.Nama == "" {
		return nil, apperror.New(apperror.CodeValidation, "nama mahasiswa wajib diisi")
	}
	existing, err := s.repo.GetStudent(ctx, id)
	if err != nil {
		return nil, fmt.Errorf("obe.AssessmentService.UpdateStudent: %w", err)
	}
	if existing == nil {
		return nil, apperror.New(apperror.CodeNotFound, "mahasiswa tidak ditemukan")
	}
	if in.NPM != "" && in.NPM != existing.NPM {
		classmates, err := s.repo.ListStudents(ctx, existing.ClassID)
		if err != nil {
			return nil, fmt.Errorf("obe.AssessmentService.UpdateStudent: %w", err)
		}
		for _, st := range classmates {
			if st.ID != id && st.NPM == in.NPM {
				return nil, apperror.New(apperror.CodeValidation, "NPM sudah terdaftar di kelas ini")
			}
		}
	}
	x, err := s.repo.UpdateStudent(ctx, id, in)
	if err != nil {
		return nil, fmt.Errorf("obe.AssessmentService.UpdateStudent: %w", err)
	}
	return x, nil
}

func (s *AssessmentService) DeleteStudent(ctx context.Context, id string) error {
	if err := s.repo.DeleteStudent(ctx, id); err != nil {
		return fmt.Errorf("obe.AssessmentService.DeleteStudent: %w", err)
	}
	return nil
}

// ──────────────────────────────── Assessments ───────────────────────────────

func (s *AssessmentService) ListAssessments(ctx context.Context, courseID string) ([]Assessment, error) {
	return s.repo.ListAssessments(ctx, strings.TrimSpace(courseID))
}

func (s *AssessmentService) GetAssessment(ctx context.Context, id string) (*Assessment, error) {
	x, err := s.repo.GetAssessment(ctx, id)
	if err != nil {
		return nil, fmt.Errorf("obe.AssessmentService.GetAssessment: %w", err)
	}
	if x == nil {
		return nil, apperror.New(apperror.CodeNotFound, "assessment tidak ditemukan")
	}
	return x, nil
}

func (s *AssessmentService) CreateAssessment(ctx context.Context, in AssessmentInput) (*Assessment, error) {
	in, err := s.normalizeValidateAssessment(ctx, in, "")
	if err != nil {
		return nil, err
	}
	x, err := s.repo.CreateAssessment(ctx, "obeasm-"+uuid.NewString(), in)
	if err != nil {
		return nil, fmt.Errorf("obe.AssessmentService.CreateAssessment: %w", err)
	}
	return x, nil
}

func (s *AssessmentService) UpdateAssessment(ctx context.Context, id string, in AssessmentInput) (*Assessment, error) {
	existing, err := s.GetAssessment(ctx, id)
	if err != nil {
		return nil, err
	}
	// course_id is immutable on update; ignore whatever the client sent.
	in.CourseID = existing.CourseID
	in, err = s.normalizeValidateAssessment(ctx, in, id)
	if err != nil {
		return nil, err
	}
	x, err := s.repo.UpdateAssessment(ctx, id, in)
	if err != nil {
		return nil, fmt.Errorf("obe.AssessmentService.UpdateAssessment: %w", err)
	}
	return x, nil
}

func (s *AssessmentService) DeleteAssessment(ctx context.Context, id string) error {
	if err := s.repo.DeleteAssessment(ctx, id); err != nil {
		return fmt.Errorf("obe.AssessmentService.DeleteAssessment: %w", err)
	}
	return nil
}

// normalizeValidateAssessment enforces: nama required, jenis whitelisted, bobot
// 0..100, course exists, and Σ bobot per (course, tahun akademik) stays ≤ 100.
func (s *AssessmentService) normalizeValidateAssessment(ctx context.Context, in AssessmentInput, excludeID string) (AssessmentInput, error) {
	in.CourseID = strings.TrimSpace(in.CourseID)
	in.Nama = strings.TrimSpace(in.Nama)
	in.Jenis = strings.ToLower(strings.TrimSpace(in.Jenis))
	in.Semester = strings.TrimSpace(in.Semester)
	in.TahunAkademik = strings.TrimSpace(in.TahunAkademik)

	if in.Nama == "" {
		return in, apperror.New(apperror.CodeValidation, "nama assessment wajib diisi")
	}
	valid := false
	for _, j := range AllJenis {
		if in.Jenis == j {
			valid = true
			break
		}
	}
	if !valid {
		return in, apperror.New(apperror.CodeValidation, "jenis assessment tidak valid")
	}
	if in.Bobot < 0 || in.Bobot > 100 {
		return in, apperror.New(apperror.CodeValidation, "bobot harus 0–100")
	}
	course, err := s.core.GetCourse(ctx, in.CourseID)
	if err != nil {
		return in, fmt.Errorf("obe.AssessmentService.normalizeValidateAssessment: %w", err)
	}
	if course == nil {
		return in, apperror.New(apperror.CodeValidation, "mata kuliah tidak ditemukan")
	}
	// NOTE: check-then-write, not serialized — two simultaneous creates could in
	// theory land >100% combined. Accepted: single-admin usage, and the engine +
	// UI both tolerate (and flag) totals ≠ 100%, so the impact is advisory only.
	sum, err := s.repo.SumBobot(ctx, in.CourseID, in.TahunAkademik, excludeID)
	if err != nil {
		return in, fmt.Errorf("obe.AssessmentService.normalizeValidateAssessment: %w", err)
	}
	if sum+in.Bobot > 100 {
		return in, apperror.New(apperror.CodeValidation,
			fmt.Sprintf("total bobot melebihi 100%% (terpakai %d%%, sisa %d%%)", sum, 100-sum))
	}
	return in, nil
}

// ─────────────────────────── Assessment ↔ CPMK mapping ──────────────────────

func (s *AssessmentService) AssessmentMapping(ctx context.Context, courseID string) (*AssessmentMappingMatrix, error) {
	courseID = strings.TrimSpace(courseID)
	if courseID == "" {
		return nil, apperror.New(apperror.CodeValidation, "course_id wajib diisi")
	}
	assessments, err := s.repo.ListAssessments(ctx, courseID)
	if err != nil {
		return nil, fmt.Errorf("obe.AssessmentService.AssessmentMapping assessments: %w", err)
	}
	cpmks, err := s.core.ListCPMKByCourse(ctx, courseID)
	if err != nil {
		return nil, fmt.Errorf("obe.AssessmentService.AssessmentMapping cpmks: %w", err)
	}
	links, err := s.repo.ListAssessmentLinksByCourse(ctx, courseID)
	if err != nil {
		return nil, fmt.Errorf("obe.AssessmentService.AssessmentMapping links: %w", err)
	}
	return &AssessmentMappingMatrix{Assessments: assessments, CPMKs: cpmks, Links: links}, nil
}

func (s *AssessmentService) SetAssessmentMapping(ctx context.Context, in AssessmentMappingSetInput) error {
	if _, err := s.GetAssessment(ctx, strings.TrimSpace(in.AssessmentID)); err != nil {
		return err
	}
	cpmk, err := s.core.GetCPMK(ctx, strings.TrimSpace(in.CPMKID))
	if err != nil {
		return fmt.Errorf("obe.AssessmentService.SetAssessmentMapping: %w", err)
	}
	if cpmk == nil {
		return apperror.New(apperror.CodeNotFound, "CPMK tidak ditemukan")
	}
	if in.Linked {
		err = s.repo.AddAssessmentLink(ctx, in.AssessmentID, in.CPMKID)
	} else {
		err = s.repo.RemoveAssessmentLink(ctx, in.AssessmentID, in.CPMKID)
	}
	if err != nil {
		return fmt.Errorf("obe.AssessmentService.SetAssessmentMapping: %w", err)
	}
	return nil
}

// ────────────────────────────────── Scores ──────────────────────────────────

// ScoreMatrix returns the score-entry grid for one class: roster × in-scope
// assessments (see scopedAssessments) + existing scores.
func (s *AssessmentService) ScoreMatrix(ctx context.Context, classID string) (*ScoreMatrix, error) {
	class, err := s.GetClass(ctx, strings.TrimSpace(classID))
	if err != nil {
		return nil, err
	}
	students, err := s.repo.ListStudents(ctx, class.ID)
	if err != nil {
		return nil, fmt.Errorf("obe.AssessmentService.ScoreMatrix students: %w", err)
	}
	assessments, err := s.scopedAssessments(ctx, class)
	if err != nil {
		return nil, err
	}
	scores, err := s.repo.ListScoresByClass(ctx, class.ID)
	if err != nil {
		return nil, fmt.Errorf("obe.AssessmentService.ScoreMatrix scores: %w", err)
	}
	total := 0
	for _, a := range assessments {
		total += a.Bobot
	}
	return &ScoreMatrix{Class: class, Students: students, Assessments: assessments, Scores: scores, BobotTotal: total}, nil
}

// SaveScores validates and upserts a batch of grid cells, then recomputes the
// class's achievement results so the stored tables stay fresh.
func (s *AssessmentService) SaveScores(ctx context.Context, in ScoresSaveInput) error {
	class, err := s.GetClass(ctx, strings.TrimSpace(in.ClassID))
	if err != nil {
		return err
	}
	if len(in.Scores) == 0 {
		return apperror.New(apperror.CodeValidation, "tidak ada nilai untuk disimpan")
	}

	students, err := s.repo.ListStudents(ctx, class.ID)
	if err != nil {
		return fmt.Errorf("obe.AssessmentService.SaveScores students: %w", err)
	}
	studentSet := map[string]bool{}
	for _, st := range students {
		studentSet[st.ID] = true
	}
	assessments, err := s.repo.ListAssessments(ctx, class.CourseID)
	if err != nil {
		return fmt.Errorf("obe.AssessmentService.SaveScores assessments: %w", err)
	}
	assessSet := map[string]bool{}
	for _, a := range assessments {
		assessSet[a.ID] = true
	}

	cells := make([]ScoreCell, 0, len(in.Scores))
	for _, c := range in.Scores {
		if !studentSet[c.StudentID] {
			return apperror.New(apperror.CodeValidation, "mahasiswa tidak terdaftar di kelas ini")
		}
		if !assessSet[c.AssessmentID] {
			return apperror.New(apperror.CodeValidation, "assessment tidak ditemukan pada mata kuliah ini")
		}
		if c.Score < 0 || c.Score > 100 {
			return apperror.New(apperror.CodeValidation, "nilai harus 0–100")
		}
		cells = append(cells, c)
	}
	ids := make([]string, len(cells))
	for i := range cells {
		ids[i] = "obescore-" + uuid.NewString()
	}
	if err := s.repo.UpsertScores(ctx, ids, cells); err != nil {
		return fmt.Errorf("obe.AssessmentService.SaveScores: %w", err)
	}
	// Refresh the materialized results; the payload itself is discarded.
	if _, err := s.ClassResults(ctx, class.ID); err != nil {
		return fmt.Errorf("obe.AssessmentService.SaveScores recompute: %w", err)
	}
	return nil
}
