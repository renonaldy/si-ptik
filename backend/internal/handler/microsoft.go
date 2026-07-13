package handler

import (
	"context"
	"encoding/json"
	"net/http"

	"ptik/internal/domain/microsoft"
	"ptik/pkg/response"

	"github.com/go-chi/chi/v5"
)

type MicrosoftService interface {
	List(ctx context.Context, search string) ([]microsoft.Microsoft, error)
	Get(ctx context.Context, id string) (*microsoft.Microsoft, error)
	Create(ctx context.Context, in microsoft.Input) (*microsoft.Microsoft, error)
	Update(ctx context.Context, id string, in microsoft.Input) (*microsoft.Microsoft, error)
	Delete(ctx context.Context, id string) error
}

type MicrosoftHandler struct{ svc MicrosoftService }

func NewMicrosoftHandler(svc MicrosoftService) *MicrosoftHandler { return &MicrosoftHandler{svc: svc} }

func (h *MicrosoftHandler) Routes(r chi.Router) {
	r.Get("/", h.List)
	r.Post("/", h.Create)
	r.Get("/{id}", h.Get)
	r.Put("/{id}", h.Update)
	r.Delete("/{id}", h.Delete)
}

func (h *MicrosoftHandler) List(w http.ResponseWriter, r *http.Request) {
	list, err := h.svc.List(r.Context(), r.URL.Query().Get("search"))
	if err != nil {
		response.Error(w, err)
		return
	}
	response.JSON(w, http.StatusOK, list)
}

func (h *MicrosoftHandler) Get(w http.ResponseWriter, r *http.Request) {
	x, err := h.svc.Get(r.Context(), chi.URLParam(r, "id"))
	if err != nil {
		response.Error(w, err)
		return
	}
	response.JSON(w, http.StatusOK, x)
}

func (h *MicrosoftHandler) Create(w http.ResponseWriter, r *http.Request) {
	var in microsoft.Input
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

func (h *MicrosoftHandler) Update(w http.ResponseWriter, r *http.Request) {
	var in microsoft.Input
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

func (h *MicrosoftHandler) Delete(w http.ResponseWriter, r *http.Request) {
	if err := h.svc.Delete(r.Context(), chi.URLParam(r, "id")); err != nil {
		response.Error(w, err)
		return
	}
	w.WriteHeader(http.StatusNoContent)
}
