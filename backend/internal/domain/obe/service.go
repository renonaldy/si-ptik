package obe

import (
	"context"
	"fmt"
	"sort"
	"strings"

	"ptik/pkg/apperror"

	"github.com/google/uuid"
)

type Service struct{ repo Repository }

func NewService(repo Repository) *Service { return &Service{repo: repo} }

// ─────────────────────────────── Curriculums ────────────────────────────────

func (s *Service) ListCurriculums(ctx context.Context) ([]Curriculum, error) {
	return s.repo.ListCurriculums(ctx)
}

func (s *Service) GetCurriculum(ctx context.Context, id string) (*Curriculum, error) {
	c, err := s.repo.GetCurriculum(ctx, id)
	if err != nil {
		return nil, fmt.Errorf("obe.Service.GetCurriculum: %w", err)
	}
	if c == nil {
		return nil, apperror.New(apperror.CodeNotFound, "kurikulum tidak ditemukan")
	}
	return c, nil
}

func (s *Service) CreateCurriculum(ctx context.Context, in CurriculumInput) (*Curriculum, error) {
	if strings.TrimSpace(in.Nama) == "" {
		return nil, apperror.New(apperror.CodeValidation, "nama kurikulum wajib diisi")
	}
	c, err := s.repo.CreateCurriculum(ctx, "obecur-"+uuid.NewString(), normalizeCurriculum(in))
	if err != nil {
		return nil, fmt.Errorf("obe.Service.CreateCurriculum: %w", err)
	}
	return c, nil
}

func (s *Service) UpdateCurriculum(ctx context.Context, id string, in CurriculumInput) (*Curriculum, error) {
	if strings.TrimSpace(in.Nama) == "" {
		return nil, apperror.New(apperror.CodeValidation, "nama kurikulum wajib diisi")
	}
	if _, err := s.GetCurriculum(ctx, id); err != nil {
		return nil, err
	}
	c, err := s.repo.UpdateCurriculum(ctx, id, normalizeCurriculum(in))
	if err != nil {
		return nil, fmt.Errorf("obe.Service.UpdateCurriculum: %w", err)
	}
	return c, nil
}

func (s *Service) DeleteCurriculum(ctx context.Context, id string) error {
	if err := s.repo.DeleteCurriculum(ctx, id); err != nil {
		return fmt.Errorf("obe.Service.DeleteCurriculum: %w", err)
	}
	return nil
}

func (s *Service) ActivateCurriculum(ctx context.Context, id string) (*Curriculum, error) {
	if _, err := s.GetCurriculum(ctx, id); err != nil {
		return nil, err
	}
	c, err := s.repo.SetActiveCurriculum(ctx, id)
	if err != nil {
		return nil, fmt.Errorf("obe.Service.ActivateCurriculum: %w", err)
	}
	return c, nil
}

// ───────────────────────────────── Courses ──────────────────────────────────

func (s *Service) ListCourses(ctx context.Context, curriculumID string, semester int) ([]Course, error) {
	return s.repo.ListCourses(ctx, strings.TrimSpace(curriculumID), semester)
}

func (s *Service) GetCourse(ctx context.Context, id string) (*Course, error) {
	c, err := s.repo.GetCourse(ctx, id)
	if err != nil {
		return nil, fmt.Errorf("obe.Service.GetCourse: %w", err)
	}
	if c == nil {
		return nil, apperror.New(apperror.CodeNotFound, "mata kuliah tidak ditemukan")
	}
	return c, nil
}

func (s *Service) CreateCourse(ctx context.Context, in CourseInput) (*Course, error) {
	if err := s.validateCourse(ctx, in); err != nil {
		return nil, err
	}
	c, err := s.repo.CreateCourse(ctx, "obecrs-"+uuid.NewString(), normalizeCourse(in))
	if err != nil {
		return nil, fmt.Errorf("obe.Service.CreateCourse: %w", err)
	}
	return c, nil
}

func (s *Service) UpdateCourse(ctx context.Context, id string, in CourseInput) (*Course, error) {
	if err := s.validateCourse(ctx, in); err != nil {
		return nil, err
	}
	if _, err := s.GetCourse(ctx, id); err != nil {
		return nil, err
	}
	c, err := s.repo.UpdateCourse(ctx, id, normalizeCourse(in))
	if err != nil {
		return nil, fmt.Errorf("obe.Service.UpdateCourse: %w", err)
	}
	return c, nil
}

func (s *Service) DeleteCourse(ctx context.Context, id string) error {
	if err := s.repo.DeleteCourse(ctx, id); err != nil {
		return fmt.Errorf("obe.Service.DeleteCourse: %w", err)
	}
	return nil
}

