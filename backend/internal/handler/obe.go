package handler

import (
	"context"
	"encoding/json"
	"net/http"
	"strconv"

	"ptik/internal/domain/obe"
	"ptik/pkg/response"

	"github.com/go-chi/chi/v5"
)

// OBEService is the behaviour the OBE handler needs (locally defined so it stays mockable).
type OBEService interface {
	Stats(ctx context.Context, curriculumID string) (*obe.Stats, error)

	ListCurriculums(ctx context.Context) ([]obe.Curriculum, error)
	GetCurriculum(ctx context.Context, id string) (*obe.Curriculum, error)
	CreateCurriculum(ctx context.Context, in obe.CurriculumInput) (*obe.Curriculum, error)
	UpdateCurriculum(ctx context.Context, id string, in obe.CurriculumInput) (*obe.Curriculum, error)
	DeleteCurriculum(ctx context.Context, id string) error
	ActivateCurriculum(ctx context.Context, id string) (*obe.Curriculum, error)

	ListCourses(ctx context.Context, curriculumID string, semester int) ([]obe.Course, error)
	GetCourse(ctx context.Context, id string) (*obe.Course, error)
	CreateCourse(ctx context.Context, in obe.CourseInput) (*obe.Course, error)
	UpdateCourse(ctx context.Context, id string, in obe.CourseInput) (*obe.Course, error)
	DeleteCourse(ctx context.Context, id string) error

	ListCPL(ctx context.Context, curriculumID string) ([]obe.CPL, error)
	GetCPL(ctx context.Context, id string) (*obe.CPL, error)
	CreateCPL(ctx context.Context, in obe.CPLInput) (*obe.CPL, error)
	UpdateCPL(ctx context.Context, id string, in obe.CPLInput) (*obe.CPL, error)
	DeleteCPL(ctx context.Context, id string) error

	ListCPMK(ctx context.Context, courseID, curriculumID string) ([]obe.CPMK, error)
	GetCPMK(ctx context.Context, id string) (*obe.CPMK, error)
	CreateCPMK(ctx context.Context, in obe.CPMKInput) (*obe.CPMK, error)
	UpdateCPMK(ctx context.Context, id string, in obe.CPMKInput) (*obe.CPMK, error)
	DeleteCPMK(ctx context.Context, id string) error

	ListRPS(ctx context.Context, courseID string) ([]obe.RPS, error)
	GetRPS(ctx context.Context, id string) (*obe.RPS, error)
	CreateRPS(ctx context.Context, in obe.RPSInput) (*obe.RPS, error)
	UpdateRPS(ctx context.Context, id string, in obe.RPSInput) (*obe.RPS, error)
	DeleteRPS(ctx context.Context, id string) error

	Mapping(ctx context.Context, curriculumID string) (*obe.MappingMatrix, error)
	SetMapping(ctx context.Context, in obe.MappingSetInput) error

	PublicData(ctx context.Context) (*obe.PublicData, error)
}

type OBEHandler struct{ svc OBEService }

func NewOBEHandler(svc OBEService) *OBEHandler { return &OBEHandler{svc: svc} }

// Routes mounts the authenticated OBE admin API under /obe. Writes here are
// guarded by CRUDGuard against the "obe" menu key (admins bypass).
func (h *OBEHandler) Routes(r chi.Router) {
	r.Get("/stats", h.Stats)

	r.Route("/curriculums", func(r chi.Router) {
		r.Get("/", h.ListCurriculums)
		r.Post("/", h.CreateCurriculum)
		r.Get("/{id}", h.GetCurriculum)
		r.Put("/{id}", h.UpdateCurriculum)
		r.Delete("/{id}", h.DeleteCurriculum)
		r.Patch("/{id}/activate", h.ActivateCurriculum)
	})

	r.Route("/courses", func(r chi.Router) {
		r.Get("/", h.ListCourses)
		r.Post("/", h.CreateCourse)
		r.Get("/{id}", h.GetCourse)
		r.Put("/{id}", h.UpdateCourse)
		r.Delete("/{id}", h.DeleteCourse)
	})

	r.Route("/cpl", func(r chi.Router) {
		r.Get("/", h.ListCPL)
		r.Post("/", h.CreateCPL)
		r.Get("/{id}", h.GetCPL)
		r.Put("/{id}", h.UpdateCPL)
		r.Delete("/{id}", h.DeleteCPL)
	})

	r.Route("/cpmk", func(r chi.Router) {
		r.Get("/", h.ListCPMK)
		r.Post("/", h.CreateCPMK)
		r.Get("/{id}", h.GetCPMK)
		r.Put("/{id}", h.UpdateCPMK)
		r.Delete("/{id}", h.DeleteCPMK)
	})

	r.Route("/rps", func(r chi.Router) {
		r.Get("/", h.ListRPS)
		r.Post("/", h.CreateRPS)
		r.Get("/{id}", h.GetRPS)
		r.Put("/{id}", h.UpdateRPS)
		r.Delete("/{id}", h.DeleteRPS)
	})

	r.Route("/mappings", func(r chi.Router) {
		r.Get("/", h.Mapping)
		r.Put("/", h.SetMapping)
	})
}

