package handler

import (
	"context"
	"encoding/json"
	"net/http"

	"ptik/internal/domain/administrasi"
	"ptik/pkg/response"

	"github.com/go-chi/chi/v5"
)

type AdministrasiService interface {
	List(ctx context.Context, search string) ([]administrasi.Administrasi, error)
	Get(ctx context.Context, id string) (*administrasi.Administrasi, error)
	Create(ctx context.Context, in administrasi.Input) (*administrasi.Administrasi, error)
	Update(ctx context.Context, id string, in administrasi.Input) (*administrasi.Administrasi, error)
	Delete(ctx context.Context, id string) error
}

type AdministrasiHandler struct{ svc AdministrasiService }

func NewAdministrasiHandler(svc AdministrasiService) *AdministrasiHandler {
	return &AdministrasiHandler{svc: svc}
}

func (h *AdministrasiHandler) Routes(r chi.Router) {
	r.Get("/", h.List)
	r.Post("/", h.Create)
	r.Get("/{id}", h.Get)
	r.Put("/{id}", h.Update)
	r.Delete("/{id}", h.Delete)
}

func (h *AdministrasiHandler) List(w http.ResponseWriter, r *http.Request) {
	list, err := h.svc.List(r.Context(), r.URL.Query().Get("search"))
	if err != nil {
		response.Error(w, err)
		return
	}
	response.JSON(w, http.StatusOK, list)
}

func (h *AdministrasiHandler) Get(w http.ResponseWriter, r *http.Request) {
	x, err := h.svc.Get(r.Context(), chi.URLParam(r, "id"))
	if err != nil {
		response.Error(w, err)
		return
	}
	response.JSON(w, http.StatusOK, x)
}

func (h *AdministrasiHandler) Create(w http.ResponseWriter, r *http.Request) {
	var in administrasi.Input
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

func (h *AdministrasiHandler) Update(w http.ResponseWriter, r *http.Request) {
	var in administrasi.Input
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

func (h *AdministrasiHandler) Delete(w http.ResponseWriter, r *http.Request) {
	if err := h.svc.Delete(r.Context(), chi.URLParam(r, "id")); err != nil {
		response.Error(w, err)
		return
	}
	w.WriteHeader(http.StatusNoContent)
}
