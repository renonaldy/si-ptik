package handler

import (
	"context"
	"encoding/json"
	"net/http"

	"ptik/internal/domain/menuaccess"
	"ptik/pkg/response"

	"github.com/go-chi/chi/v5"
)

type MenuAccessService interface {
	List(ctx context.Context) ([]menuaccess.RoleMenu, error)
	SetMany(ctx context.Context, items []menuaccess.Item) error
}

type MenuAccessHandler struct{ svc MenuAccessService }

func NewMenuAccessHandler(svc MenuAccessService) *MenuAccessHandler {
	return &MenuAccessHandler{svc: svc}
}

// Routes: GET readable by any authenticated user (a dosen/mahasiswa needs its own
// config to render the sidebar); PUT is gated by WriteGuard to admin roles.
func (h *MenuAccessHandler) Routes(r chi.Router) {
	r.Get("/", h.List)
	r.Put("/", h.Save)
}

func (h *MenuAccessHandler) List(w http.ResponseWriter, r *http.Request) {
	list, err := h.svc.List(r.Context())
	if err != nil {
		response.Error(w, err)
		return
	}
	response.JSON(w, http.StatusOK, list)
}

func (h *MenuAccessHandler) Save(w http.ResponseWriter, r *http.Request) {
	var body struct {
		Items []menuaccess.Item `json:"items"`
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