// ─────────────────────────────────── Stats ──────────────────────────────────

func (h *OBEHandler) Stats(w http.ResponseWriter, r *http.Request) {
	x, err := h.svc.Stats(r.Context(), r.URL.Query().Get("curriculum_id"))
	if err != nil {
		response.Error(w, err)
		return
	}
	response.JSON(w, http.StatusOK, x)
}

// ─────────────────────────────── Curriculums ────────────────────────────────

func (h *OBEHandler) ListCurriculums(w http.ResponseWriter, r *http.Request) {
	list, err := h.svc.ListCurriculums(r.Context())
	if err != nil {
		response.Error(w, err)
		return
	}
	response.JSON(w, http.StatusOK, list)
}

func (h *OBEHandler) GetCurriculum(w http.ResponseWriter, r *http.Request) {
	x, err := h.svc.GetCurriculum(r.Context(), chi.URLParam(r, "id"))
	if err != nil {
		response.Error(w, err)
		return
	}
	response.JSON(w, http.StatusOK, x)
}

func (h *OBEHandler) CreateCurriculum(w http.ResponseWriter, r *http.Request) {
	var in obe.CurriculumInput
	if err := json.NewDecoder(r.Body).Decode(&in); err != nil {
		response.Error(w, newValidationErr("invalid request body"))
		return
	}
	x, err := h.svc.CreateCurriculum(r.Context(), in)
	if err != nil {
		response.Error(w, err)
		return
	}
	response.JSON(w, http.StatusCreated, x)
}

func (h *OBEHandler) UpdateCurriculum(w http.ResponseWriter, r *http.Request) {
	var in obe.CurriculumInput
	if err := json.NewDecoder(r.Body).Decode(&in); err != nil {
		response.Error(w, newValidationErr("invalid request body"))
		return
	}
	x, err := h.svc.UpdateCurriculum(r.Context(), chi.URLParam(r, "id"), in)
	if err != nil {
		response.Error(w, err)
		return
	}
	response.JSON(w, http.StatusOK, x)
}

func (h *OBEHandler) DeleteCurriculum(w http.ResponseWriter, r *http.Request) {
	if err := h.svc.DeleteCurriculum(r.Context(), chi.URLParam(r, "id")); err != nil {
		response.Error(w, err)
		return
	}
	w.WriteHeader(http.StatusNoContent)
}

func (h *OBEHandler) ActivateCurriculum(w http.ResponseWriter, r *http.Request) {
	x, err := h.svc.ActivateCurriculum(r.Context(), chi.URLParam(r, "id"))
	if err != nil {
		response.Error(w, err)
		return
	}
	response.JSON(w, http.StatusOK, x)
}

// ───────────────────────────────── Courses ──────────────────────────────────

func (h *OBEHandler) ListCourses(w http.ResponseWriter, r *http.Request) {
	q := r.URL.Query()
	semester, _ := strconv.Atoi(q.Get("semester"))
	list, err := h.svc.ListCourses(r.Context(), q.Get("curriculum_id"), semester)
	if err != nil {
		response.Error(w, err)
		return
	}
	response.JSON(w, http.StatusOK, list)
}

func (h *OBEHandler) GetCourse(w http.ResponseWriter, r *http.Request) {
	x, err := h.svc.GetCourse(r.Context(), chi.URLParam(r, "id"))
	if err != nil {
		response.Error(w, err)
		return
	}
	response.JSON(w, http.StatusOK, x)
}

