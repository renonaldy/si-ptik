package handler

import (
	"context"
	"net/http"

	"ptik/internal/domain/user"
	mw "ptik/internal/handler/middleware"
	"ptik/pkg/apperror"
	"ptik/pkg/response"

	"github.com/go-chi/chi/v5"
)

type UserService interface {
	GetByID(ctx context.Context, id string) (*user.User, error)
}

type UserHandler struct{ svc UserService }

func NewUserHandler(svc UserService) *UserHandler { return &UserHandler{svc: svc} }

func (h *UserHandler) Routes(r chi.Router) {
	r.Get("/me", h.Me)
}

// Me returns the currently authenticated user (frontend useMe / auth guard).
func (h *UserHandler) Me(w http.ResponseWriter, r *http.Request) {
	userID := mw.UserIDFromContext(r.Context())
	if userID == "" {
		response.Error(w, apperror.New(apperror.CodeUnauthorized, "not authenticated"))
		return
	}
	u, err := h.svc.GetByID(r.Context(), userID)
	if err != nil {
		response.Error(w, err)
		return
	}
	response.JSON(w, http.StatusOK, u)
}
