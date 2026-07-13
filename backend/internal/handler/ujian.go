package handler

import (
	"context"
	"encoding/json"
	"net/http"

	"ptik/internal/domain/ujian"
	"ptik/pkg/response"

	"github.com/go-chi/chi/v5"
)

type UjianService interface {
	List(ctx context.Context, search string) ([]ujian.Ujian, error)
	Get(ctx context.Context, id string) (*ujian.Ujian, error)
	Create(ctx context.Context, in ujian.Input) (*ujian.Ujian, error)
	Update(ctx context.Context, id string, in ujian.Input) (*ujian.Ujian, error)
	Delete(ctx context.Context, id string) error
}

type UjianHandler struct{ svc UjianService }

func NewUjianHandler(svc UjianService) *UjianHandler { return &UjianHandler{svc: svc} }

func (h *UjianHandler) Routes(r chi.Router) {
	r.Get("/", h.List)
	r.Post("/", h.Create)
	r.Get("/{id}", h.Get)
	r.Put("/{id}", h.Update)
	r.Delete("/{id}", h.Delete)
}

func (h *UjianHandler) List(w http.ResponseWriter, r *http.Request) {
	list, err := h.svc.List(r.Context(), r.URL.Query().Get("search"))
	if err != nil {
		response.Error(w, err)
		return
	}
	response.JSON(w, http.StatusOK, list)
}

func (h *UjianHandler) Get(w http.ResponseWriter, r *http.Request) {
	x, err := h.svc.Get(r.Context(), chi.URLParam(r, "id"))
	if err != nil {
		response.Error(w, err)
		return
	}
	response.JSON(w, http.StatusOK, x)
}

func (h *UjianHandler) Create(w http.ResponseWriter, r *http.Request) {
	var in ujian.Input
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

func (h *UjianHandler) Update(w http.ResponseWriter, r *http.Request) {
	var in ujian.Input
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

func (h *UjianHandler) Delete(w http.ResponseWriter, r *http.Request) {
	if err := h.svc.Delete(r.Context(), chi.URLParam(r, "id")); err != nil {
		response.Error(w, err)
		return
	}
	w.WriteHeader(http.StatusNoContent)
}