func (h *OBEHandler) CreateCourse(w http.ResponseWriter, r *http.Request) {
	var in obe.CourseInput
	if err := json.NewDecoder(r.Body).Decode(&in); err != nil {
		response.Error(w, newValidationErr("invalid request body"))
		return
	}
	x, err := h.svc.CreateCourse(r.Context(), in)
	if err != nil {
		response.Error(w, err)
		return
	}
	response.JSON(w, http.StatusCreated, x)
}

func (h *OBEHandler) UpdateCourse(w http.ResponseWriter, r *http.Request) {
	var in obe.CourseInput
	if err := json.NewDecoder(r.Body).Decode(&in); err != nil {
		response.Error(w, newValidationErr("invalid request body"))
		return
	}
	x, err := h.svc.UpdateCourse(r.Context(), chi.URLParam(r, "id"), in)
	if err != nil {
		response.Error(w, err)
		return
	}
	response.JSON(w, http.StatusOK, x)
}

func (h *OBEHandler) DeleteCourse(w http.ResponseWriter, r *http.Request) {
	if err := h.svc.DeleteCourse(r.Context(), chi.URLParam(r, "id")); err != nil {
		response.Error(w, err)
		return
	}
	w.WriteHeader(http.StatusNoContent)
}

// ─────────────────────────────────── CPL ────────────────────────────────────

func (h *OBEHandler) ListCPL(w http.ResponseWriter, r *http.Request) {
	list, err := h.svc.ListCPL(r.Context(), r.URL.Query().Get("curriculum_id"))
	if err != nil {
		response.Error(w, err)
		return
	}
	response.JSON(w, http.StatusOK, list)
}

func (h *OBEHandler) GetCPL(w http.ResponseWriter, r *http.Request) {
	x, err := h.svc.GetCPL(r.Context(), chi.URLParam(r, "id"))
	if err != nil {
		response.Error(w, err)
		return
	}
	response.JSON(w, http.StatusOK, x)
}

func (h *OBEHandler) CreateCPL(w http.ResponseWriter, r *http.Request) {
	var in obe.CPLInput
	if err := json.NewDecoder(r.Body).Decode(&in); err != nil {
		response.Error(w, newValidationErr("invalid request body"))
		return
	}
	x, err := h.svc.CreateCPL(r.Context(), in)
	if err != nil {
		response.Error(w, err)
		return
	}
	response.JSON(w, http.StatusCreated, x)
}

func (h *OBEHandler) UpdateCPL(w http.ResponseWriter, r *http.Request) {
	var in obe.CPLInput
	if err := json.NewDecoder(r.Body).Decode(&in); err != nil {
		response.Error(w, newValidationErr("invalid request body"))
		return
	}
	x, err := h.svc.UpdateCPL(r.Context(), chi.URLParam(r, "id"), in)
	if err != nil {
		response.Error(w, err)
		return
	}
	response.JSON(w, http.StatusOK, x)
}

func (h *OBEHandler) DeleteCPL(w http.ResponseWriter, r *http.Request) {
	if err := h.svc.DeleteCPL(r.Context(), chi.URLParam(r, "id")); err != nil {
		response.Error(w, err)
		return
	}
	w.WriteHeader(http.StatusNoContent)
}

// ─────────────────────────────────── CPMK ───────────────────────────────────

func (h *OBEHandler) ListCPMK(w http.ResponseWriter, r *http.Request) {
	q := r.URL.Query()
	list, err := h.svc.ListCPMK(r.Context(), q.Get("course_id"), q.Get("curriculum_id"))
	if err != nil {
		response.Error(w, err)
		return
	}
	response.JSON(w, http.StatusOK, list)
}

func (h *OBEHandler) GetCPMK(w http.ResponseWriter, r *http.Request) {
	x, err := h.svc.GetCPMK(r.Context(), chi.URLParam(r, "id"))
	if err != nil {
		response.Error(w, err)
		return
	}
	response.JSON(w, http.StatusOK, x)
}

