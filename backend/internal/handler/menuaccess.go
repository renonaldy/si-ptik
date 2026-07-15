package handler

import (
	"context"
	"encoding/json"
	"net/http"

	"ptik/internal/domain/menuaccess"
	"ptik/internal/domain/user"
	mw "ptik/internal/handler/middleware"
	"ptik/pkg/apperror"
	"ptik/pkg/response"

	"github.com/go-chi/chi/v5"
)

type MenuAccessService interface {
	List(ctx context.Context) ([]menuaccess.UserMenu, error)
	Get(ctx context.Context, userID string) (*menuaccess.UserMenu, error)
	SetMany(ctx context.Context, items []menuaccess.Item) error
}

type MenuAccessHandler struct{ svc MenuAccessService }

func NewMenuAccessHandler(svc MenuAccessService) *MenuAccessHandler {
	return &MenuAccessHandler{svc: svc}
}

// Routes: GET /me is readable by any authenticated user (a dosen/mahasiswa needs
// its own config to render the sidebar); the full list + PUT are admin-only so
// lower roles can't read or change other accounts' access.
func (h *MenuAccessHandler) Routes(r chi.Router) {
	r.Get("/me", h.Mine)

	r.Group(func(r chi.Router) {
		r.Use(mw.RequireRole(user.RoleSuperAdmin, user.RoleAdmin))
		r.Get("/", h.List)
		r.Put("/", h.Save)
	})
}

// Mine returns the current account's menu config (empty default if none stored).
func (h *MenuAccessHandler) Mine(w http.ResponseWriter, r *http.Request) {
	userID := mw.UserIDFromContext(r.Context())
	if userID == "" {
		response.Error(w, apperror.New(apperror.CodeUnauthorized, "not authenticated"))
		return
	}
	um, err := h.svc.Get(r.Context(), userID)
	if err != nil {
		response.Error(w, err)
		return
	}
	if um == nil {
		um = &menuaccess.UserMenu{UserID: userID, MenuKeys: []string{}, WriteKeys: []string{}}
	}
	response.JSON(w, http.StatusOK, um)
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
