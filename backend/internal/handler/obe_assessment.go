package handler

import (
	"context"
	"encoding/json"
	"net/http"

	"ptik/internal/domain/obe"
	"ptik/pkg/response"

	"github.com/go-chi/chi/v5"
)

// OBEAssessmentService is the behaviour the assessment/achievement handler needs.
type OBEAssessmentService interface {
	ListIndicators(ctx context.Context, curriculumID, cplID string) ([]obe.Indicator, error)
	GetIndicator(ctx context.Context, id string) (*obe.Indicator, error)
	CreateIndicator(ctx context.Context, in obe.IndicatorInput) (*obe.Indicator, error)
	UpdateIndicator(ctx context.Context, id string, in obe.IndicatorInput) (*obe.Indicator, error)
	DeleteIndicator(ctx context.Context, id string) error

	IKMapping(ctx context.Context, curriculumID string) (*obe.IKMappingMatrix, error)
	SetIKMapping(ctx context.Context, in obe.IKMappingSetInput) error

	ListClasses(ctx context.Context, courseID, curriculumID string) ([]obe.Class, error)
	GetClass(ctx context.Context, id string) (*obe.Class, error)
	CreateClass(ctx context.Context, in obe.ClassInput) (*obe.Class, error)
	UpdateClass(ctx context.Context, id string, in obe.ClassInput) (*obe.Class, error)
	DeleteClass(ctx context.Context, id string) error

	ListStudents(ctx context.Context, classID string) ([]obe.ClassStudent, error)
	CreateStudent(ctx context.Context, in obe.ClassStudentInput) (*obe.ClassStudent, error)
	CreateStudentsBulk(ctx context.Context, in obe.StudentsBulkInput) (int, error)
	UpdateStudent(ctx context.Context, id string, in obe.ClassStudentInput) (*obe.ClassStudent, error)
	DeleteStudent(ctx context.Context, id string) error

	ListAssessments(ctx context.Context, courseID string) ([]obe.Assessment, error)
	GetAssessment(ctx context.Context, id string) (*obe.Assessment, error)
	CreateAssessment(ctx context.Context, in obe.AssessmentInput) (*obe.Assessment, error)
	UpdateAssessment(ctx context.Context, id string, in obe.AssessmentInput) (*obe.Assessment, error)
	DeleteAssessment(ctx context.Context, id string) error

	AssessmentMapping(ctx context.Context, courseID string) (*obe.AssessmentMappingMatrix, error)
	SetAssessmentMapping(ctx context.Context, in obe.AssessmentMappingSetInput) error

	ScoreMatrix(ctx context.Context, classID string) (*obe.ScoreMatrix, error)
	SaveScores(ctx context.Context, in obe.ScoresSaveInput) error

	ClassResults(ctx context.Context, classID string) (*obe.ClassResults, error)
}

type OBEAssessmentHandler struct{ svc OBEAssessmentService }

func NewOBEAssessmentHandler(svc OBEAssessmentService) *OBEAssessmentHandler {
	return &OBEAssessmentHandler{svc: svc}
}

// Routes mounts the assessment/achievement admin API under /obe — writes are
// guarded by CRUDGuard against the "obe" menu key (admins bypass).
func (h *OBEAssessmentHandler) Routes(r chi.Router) {
	r.Route("/indicators", func(r chi.Router) {
		r.Get("/", h.ListIndicators)
		r.Post("/", h.CreateIndicator)
		r.Get("/{id}", h.GetIndicator)
		r.Put("/{id}", h.UpdateIndicator)
		r.Delete("/{id}", h.DeleteIndicator)
	})

	r.Route("/ik-mappings", func(r chi.Router) {
		r.Get("/", h.IKMapping)
		r.Put("/", h.SetIKMapping)
	})

	r.Route("/classes", func(r chi.Router) {
		r.Get("/", h.ListClasses)
		r.Post("/", h.CreateClass)
		r.Get("/{id}", h.GetClass)
		r.Put("/{id}", h.UpdateClass)
		r.Delete("/{id}", h.DeleteClass)
	})

	r.Route("/assessments", func(r chi.Router) {
		r.Get("/", h.ListAssessments)
		r.Post("/", h.CreateAssessment)
		r.Get("/{id}", h.GetAssessment)
		r.Put("/{id}", h.UpdateAssessment)
		r.Delete("/{id}", h.DeleteAssessment)
	})

	r.Route("/assessment-mappings", func(r chi.Router) {
		r.Get("/", h.AssessmentMapping)
		r.Put("/", h.SetAssessmentMapping)
	})

	r.Get("/results", h.ClassResults)
}

