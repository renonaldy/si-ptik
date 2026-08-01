package handler

import (
	"context"
	"encoding/json"
	"net/http"

	"ptik/internal/domain/navmenu"
	"ptik/pkg/response"

	"github.com/go-chi/chi/v5"
)

type NavMenuService interface {
	List(ctx context.Context) ([]navmenu.NavItem, error)
	Get(ctx context.Context, id string) (*navmenu.NavItem, error)
	Create(ctx context.Context, in navmenu.Input) (*navmenu.NavItem, error)
	Update(ctx context.Context, id string, in navmenu.Input) (*navmenu.NavItem, error)
	Delete(ctx context.Context, id string) error
	Reorder(ctx context.Context, ids []string) error
}

type NavMenuHandler struct{ svc NavMenuService }

func NewNavMenuHandler(svc NavMenuService) *NavMenuHandler { return &NavMenuHandler{svc: svc} }

func (h *NavMenuHandler) Routes(r chi.Router) {
	r.Get("/", h.List)
	r.Post("/", h.Create)
	r.Put("/reorder", h.Reorder)
	r.Get("/{id}", h.Get)
	r.Put("/{id}", h.Update)
	r.Delete("/{id}", h.Delete)
}

func (h *NavMenuHandler) List(w http.ResponseWriter, r *http.Request) {
	list, err := h.svc.List(r.Context())
	if err != nil {
		response.Error(w, err)
		return
	}
	response.JSON(w, http.StatusOK, list)
}

func (h *NavMenuHandler) Get(w http.ResponseWriter, r *http.Request) {
	x, err := h.svc.Get(r.Context(), chi.URLParam(r, "id"))
	if err != nil {
		response.Error(w, err)
		return
	}
	response.JSON(w, http.StatusOK, x)
}

func (h *NavMenuHandler) Create(w http.ResponseWriter, r *http.Request) {
	var in navmenu.Input
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

func (h *NavMenuHandler) Update(w http.ResponseWriter, r *http.Request) {
	var in navmenu.Input
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

func (h *NavMenuHandler) Delete(w http.ResponseWriter, r *http.Request) {
	if err := h.svc.Delete(r.Context(), chi.URLParam(r, "id")); err != nil {
		response.Error(w, err)
		return
	}
	w.WriteHeader(http.StatusNoContent)
}

func (h *NavMenuHandler) Reorder(w http.ResponseWriter, r *http.Request) {
	var body struct {
		IDs []string `json:"ids"`
	}
	if err := json.NewDecoder(r.Body).Decode(&body); err != nil {
		response.Error(w, newValidationErr("invalid request body"))
		return
	}
	if err := h.svc.Reorder(r.Context(), body.IDs); err != nil {
		response.Error(w, err)
		return
	}
	w.WriteHeader(http.StatusNoContent)
}
