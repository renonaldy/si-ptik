package handler

import (
	"context"
	"encoding/json"
	"net/http"

	"ptik/internal/domain/download"
	"ptik/pkg/response"

	"github.com/go-chi/chi/v5"
)

type DownloadService interface {
	List(ctx context.Context, search string) ([]download.Download, error)
	Get(ctx context.Context, id string) (*download.Download, error)
	Create(ctx context.Context, in download.Input) (*download.Download, error)
	Update(ctx context.Context, id string, in download.Input) (*download.Download, error)
	Delete(ctx context.Context, id string) error
}

type DownloadHandler struct{ svc DownloadService }

func NewDownloadHandler(svc DownloadService) *DownloadHandler { return &DownloadHandler{svc: svc} }

func (h *DownloadHandler) Routes(r chi.Router) {
	r.Get("/", h.List)
	r.Post("/", h.Create)
	r.Get("/{id}", h.Get)
	r.Put("/{id}", h.Update)
	r.Delete("/{id}", h.Delete)
}

func (h *DownloadHandler) List(w http.ResponseWriter, r *http.Request) {
	list, err := h.svc.List(r.Context(), r.URL.Query().Get("search"))
	if err != nil {
		response.Error(w, err)
		return
	}
	response.JSON(w, http.StatusOK, list)
}

func (h *DownloadHandler) Get(w http.ResponseWriter, r *http.Request) {
	x, err := h.svc.Get(r.Context(), chi.URLParam(r, "id"))
	if err != nil {
		response.Error(w, err)
		return
	}
	response.JSON(w, http.StatusOK, x)
}

func (h *DownloadHandler) Create(w http.ResponseWriter, r *http.Request) {
	var in download.Input
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

func (h *DownloadHandler) Update(w http.ResponseWriter, r *http.Request) {
	var in download.Input
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

func (h *DownloadHandler) Delete(w http.ResponseWriter, r *http.Request) {
	if err := h.svc.Delete(r.Context(), chi.URLParam(r, "id")); err != nil {
		response.Error(w, err)
		return
	}
	w.WriteHeader(http.StatusNoContent)
}
