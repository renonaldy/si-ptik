package handler

import (
	"context"
	"encoding/json"
	"net/http"

	"ptik/internal/domain/content"
	"ptik/pkg/response"

	"github.com/go-chi/chi/v5"
)

type ContentService interface {
	List(ctx context.Context) ([]content.SiteContent, error)
	SetMany(ctx context.Context, items []content.Item) error
}

type ContentHandler struct{ svc ContentService }

func NewContentHandler(svc ContentService) *ContentHandler { return &ContentHandler{svc: svc} }

func (h *ContentHandler) Routes(r chi.Router) {
	r.Get("/", h.List)
	r.Put("/", h.Save)
}

func (h *ContentHandler) List(w http.ResponseWriter, r *http.Request) {
	list, err := h.svc.List(r.Context())
	if err != nil {
		response.Error(w, err)
		return
	}
	response.JSON(w, http.StatusOK, list)
}

func (h *ContentHandler) Save(w http.ResponseWriter, r *http.Request) {
	var body struct {
		Items []content.Item `json:"items"`
	}
	if err := json.NewDecoder(r.Body).Decode(&body); err != nil {
		response.Error(w, newValidationErr("invalid request body"))
		return
	}
	if err := h.svc.SetMany(r.Context(), body.Items); err != nil {
		response.Error(w, err)
		return
	}
	list, err := h.svc.List(r.Context())
	if err != nil {
		response.Error(w, err)
		return
	}
	response.JSON(w, http.StatusOK, list)
}
