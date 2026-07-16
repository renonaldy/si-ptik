package handler

import (
	"context"
	"encoding/json"
	"net/http"

	"ptik/internal/domain/promosi"
	"ptik/pkg/response"

	"github.com/go-chi/chi/v5"
)

type PromosiService interface {
	List(ctx context.Context, search, tipe string) ([]promosi.Promosi, error)
	Get(ctx context.Context, id string) (*promosi.Promosi, error)
	Create(ctx context.Context, in promosi.Input) (*promosi.Promosi, error)
	Update(ctx context.Context, id string, in promosi.Input) (*promosi.Promosi, error)
	Delete(ctx context.Context, id string) error
}

type PromosiHandler struct{ svc PromosiService }

func NewPromosiHandler(svc PromosiService) *PromosiHandler { return &PromosiHandler{svc: svc} }

func (h *PromosiHandler) Routes(r chi.Router) {
	r.Get("/", h.List)
	r.Post("/", h.Create)
	r.Get("/{id}", h.Get)
	r.Put("/{id}", h.Update)
	r.Delete("/{id}", h.Delete)
}

func (h *PromosiHandler) List(w http.ResponseWriter, r *http.Request) {
	q := r.URL.Query()
	list, err := h.svc.List(r.Context(), q.Get("search"), q.Get("tipe"))
	if err != nil {
		response.Error(w, err)
		return
	}
	response.JSON(w, http.StatusOK, list)
}

func (h *PromosiHandler) Get(w http.ResponseWriter, r *http.Request) {
	x, err := h.svc.Get(r.Context(), chi.URLParam(r, "id"))
	if err != nil {
		response.Error(w, err)
		return
	}
	response.JSON(w, http.StatusOK, x)
}

func (h *PromosiHandler) Create(w http.ResponseWriter, r *http.Request) {
	var in promosi.Input
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

func (h *PromosiHandler) Update(w http.ResponseWriter, r *http.Request) {
	var in promosi.Input
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

func (h *PromosiHandler) Delete(w http.ResponseWriter, r *http.Request) {
	if err := h.svc.Delete(r.Context(), chi.URLParam(r, "id")); err != nil {
		response.Error(w, err)
		return
	}
	w.WriteHeader(http.StatusNoContent)
}