// NilaiRoutes mounts the score-entry API under /obe-nilai. That path is its own
// CRUDGuard menu key ("obe-nilai"), so a dosen can be granted score entry +
// roster management WITHOUT any write access to the rest of the OBE module.
func (h *OBEAssessmentHandler) NilaiRoutes(r chi.Router) {
	r.Route("/students", func(r chi.Router) {
		r.Get("/", h.ListStudents)
		r.Post("/", h.CreateStudent)
		r.Post("/bulk", h.CreateStudentsBulk)
		r.Put("/{id}", h.UpdateStudent)
		r.Delete("/{id}", h.DeleteStudent)
	})
	r.Get("/matrix", h.ScoreMatrix)
	r.Put("/scores", h.SaveScores)
}

// ─────────────────────────────── Indicators (IK) ────────────────────────────

func (h *OBEAssessmentHandler) ListIndicators(w http.ResponseWriter, r *http.Request) {
	list, err := h.svc.ListIndicators(r.Context(), r.URL.Query().Get("curriculum_id"), r.URL.Query().Get("cpl_id"))
	if err != nil {
		response.Error(w, err)
		return
	}
	response.JSON(w, http.StatusOK, list)
}

func (h *OBEAssessmentHandler) GetIndicator(w http.ResponseWriter, r *http.Request) {
	x, err := h.svc.GetIndicator(r.Context(), chi.URLParam(r, "id"))
	if err != nil {
		response.Error(w, err)
		return
	}
	response.JSON(w, http.StatusOK, x)
}

func (h *OBEAssessmentHandler) CreateIndicator(w http.ResponseWriter, r *http.Request) {
	var in obe.IndicatorInput
	if err := json.NewDecoder(r.Body).Decode(&in); err != nil {
		response.Error(w, newValidationErr("invalid request body"))
		return
	}
	x, err := h.svc.CreateIndicator(r.Context(), in)
	if err != nil {
		response.Error(w, err)
		return
	}
	response.JSON(w, http.StatusCreated, x)
}

func (h *OBEAssessmentHandler) UpdateIndicator(w http.ResponseWriter, r *http.Request) {
	var in obe.IndicatorInput
	if err := json.NewDecoder(r.Body).Decode(&in); err != nil {
		response.Error(w, newValidationErr("invalid request body"))
		return
	}
	x, err := h.svc.UpdateIndicator(r.Context(), chi.URLParam(r, "id"), in)
	if err != nil {
		response.Error(w, err)
		return
	}
	response.JSON(w, http.StatusOK, x)
}

func (h *OBEAssessmentHandler) DeleteIndicator(w http.ResponseWriter, r *http.Request) {
	if err := h.svc.DeleteIndicator(r.Context(), chi.URLParam(r, "id")); err != nil {
		response.Error(w, err)
		return
	}
	w.WriteHeader(http.StatusNoContent)
}

// ─────────────────────────────── IK ↔ CPMK mapping ──────────────────────────

func (h *OBEAssessmentHandler) IKMapping(w http.ResponseWriter, r *http.Request) {
	m, err := h.svc.IKMapping(r.Context(), r.URL.Query().Get("curriculum_id"))
	if err != nil {
		response.Error(w, err)
		return
	}
	response.JSON(w, http.StatusOK, m)
}

func (h *OBEAssessmentHandler) SetIKMapping(w http.ResponseWriter, r *http.Request) {
	var in obe.IKMappingSetInput
	if err := json.NewDecoder(r.Body).Decode(&in); err != nil {
		response.Error(w, newValidationErr("invalid request body"))
		return
	}
	if err := h.svc.SetIKMapping(r.Context(), in); err != nil {
		response.Error(w, err)
		return
	}
	response.JSON(w, http.StatusOK, map[string]bool{"ok": true})
}

// ────────────────────────────────── Classes ─────────────────────────────────