func (h *OBEHandler) CreateCPMK(w http.ResponseWriter, r *http.Request) {
	var in obe.CPMKInput
	if err := json.NewDecoder(r.Body).Decode(&in); err != nil {
		response.Error(w, newValidationErr("invalid request body"))
		return
	}
	x, err := h.svc.CreateCPMK(r.Context(), in)
	if err != nil {
		response.Error(w, err)
		return
	}
	response.JSON(w, http.StatusCreated, x)
}

func (h *OBEHandler) UpdateCPMK(w http.ResponseWriter, r *http.Request) {
	var in obe.CPMKInput
	if err := json.NewDecoder(r.Body).Decode(&in); err != nil {
		response.Error(w, newValidationErr("invalid request body"))
		return
	}
	x, err := h.svc.UpdateCPMK(r.Context(), chi.URLParam(r, "id"), in)
	if err != nil {
		response.Error(w, err)
		return
	}
	response.JSON(w, http.StatusOK, x)
}

func (h *OBEHandler) DeleteCPMK(w http.ResponseWriter, r *http.Request) {
	if err := h.svc.DeleteCPMK(r.Context(), chi.URLParam(r, "id")); err != nil {
		response.Error(w, err)
		return
	}
	w.WriteHeader(http.StatusNoContent)
}

// ─────────────────────────────────── RPS ────────────────────────────────────

func (h *OBEHandler) ListRPS(w http.ResponseWriter, r *http.Request) {
	list, err := h.svc.ListRPS(r.Context(), r.URL.Query().Get("course_id"))
	if err != nil {
		response.Error(w, err)
		return
	}
	response.JSON(w, http.StatusOK, list)
}

func (h *OBEHandler) GetRPS(w http.ResponseWriter, r *http.Request) {
	x, err := h.svc.GetRPS(r.Context(), chi.URLParam(r, "id"))
	if err != nil {
		response.Error(w, err)
		return
	}
	response.JSON(w, http.StatusOK, x)
}

func (h *OBEHandler) CreateRPS(w http.ResponseWriter, r *http.Request) {
	var in obe.RPSInput
	if err := json.NewDecoder(r.Body).Decode(&in); err != nil {
		response.Error(w, newValidationErr("invalid request body"))
		return
	}
	x, err := h.svc.CreateRPS(r.Context(), in)
	if err != nil {
		response.Error(w, err)
		return
	}
	response.JSON(w, http.StatusCreated, x)
}

func (h *OBEHandler) UpdateRPS(w http.ResponseWriter, r *http.Request) {
	var in obe.RPSInput
	if err := json.NewDecoder(r.Body).Decode(&in); err != nil {
		response.Error(w, newValidationErr("invalid request body"))
		return
	}
	x, err := h.svc.UpdateRPS(r.Context(), chi.URLParam(r, "id"), in)
	if err != nil {
		response.Error(w, err)
		return
	}
	response.JSON(w, http.StatusOK, x)
}

func (h *OBEHandler) DeleteRPS(w http.ResponseWriter, r *http.Request) {
	if err := h.svc.DeleteRPS(r.Context(), chi.URLParam(r, "id")); err != nil {
		response.Error(w, err)
		return
	}
	w.WriteHeader(http.StatusNoContent)
}

// ─────────────────────────────── Mapping ────────────────────────────────────

func (h *OBEHandler) Mapping(w http.ResponseWriter, r *http.Request) {
	x, err := h.svc.Mapping(r.Context(), r.URL.Query().Get("curriculum_id"))
	if err != nil {
		response.Error(w, err)
		return
	}
	response.JSON(w, http.StatusOK, x)
}

func (h *OBEHandler) SetMapping(w http.ResponseWriter, r *http.Request) {
	var in obe.MappingSetInput
	if err := json.NewDecoder(r.Body).Decode(&in); err != nil {
		response.Error(w, newValidationErr("invalid request body"))
		return
	}
	if err := h.svc.SetMapping(r.Context(), in); err != nil {
		response.Error(w, err)
		return
	}
	response.JSON(w, http.StatusOK, map[string]bool{"ok": true})
}

// ─────────────────────── Public (no-auth) aggregate read ─────────────────────

func (h *OBEHandler) PublicData(w http.ResponseWriter, r *http.Request) {
	x, err := h.svc.PublicData(r.Context())
	if err != nil {
		response.Error(w, err)
		return
	}
	response.JSON(w, http.StatusOK, x)
}
