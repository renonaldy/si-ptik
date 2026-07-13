package handler

import (
	"context"
	"encoding/json"
	"net/http"

	"ptik/internal/domain/galeri"
	"ptik/pkg/response"

	"github.com/go-chi/chi/v5"
)

type GaleriService interface {
	List(ctx context.Context, search string) ([]galeri.Galeri, error)
	Get(ctx context.Context, id string) (*galeri.Galeri, error)
	Create(ctx context.Context, in galeri.Input) (*galeri.Galeri, error)
	Update(ctx context.Context, id string, in galeri.Input) (*galeri.Galeri, error)
	Delete(ctx context.Context, id string) error
}

type GaleriHandler struct{ svc GaleriService }

func NewGaleriHandler(svc GaleriService) *GaleriHandler { return &GaleriHandler{svc: svc} }

func (h *GaleriHandler) Routes(r chi.Router) {
	r.Get("/", h.List)
	r.Post("/", h.Create)
	r.Get("/{id}", h.Get)
	r.Put("/{id}", h.Update)
	r.Delete("/{id}", h.Delete)
}

func (h *GaleriHandler) List(w http.ResponseWriter, r *http.Request) {
	list, err := h.svc.List(r.Context(), r.URL.Query().Get("search"))
	if err != nil {
		response.Error(w, err)
		return
	}
	response.JSON(w, http.StatusOK, list)
}

func (h *GaleriHandler) Get(w http.ResponseWriter, r *http.Request) {
	x, err := h.svc.Get(r.Context(), chi.URLParam(r, "id"))
	if err != nil {
		response.Error(w, err)
		return
	}
	response.JSON(w, http.StatusOK, x)
}

func (h *GaleriHandler) Create(w http.ResponseWriter, r *http.Request) {
	var in galeri.Input
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

func (h *GaleriHandler) Update(w http.ResponseWriter, r *http.Request) {
	var in galeri.Input
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

func (h *GaleriHandler) Delete(w http.ResponseWriter, r *http.Request) {
	if err := h.svc.Delete(r.Context(), chi.URLParam(r, "id")); err != nil {
		response.Error(w, err)
		return
	}
	w.WriteHeader(http.StatusNoContent)
}