func (h *OBEAssessmentHandler) ListClasses(w http.ResponseWriter, r *http.Request) {
	list, err := h.svc.ListClasses(r.Context(), r.URL.Query().Get("course_id"), r.URL.Query().Get("curriculum_id"))
	if err != nil {
		response.Error(w, err)
		return
	}
	response.JSON(w, http.StatusOK, list)
}

func (h *OBEAssessmentHandler) GetClass(w http.ResponseWriter, r *http.Request) {
	x, err := h.svc.GetClass(r.Context(), chi.URLParam(r, "id"))
	if err != nil {
		response.Error(w, err)
		return
	}
	response.JSON(w, http.StatusOK, x)
}

func (h *OBEAssessmentHandler) CreateClass(w http.ResponseWriter, r *http.Request) {
	var in obe.ClassInput
	if err := json.NewDecoder(r.Body).Decode(&in); err != nil {
		response.Error(w, newValidationErr("invalid request body"))
		return
	}
	x, err := h.svc.CreateClass(r.Context(), in)
	if err != nil {
		response.Error(w, err)
		return
	}
	response.JSON(w, http.StatusCreated, x)
}

func (h *OBEAssessmentHandler) UpdateClass(w http.ResponseWriter, r *http.Request) {
	var in obe.ClassInput
	if err := json.NewDecoder(r.Body).Decode(&in); err != nil {
		response.Error(w, newValidationErr("invalid request body"))
		return
	}
	x, err := h.svc.UpdateClass(r.Context(), chi.URLParam(r, "id"), in)
	if err != nil {
		response.Error(w, err)
		return
	}
	response.JSON(w, http.StatusOK, x)
}

func (h *OBEAssessmentHandler) DeleteClass(w http.ResponseWriter, r *http.Request) {
	if err := h.svc.DeleteClass(r.Context(), chi.URLParam(r, "id")); err != nil {
		response.Error(w, err)
		return
	}
	w.WriteHeader(http.StatusNoContent)
}

// ─────────────────────────────── Class roster ───────────────────────────────

func (h *OBEAssessmentHandler) ListStudents(w http.ResponseWriter, r *http.Request) {
	list, err := h.svc.ListStudents(r.Context(), r.URL.Query().Get("class_id"))
	if err != nil {
		response.Error(w, err)
		return
	}
	response.JSON(w, http.StatusOK, list)
}

func (h *OBEAssessmentHandler) CreateStudent(w http.ResponseWriter, r *http.Request) {
	var in obe.ClassStudentInput
	if err := json.NewDecoder(r.Body).Decode(&in); err != nil {
		response.Error(w, newValidationErr("invalid request body"))
		return
	}
	x, err := h.svc.CreateStudent(r.Context(), in)
	if err != nil {
		response.Error(w, err)
		return
	}
	response.JSON(w, http.StatusCreated, x)
}

func (h *OBEAssessmentHandler) CreateStudentsBulk(w http.ResponseWriter, r *http.Request) {
	var in obe.StudentsBulkInput
	if err := json.NewDecoder(r.Body).Decode(&in); err != nil {
		response.Error(w, newValidationErr("invalid request body"))
		return
	}
	n, err := h.svc.CreateStudentsBulk(r.Context(), in)
	if err != nil {
		response.Error(w, err)
		return
	}
	response.JSON(w, http.StatusCreated, map[string]int{"inserted": n})
}

func (h *OBEAssessmentHandler) UpdateStudent(w http.ResponseWriter, r *http.Request) {
	var in obe.ClassStudentInput
	if err := json.NewDecoder(r.Body).Decode(&in); err != nil {
		response.Error(w, newValidationErr("invalid request body"))
		return
	}
	x, err := h.svc.UpdateStudent(r.Context(), chi.URLParam(r, "id"), in)
	if err != nil {
		response.Error(w, err)
		return
	}
	response.JSON(w, http.StatusOK, x)
}

func (h *OBEAssessmentHandler) DeleteStudent(w http.ResponseWriter, r *http.Request) {
	if err := h.svc.DeleteStudent(r.Context(), chi.URLParam(r, "id")); err != nil {
		response.Error(w, err)
		return
	}
	w.WriteHeader(http.StatusNoContent)
}

