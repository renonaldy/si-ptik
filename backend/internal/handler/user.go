package handler

import (
	"context"
	"encoding/json"
	"net/http"

	"ptik/internal/domain/user"
	mw "ptik/internal/handler/middleware"
	"ptik/pkg/apperror"
	"ptik/pkg/response"

	"github.com/go-chi/chi/v5"
)

type UserService interface {
	GetByID(ctx context.Context, id string) (*user.User, error)
	List(ctx context.Context, search string) ([]user.User, error)
	Create(ctx context.Context, actorRole string, in user.CreateInput) (*user.User, error)
	Update(ctx context.Context, actorRole, id string, in user.UpdateInput) (*user.User, error)
	ResetPassword(ctx context.Context, actorRole, id, password string) error
	Delete(ctx context.Context, actorRole, actorID, id string) error
}

type UserHandler struct{ svc UserService }

func NewUserHandler(svc UserService) *UserHandler { return &UserHandler{svc: svc} }

func (h *UserHandler) Routes(r chi.Router) {
	r.Get("/me", h.Me) // any authenticated user

	// Account management — fully hidden from dosen/mahasiswa (all methods).
	r.Group(func(r chi.Router) {
		r.Use(mw.RequireRole(user.RoleSuperAdmin, user.RoleAdmin))
		r.Get("/", h.List)
		r.Post("/", h.Create)
		r.Put("/{id}", h.Update)
		r.Put("/{id}/password", h.ResetPassword)
		r.Delete("/{id}", h.Delete)
	})
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

func (h *UserHandler) List(w http.ResponseWriter, r *http.Request) {
	list, err := h.svc.List(r.Context(), r.URL.Query().Get("search"))
	if err != nil {
		response.Error(w, err)
		return
	}
	response.JSON(w, http.StatusOK, list)
}

func (h *UserHandler) Create(w http.ResponseWriter, r *http.Request) {
	var in user.CreateInput
	if err := json.NewDecoder(r.Body).Decode(&in); err != nil {
		response.Error(w, newValidationErr("invalid request body"))
		return
	}
	u, err := h.svc.Create(r.Context(), mw.RoleFromContext(r.Context()), in)
	if err != nil {
		response.Error(w, err)
		return
	}
	response.JSON(w, http.StatusCreated, u)
}

func (h *UserHandler) Update(w http.ResponseWriter, r *http.Request) {
	var in user.UpdateInput
	if err := json.NewDecoder(r.Body).Decode(&in); err != nil {
		response.Error(w, newValidationErr("invalid request body"))
		return
	}
	u, err := h.svc.Update(r.Context(), mw.RoleFromContext(r.Context()), chi.URLParam(r, "id"), in)
	if err != nil {
		response.Error(w, err)
		return
	}
	response.JSON(w, http.StatusOK, u)
}

func (h *UserHandler) ResetPassword(w http.ResponseWriter, r *http.Request) {
	var body struct {
		Password string `json:"password"`
	}
	if err := json.NewDecoder(r.Body).Decode(&body); err != nil {
		response.Error(w, newValidationErr("invalid request body"))
		return
	}
	if err := h.svc.ResetPassword(r.Context(), mw.RoleFromContext(r.Context()), chi.URLParam(r, "id"), body.Password); err != nil {
		response.Error(w, err)
		return
	}
	w.WriteHeader(http.StatusNoContent)
}

func (h *UserHandler) Delete(w http.ResponseWriter, r *http.Request) {
	actorRole := mw.RoleFromContext(r.Context())
	actorID := mw.UserIDFromContext(r.Context())
	if err := h.svc.Delete(r.Context(), actorRole, actorID, chi.URLParam(r, "id")); err != nil {
		response.Error(w, err)
		return
	}
	w.WriteHeader(http.StatusNoContent)
}
