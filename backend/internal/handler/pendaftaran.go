package handler

import (
	"context"
	"encoding/json"
	"net/http"

	"ptik/internal/domain/pendaftaran"
	"ptik/pkg/response"

	"github.com/go-chi/chi/v5"
)

type PendaftaranService interface {
	List(ctx context.Context, search string) ([]pendaftaran.Pendaftaran, error)
	Get(ctx context.Context, id string) (*pendaftaran.Pendaftaran, error)
	Create(ctx context.Context, in pendaftaran.Input) (*pendaftaran.Pendaftaran, error)
	Update(ctx context.Context, id string, in pendaftaran.Input) (*pendaftaran.Pendaftaran, error)
	Delete(ctx context.Context, id string) error
}

type PendaftaranHandler struct{ svc PendaftaranService }

func NewPendaftaranHandler(svc PendaftaranService) *PendaftaranHandler {
	return &PendaftaranHandler{svc: svc}
}

func (h *PendaftaranHandler) Routes(r chi.Router) {
	r.Get("/", h.List)
	r.Post("/", h.Create)
	r.Get("/{id}", h.Get)
	r.Put("/{id}", h.Update)
	r.Delete("/{id}", h.Delete)
}

func (h *PendaftaranHandler) List(w http.ResponseWriter, r *http.Request) {
	list, err := h.svc.List(r.Context(), r.URL.Query().Get("search"))
	if err != nil {
		response.Error(w, err)
		return
	}
	response.JSON(w, http.StatusOK, list)
}

func (h *PendaftaranHandler) Get(w http.ResponseWriter, r *http.Request) {
	x, err := h.svc.Get(r.Context(), chi.URLParam(r, "id"))
	if err != nil {
		response.Error(w, err)
		return
	}
	response.JSON(w, http.StatusOK, x)
}

func (h *PendaftaranHandler) Create(w http.ResponseWriter, r *http.Request) {
	var in pendaftaran.Input
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

func (h *PendaftaranHandler) Update(w http.ResponseWriter, r *http.Request) {
	var in pendaftaran.Input
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

func (h *PendaftaranHandler) Delete(w http.ResponseWriter, r *http.Request) {
	if err := h.svc.Delete(r.Context(), chi.URLParam(r, "id")); err != nil {
		response.Error(w, err)
		return
	}
	w.WriteHeader(http.StatusNoContent)
}