func (s *Service) validateCourse(ctx context.Context, in CourseInput) error {
	if strings.TrimSpace(in.Nama) == "" {
		return apperror.New(apperror.CodeValidation, "nama mata kuliah wajib diisi")
	}
	if in.Semester < 1 || in.Semester > 8 {
		return apperror.New(apperror.CodeValidation, "semester harus antara 1 dan 8")
	}
	if in.SKS < 0 {
		return apperror.New(apperror.CodeValidation, "sks tidak boleh negatif")
	}
	return s.mustCurriculum(ctx, in.CurriculumID)
}

// ─────────────────────────────────── CPL ────────────────────────────────────

func (s *Service) ListCPL(ctx context.Context, curriculumID string) ([]CPL, error) {
	return s.repo.ListCPL(ctx, strings.TrimSpace(curriculumID))
}

func (s *Service) GetCPL(ctx context.Context, id string) (*CPL, error) {
	c, err := s.repo.GetCPL(ctx, id)
	if err != nil {
		return nil, fmt.Errorf("obe.Service.GetCPL: %w", err)
	}
	if c == nil {
		return nil, apperror.New(apperror.CodeNotFound, "CPL tidak ditemukan")
	}
	return c, nil
}

func (s *Service) CreateCPL(ctx context.Context, in CPLInput) (*CPL, error) {
	if err := s.validateCPL(ctx, in); err != nil {
		return nil, err
	}
	c, err := s.repo.CreateCPL(ctx, "obecpl-"+uuid.NewString(), normalizeCPL(in))
	if err != nil {
		return nil, fmt.Errorf("obe.Service.CreateCPL: %w", err)
	}
	return c, nil
}

func (s *Service) UpdateCPL(ctx context.Context, id string, in CPLInput) (*CPL, error) {
	if err := s.validateCPL(ctx, in); err != nil {
		return nil, err
	}
	if _, err := s.GetCPL(ctx, id); err != nil {
		return nil, err
	}
	c, err := s.repo.UpdateCPL(ctx, id, normalizeCPL(in))
	if err != nil {
		return nil, fmt.Errorf("obe.Service.UpdateCPL: %w", err)
	}
	return c, nil
}

func (s *Service) DeleteCPL(ctx context.Context, id string) error {
	if err := s.repo.DeleteCPL(ctx, id); err != nil {
		return fmt.Errorf("obe.Service.DeleteCPL: %w", err)
	}
	return nil
}

func (s *Service) validateCPL(ctx context.Context, in CPLInput) error {
	if strings.TrimSpace(in.Deskripsi) == "" {
		return apperror.New(apperror.CodeValidation, "deskripsi CPL wajib diisi")
	}
	if !validKategori(in.Kategori) {
		return apperror.New(apperror.CodeValidation, "kategori CPL tidak valid")
	}
	return s.mustCurriculum(ctx, in.CurriculumID)
}

// ─────────────────────────────────── CPMK ───────────────────────────────────

func (s *Service) ListCPMK(ctx context.Context, courseID, curriculumID string) ([]CPMK, error) {
	if c := strings.TrimSpace(courseID); c != "" {
		return s.repo.ListCPMKByCourse(ctx, c)
	}
	return s.repo.ListCPMKByCurriculum(ctx, strings.TrimSpace(curriculumID))
}

func (s *Service) GetCPMK(ctx context.Context, id string) (*CPMK, error) {
	c, err := s.repo.GetCPMK(ctx, id)
	if err != nil {
		return nil, fmt.Errorf("obe.Service.GetCPMK: %w", err)
	}
	if c == nil {
		return nil, apperror.New(apperror.CodeNotFound, "CPMK tidak ditemukan")
	}
	return c, nil
}

func (s *Service) CreateCPMK(ctx context.Context, in CPMKInput) (*CPMK, error) {
	if err := s.validateCPMK(ctx, in); err != nil {
		return nil, err
	}
	c, err := s.repo.CreateCPMK(ctx, "obecpmk-"+uuid.NewString(), normalizeCPMK(in))
	if err != nil {
		return nil, fmt.Errorf("obe.Service.CreateCPMK: %w", err)
	}
	return c, nil
}

func (s *Service) UpdateCPMK(ctx context.Context, id string, in CPMKInput) (*CPMK, error) {
	if err := s.validateCPMK(ctx, in); err != nil {
		return nil, err
	}
	if _, err := s.GetCPMK(ctx, id); err != nil {
		return nil, err
	}
	c, err := s.repo.UpdateCPMK(ctx, id, normalizeCPMK(in))
	if err != nil {
		return nil, fmt.Errorf("obe.Service.UpdateCPMK: %w", err)
	}
	return c, nil
}

