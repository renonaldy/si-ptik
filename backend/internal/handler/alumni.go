package handler

import (
	"context"
	"encoding/json"
	"net/http"

	"ptik/internal/domain/alumni"
	"ptik/pkg/response"

	"github.com/go-chi/chi/v5"
)

type AlumniService interface {
	List(ctx context.Context, search string) ([]alumni.Alumni, error)
	Get(ctx context.Context, id string) (*alumni.Alumni, error)
	Create(ctx context.Context, in alumni.Input) (*alumni.Alumni, error)
	Update(ctx context.Context, id string, in alumni.Input) (*alumni.Alumni, error)
	Delete(ctx context.Context, id string) error
}

type AlumniHandler struct{ svc AlumniService }

func NewAlumniHandler(svc AlumniService) *AlumniHandler { return &AlumniHandler{svc: svc} }

func (h *AlumniHandler) Routes(r chi.Router) {
	r.Get("/", h.List)
	r.Post("/", h.Create)
	r.Get("/{id}", h.Get)
	r.Put("/{id}", h.Update)
	r.Delete("/{id}", h.Delete)
}

func (h *AlumniHandler) List(w http.ResponseWriter, r *http.Request) {
	list, err := h.svc.List(r.Context(), r.URL.Query().Get("search"))
	if err != nil {
		response.Error(w, err)
		return
	}
	response.JSON(w, http.StatusOK, list)
}

func (h *AlumniHandler) Get(w http.ResponseWriter, r *http.Request) {
	a, err := h.svc.Get(r.Context(), chi.URLParam(r, "id"))
	if err != nil {
		response.Error(w, err)
		return
	}
	response.JSON(w, http.StatusOK, a)
}

func (h *AlumniHandler) Create(w http.ResponseWriter, r *http.Request) {
	var in alumni.Input
	if err := json.NewDecoder(r.Body).Decode(&in); err != nil {
		response.Error(w, newValidationErr("invalid request body"))
		return
	}
	a, err := h.svc.Create(r.Context(), in)
	if err != nil {
		response.Error(w, err)
		return
	}
	response.JSON(w, http.StatusCreated, a)
}

func (h *AlumniHandler) Update(w http.ResponseWriter, r *http.Request) {
	var in alumni.Input
	if err := json.NewDecoder(r.Body).Decode(&in); err != nil {
		response.Error(w, newValidationErr("invalid request body"))
		return
	}
	a, err := h.svc.Update(r.Context(), chi.URLParam(r, "id"), in)
	if err != nil {
		response.Error(w, err)
		return
	}
	response.JSON(w, http.StatusOK, a)
}

func (h *AlumniHandler) Delete(w http.ResponseWriter, r *http.Request) {
	if err := h.svc.Delete(r.Context(), chi.URLParam(r, "id")); err != nil {
		response.Error(w, err)
		return
	}
	w.WriteHeader(http.StatusNoContent)
}
