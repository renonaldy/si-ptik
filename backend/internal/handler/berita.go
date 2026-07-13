package handler

import (
	"context"
	"encoding/json"
	"net/http"

	"ptik/internal/domain/berita"
	"ptik/pkg/response"

	"github.com/go-chi/chi/v5"
)

type BeritaService interface {
	List(ctx context.Context, search string) ([]berita.Berita, error)
	Get(ctx context.Context, id string) (*berita.Berita, error)
	Create(ctx context.Context, in berita.Input) (*berita.Berita, error)
	Update(ctx context.Context, id string, in berita.Input) (*berita.Berita, error)
	Delete(ctx context.Context, id string) error
}

type BeritaHandler struct{ svc BeritaService }

func NewBeritaHandler(svc BeritaService) *BeritaHandler { return &BeritaHandler{svc: svc} }

func (h *BeritaHandler) Routes(r chi.Router) {
	r.Get("/", h.List)
	r.Post("/", h.Create)
	r.Get("/{id}", h.Get)
	r.Put("/{id}", h.Update)
	r.Delete("/{id}", h.Delete)
}

func (h *BeritaHandler) List(w http.ResponseWriter, r *http.Request) {
	list, err := h.svc.List(r.Context(), r.URL.Query().Get("search"))
	if err != nil {
		response.Error(w, err)
		return
	}
	response.JSON(w, http.StatusOK, list)
}

func (h *BeritaHandler) Get(w http.ResponseWriter, r *http.Request) {
	x, err := h.svc.Get(r.Context(), chi.URLParam(r, "id"))
	if err != nil {
		response.Error(w, err)
		return
	}
	response.JSON(w, http.StatusOK, x)
}

func (h *BeritaHandler) Create(w http.ResponseWriter, r *http.Request) {
	var in berita.Input
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

func (h *BeritaHandler) Update(w http.ResponseWriter, r *http.Request) {
	var in berita.Input
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

func (h *BeritaHandler) Delete(w http.ResponseWriter, r *http.Request) {
	if err := h.svc.Delete(r.Context(), chi.URLParam(r, "id")); err != nil {
		response.Error(w, err)
		return
	}
	w.WriteHeader(http.StatusNoContent)
}