func (s *Service) DeleteCPMK(ctx context.Context, id string) error {
	if err := s.repo.DeleteCPMK(ctx, id); err != nil {
		return fmt.Errorf("obe.Service.DeleteCPMK: %w", err)
	}
	return nil
}

func (s *Service) validateCPMK(ctx context.Context, in CPMKInput) error {
	if strings.TrimSpace(in.Deskripsi) == "" {
		return apperror.New(apperror.CodeValidation, "deskripsi CPMK wajib diisi")
	}
	if strings.TrimSpace(in.CourseID) == "" {
		return apperror.New(apperror.CodeValidation, "mata kuliah wajib dipilih")
	}
	if _, err := s.GetCourse(ctx, in.CourseID); err != nil {
		return err
	}
	return nil
}

// ─────────────────────────────────── RPS ────────────────────────────────────

func (s *Service) ListRPS(ctx context.Context, courseID string) ([]RPS, error) {
	return s.repo.ListRPS(ctx, strings.TrimSpace(courseID))
}

func (s *Service) GetRPS(ctx context.Context, id string) (*RPS, error) {
	c, err := s.repo.GetRPS(ctx, id)
	if err != nil {
		return nil, fmt.Errorf("obe.Service.GetRPS: %w", err)
	}
	if c == nil {
		return nil, apperror.New(apperror.CodeNotFound, "RPS tidak ditemukan")
	}
	return c, nil
}

func (s *Service) CreateRPS(ctx context.Context, in RPSInput) (*RPS, error) {
	if err := s.validateRPS(ctx, in); err != nil {
		return nil, err
	}
	c, err := s.repo.CreateRPS(ctx, "oberps-"+uuid.NewString(), normalizeRPS(in))
	if err != nil {
		return nil, fmt.Errorf("obe.Service.CreateRPS: %w", err)
	}
	return c, nil
}

func (s *Service) UpdateRPS(ctx context.Context, id string, in RPSInput) (*RPS, error) {
	if err := s.validateRPS(ctx, in); err != nil {
		return nil, err
	}
	if _, err := s.GetRPS(ctx, id); err != nil {
		return nil, err
	}
	c, err := s.repo.UpdateRPS(ctx, id, normalizeRPS(in))
	if err != nil {
		return nil, fmt.Errorf("obe.Service.UpdateRPS: %w", err)
	}
	return c, nil
}

func (s *Service) DeleteRPS(ctx context.Context, id string) error {
	if err := s.repo.DeleteRPS(ctx, id); err != nil {
		return fmt.Errorf("obe.Service.DeleteRPS: %w", err)
	}
	return nil
}

func (s *Service) validateRPS(ctx context.Context, in RPSInput) error {
	if strings.TrimSpace(in.CourseID) == "" {
		return apperror.New(apperror.CodeValidation, "mata kuliah wajib dipilih")
	}
	if in.Minggu < 1 {
		return apperror.New(apperror.CodeValidation, "minggu minimal 1")
	}
	if _, err := s.GetCourse(ctx, in.CourseID); err != nil {
		return err
	}
	// A referenced CPMK must belong to the same course.
	if in.CPMKID != nil && strings.TrimSpace(*in.CPMKID) != "" {
		cpmk, err := s.GetCPMK(ctx, *in.CPMKID)
		if err != nil {
			return err
		}
		if cpmk.CourseID != in.CourseID {
			return apperror.New(apperror.CodeValidation, "CPMK tidak sesuai dengan mata kuliah")
		}
	}
	return nil
}

// ─────────────────────────────── Mapping ────────────────────────────────────

func (s *Service) Mapping(ctx context.Context, curriculumID string) (*MappingMatrix, error) {
	curriculumID = strings.TrimSpace(curriculumID)
	if curriculumID == "" {
		return nil, apperror.New(apperror.CodeValidation, "curriculum_id wajib diisi")
	}
	cpls, err := s.repo.ListCPL(ctx, curriculumID)
	if err != nil {
		return nil, fmt.Errorf("obe.Service.Mapping cpl: %w", err)
	}
	cpmks, err := s.repo.ListCPMKByCurriculum(ctx, curriculumID)
	if err != nil {
		return nil, fmt.Errorf("obe.Service.Mapping cpmk: %w", err)
	}
	links, err := s.repo.ListLinksByCurriculum(ctx, curriculumID)
	if err != nil {
		return nil, fmt.Errorf("obe.Service.Mapping links: %w", err)
	}
	return &MappingMatrix{CPLs: cpls, CPMKs: cpmks, Links: links}, nil
}

