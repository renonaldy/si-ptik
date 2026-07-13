package handler

import (
	"context"
	"encoding/json"
	"net/http"

	"ptik/internal/domain/skripsialumni"
	"ptik/pkg/response"

	"github.com/go-chi/chi/v5"
)

type SkripsiAlumniService interface {
	List(ctx context.Context, search string) ([]skripsialumni.SkripsiAlumni, error)
	Get(ctx context.Context, id string) (*skripsialumni.SkripsiAlumni, error)
	Create(ctx context.Context, in skripsialumni.Input) (*skripsialumni.SkripsiAlumni, error)
	Update(ctx context.Context, id string, in skripsialumni.Input) (*skripsialumni.SkripsiAlumni, error)
	Delete(ctx context.Context, id string) error
}

type SkripsiAlumniHandler struct{ svc SkripsiAlumniService }

func NewSkripsiAlumniHandler(svc SkripsiAlumniService) *SkripsiAlumniHandler {
	return &SkripsiAlumniHandler{svc: svc}
}

func (h *SkripsiAlumniHandler) Routes(r chi.Router) {
	r.Get("/", h.List)
	r.Post("/", h.Create)
	r.Get("/{id}", h.Get)
	r.Put("/{id}", h.Update)
	r.Delete("/{id}", h.Delete)
}

func (h *SkripsiAlumniHandler) List(w http.ResponseWriter, r *http.Request) {
	list, err := h.svc.List(r.Context(), r.URL.Query().Get("search"))
	if err != nil {
		response.Error(w, err)
		return
	}
	response.JSON(w, http.StatusOK, list)
}

func (h *SkripsiAlumniHandler) Get(w http.ResponseWriter, r *http.Request) {
	x, err := h.svc.Get(r.Context(), chi.URLParam(r, "id"))
	if err != nil {
		response.Error(w, err)
		return
	}
	response.JSON(w, http.StatusOK, x)
}

func (h *SkripsiAlumniHandler) Create(w http.ResponseWriter, r *http.Request) {
	var in skripsialumni.Input
	if err := json.NewDecoder(r.Body).Decode(&in); err != nil {
		response.Error(w, newValidationErr("invalid request body"))
		return
	}
	x, err := h.svc.Create(r.Context(), in)
	if err != nil {
		response.Error(w, err)
		return
	}
	response.JSON(w, http.StatusCreated, x)
}

func (h *SkripsiAlumniHandler) Update(w http.ResponseWriter, r *http.Request) {
	var in skripsialumni.Input
	if err := json.NewDecoder(r.Body).Decode(&in); err != nil {
		response.Error(w, newValidationErr("invalid request body"))
		return
	}
	x, err := h.svc.Update(r.Context(), chi.URLParam(r, "id"), in)
	if err != nil {
		response.Error(w, err)
		return
	}
	response.JSON(w, http.StatusOK, x)
}

func (h *SkripsiAlumniHandler) Delete(w http.ResponseWriter, r *http.Request) {
	if err := h.svc.Delete(r.Context(), chi.URLParam(r, "id")); err != nil {
		response.Error(w, err)
		return
	}
	w.WriteHeader(http.StatusNoContent)
}