// ──────────────────────────────── Assessments ───────────────────────────────

func (h *OBEAssessmentHandler) ListAssessments(w http.ResponseWriter, r *http.Request) {
	list, err := h.svc.ListAssessments(r.Context(), r.URL.Query().Get("course_id"))
	if err != nil {
		response.Error(w, err)
		return
	}
	response.JSON(w, http.StatusOK, list)
}

func (h *OBEAssessmentHandler) GetAssessment(w http.ResponseWriter, r *http.Request) {
	x, err := h.svc.GetAssessment(r.Context(), chi.URLParam(r, "id"))
	if err != nil {
		response.Error(w, err)
		return
	}
	response.JSON(w, http.StatusOK, x)
}

func (h *OBEAssessmentHandler) CreateAssessment(w http.ResponseWriter, r *http.Request) {
	var in obe.AssessmentInput
	if err := json.NewDecoder(r.Body).Decode(&in); err != nil {
		response.Error(w, newValidationErr("invalid request body"))
		return
	}
	x, err := h.svc.CreateAssessment(r.Context(), in)
	if err != nil {
		response.Error(w, err)
		return
	}
	response.JSON(w, http.StatusCreated, x)
}

func (h *OBEAssessmentHandler) UpdateAssessment(w http.ResponseWriter, r *http.Request) {
	var in obe.AssessmentInput
	if err := json.NewDecoder(r.Body).Decode(&in); err != nil {
		response.Error(w, newValidationErr("invalid request body"))
		return
	}
	x, err := h.svc.UpdateAssessment(r.Context(), chi.URLParam(r, "id"), in)
	if err != nil {
		response.Error(w, err)
		return
	}
	response.JSON(w, http.StatusOK, x)
}

func (h *OBEAssessmentHandler) DeleteAssessment(w http.ResponseWriter, r *http.Request) {
	if err := h.svc.DeleteAssessment(r.Context(), chi.URLParam(r, "id")); err != nil {
		response.Error(w, err)
		return
	}
	w.WriteHeader(http.StatusNoContent)
}

// ─────────────────────────── Assessment ↔ CPMK mapping ──────────────────────

func (h *OBEAssessmentHandler) AssessmentMapping(w http.ResponseWriter, r *http.Request) {
	m, err := h.svc.AssessmentMapping(r.Context(), r.URL.Query().Get("course_id"))
	if err != nil {
		response.Error(w, err)
		return
	}
	response.JSON(w, http.StatusOK, m)
}

func (h *OBEAssessmentHandler) SetAssessmentMapping(w http.ResponseWriter, r *http.Request) {
	var in obe.AssessmentMappingSetInput
	if err := json.NewDecoder(r.Body).Decode(&in); err != nil {
		response.Error(w, newValidationErr("invalid request body"))
		return
	}
	if err := h.svc.SetAssessmentMapping(r.Context(), in); err != nil {
		response.Error(w, err)
		return
	}
	response.JSON(w, http.StatusOK, map[string]bool{"ok": true})
}

// ──────────────────────────── Scores & results ──────────────────────────────

func (h *OBEAssessmentHandler) ScoreMatrix(w http.ResponseWriter, r *http.Request) {
	m, err := h.svc.ScoreMatrix(r.Context(), r.URL.Query().Get("class_id"))
	if err != nil {
		response.Error(w, err)
		return
	}
	response.JSON(w, http.StatusOK, m)
}

func (h *OBEAssessmentHandler) SaveScores(w http.ResponseWriter, r *http.Request) {
	var in obe.ScoresSaveInput
	if err := json.NewDecoder(r.Body).Decode(&in); err != nil {
		response.Error(w, newValidationErr("invalid request body"))
		return
	}
	if err := h.svc.SaveScores(r.Context(), in); err != nil {
		response.Error(w, err)
		return
	}
	response.JSON(w, http.StatusOK, map[string]bool{"ok": true})
}

func (h *OBEAssessmentHandler) ClassResults(w http.ResponseWriter, r *http.Request) {
	res, err := h.svc.ClassResults(r.Context(), r.URL.Query().Get("class_id"))
	if err != nil {
		response.Error(w, err)
		return
	}
	response.JSON(w, http.StatusOK, res)
}