func (s *Service) SetMapping(ctx context.Context, in MappingSetInput) error {
	if strings.TrimSpace(in.CPLID) == "" || strings.TrimSpace(in.CPMKID) == "" {
		return apperror.New(apperror.CodeValidation, "cpl_id dan cpmk_id wajib diisi")
	}
	cpl, err := s.GetCPL(ctx, in.CPLID)
	if err != nil {
		return err
	}
	cpmk, err := s.GetCPMK(ctx, in.CPMKID)
	if err != nil {
		return err
	}
	// Both endpoints must live in the same curriculum.
	course, err := s.GetCourse(ctx, cpmk.CourseID)
	if err != nil {
		return err
	}
	if course.CurriculumID != cpl.CurriculumID {
		return apperror.New(apperror.CodeValidation, "CPL dan CPMK harus berada pada kurikulum yang sama")
	}
	if in.Linked {
		if err := s.repo.AddLink(ctx, in.CPLID, in.CPMKID); err != nil {
			return fmt.Errorf("obe.Service.SetMapping add: %w", err)
		}
		return nil
	}
	if err := s.repo.RemoveLink(ctx, in.CPLID, in.CPMKID); err != nil {
		return fmt.Errorf("obe.Service.SetMapping remove: %w", err)
	}
	return nil
}

// ─────────────────────────────────── Stats ──────────────────────────────────

// Stats returns dashboard numbers for the given curriculum, or the active one
// when curriculumID is empty. With no curriculum at all it returns zeroed stats.
func (s *Service) Stats(ctx context.Context, curriculumID string) (*Stats, error) {
	curriculumID = strings.TrimSpace(curriculumID)
	var cur *Curriculum
	var err error
	if curriculumID == "" {
		cur, err = s.repo.GetActiveCurriculum(ctx)
		if err != nil {
			return nil, fmt.Errorf("obe.Service.Stats active: %w", err)
		}
	} else {
		cur, err = s.GetCurriculum(ctx, curriculumID)
		if err != nil {
			return nil, err
		}
	}
	if cur == nil {
		return &Stats{CoursesBySemester: map[int]int{}, CPLByKategori: map[string]int{}}, nil
	}
	counts, err := s.repo.CountsFor(ctx, cur.ID)
	if err != nil {
		return nil, fmt.Errorf("obe.Service.Stats counts: %w", err)
	}
	progress := 0
	if counts.CPMKCount > 0 {
		progress = counts.MappedCPMK * 100 / counts.CPMKCount
	}
	return &Stats{
		Curriculum:        cur,
		CourseCount:       counts.CourseCount,
		CPLCount:          counts.CPLCount,
		CPMKCount:         counts.CPMKCount,
		RPSCount:          counts.RPSCount,
		TotalSKS:          counts.TotalSKS,
		MappedCPMK:        counts.MappedCPMK,
		MappingProgress:   progress,
		CoursesBySemester: counts.CoursesBySemester,
		CPLByKategori:     counts.CPLByKategori,
	}, nil
}

// ─────────────────────── Public aggregate (active curriculum) ────────────────

func (s *Service) PublicData(ctx context.Context) (*PublicData, error) {
	cur, err := s.repo.GetActiveCurriculum(ctx)
	if err != nil {
		return nil, fmt.Errorf("obe.Service.PublicData active: %w", err)
	}
	if cur == nil {
		return &PublicData{CPLs: []CPL{}, Courses: []PublicCourse{}}, nil
	}
	cpls, err := s.repo.ListCPL(ctx, cur.ID)
	if err != nil {
		return nil, fmt.Errorf("obe.Service.PublicData cpl: %w", err)
	}
	courses, err := s.repo.ListCourses(ctx, cur.ID, 0)
	if err != nil {
		return nil, fmt.Errorf("obe.Service.PublicData courses: %w", err)
	}
	cpmks, err := s.repo.ListCPMKByCurriculum(ctx, cur.ID)
	if err != nil {
		return nil, fmt.Errorf("obe.Service.PublicData cpmk: %w", err)
	}
	links, err := s.repo.ListLinksByCurriculum(ctx, cur.ID)
	if err != nil {
		return nil, fmt.Errorf("obe.Service.PublicData links: %w", err)
	}

	cpmkByCourse := map[string][]CPMK{}
	courseByCPMK := map[string]string{}
	for _, m := range cpmks {
		cpmkByCourse[m.CourseID] = append(cpmkByCourse[m.CourseID], m)
		courseByCPMK[m.ID] = m.CourseID
	}
	kodeByCPL := map[string]string{}
	for _, c := range cpls {
		kodeByCPL[c.ID] = c.Kode
	}
	// course id → set of supported CPL codes (via its CPMK links)
	cplCodesByCourse := map[string]map[string]struct{}{}
	for _, l := range links {
		courseID, ok := courseByCPMK[l.CPMKID]
		if !ok {
			continue
		}
		kode := kodeByCPL[l.CPLID]
		if kode == "" {
			continue
		}
		if cplCodesByCourse[courseID] == nil {
			cplCodesByCourse[courseID] = map[string]struct{}{}
		}
		cplCodesByCourse[courseID][kode] = struct{}{}
	}

	out := make([]PublicCourse, 0, len(courses))
	for _, c := range courses {
		list := cpmkByCourse[c.ID]
		if list == nil {
			list = []CPMK{}
		}
		codes := make([]string, 0, len(cplCodesByCourse[c.ID]))
		for k := range cplCodesByCourse[c.ID] {
			codes = append(codes, k)
		}
		sort.Strings(codes)
		out = append(out, PublicCourse{Course: c, CPMKs: list, CPLCodes: codes})
	}
	return &PublicData{Curriculum: cur, CPLs: cpls, Courses: out}, nil
}

// ─────────────────────────────── helpers ────────────────────────────────────

func (s *Service) mustCurriculum(ctx context.Context, curriculumID string) error {
	if strings.TrimSpace(curriculumID) == "" {
		return apperror.New(apperror.CodeValidation, "kurikulum wajib dipilih")
	}
	if _, err := s.GetCurriculum(ctx, curriculumID); err != nil {
		return err
	}
	return nil
}

func validKategori(k string) bool {
	switch k {
	case KategoriSikap, KategoriPengetahuan, KategoriKeterampilanUmum, KategoriKeterampilanKhusus:
		return true
	default:
		return false
	}
}

func normalizeCurriculum(in CurriculumInput) CurriculumInput {
	in.Nama = strings.TrimSpace(in.Nama)
	in.Tahun = strings.TrimSpace(in.Tahun)
	in.NomorSK = strings.TrimSpace(in.NomorSK)
	in.TanggalBerlaku = strings.TrimSpace(in.TanggalBerlaku)
	in.Deskripsi = strings.TrimSpace(in.Deskripsi)
	in.BukuURL = strings.TrimSpace(in.BukuURL)
	in.StrukturURL = strings.TrimSpace(in.StrukturURL)
	// Attainment threshold defaults to 70% and is clamped to a sane range.
	if in.Threshold <= 0 {
		in.Threshold = 70
	}
	if in.Threshold > 100 {
		in.Threshold = 100
	}
	return in
}

func normalizeCourse(in CourseInput) CourseInput {
	in.CurriculumID = strings.TrimSpace(in.CurriculumID)
	in.Kode = strings.TrimSpace(in.Kode)
	in.Nama = strings.TrimSpace(in.Nama)
	in.Deskripsi = strings.TrimSpace(in.Deskripsi)
	in.RPSURL = strings.TrimSpace(in.RPSURL)
	return in
}

func normalizeCPL(in CPLInput) CPLInput {
	in.CurriculumID = strings.TrimSpace(in.CurriculumID)
	in.Kode = strings.TrimSpace(in.Kode)
	in.Deskripsi = strings.TrimSpace(in.Deskripsi)
	in.Kategori = strings.TrimSpace(in.Kategori)
	return in
}

func normalizeCPMK(in CPMKInput) CPMKInput {
	in.CourseID = strings.TrimSpace(in.CourseID)
	in.Kode = strings.TrimSpace(in.Kode)
	in.Deskripsi = strings.TrimSpace(in.Deskripsi)
	in.LevelBloom = strings.TrimSpace(in.LevelBloom)
	in.Target = strings.TrimSpace(in.Target)
	return in
}

func normalizeRPS(in RPSInput) RPSInput {
	in.CourseID = strings.TrimSpace(in.CourseID)
	in.Materi = strings.TrimSpace(in.Materi)
	in.Metode = strings.TrimSpace(in.Metode)
	in.Assessment = strings.TrimSpace(in.Assessment)
	if in.CPMKID != nil {
		trimmed := strings.TrimSpace(*in.CPMKID)
		if trimmed == "" {
			in.CPMKID = nil
		} else {
			in.CPMKID = &trimmed
		}
	}
	return in
}
