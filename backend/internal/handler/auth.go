package handler

import (
	"context"
	"encoding/json"
	"net/http"

	"ptik/internal/domain/auth"
	"ptik/pkg/response"

	"github.com/go-chi/chi/v5"
)

// AuthService is the behaviour the handler needs (interface for mockability).
type AuthService interface {
	Login(ctx context.Context, email, password string) (*auth.TokenPair, error)
	Refresh(ctx context.Context, refreshToken string) (*auth.TokenPair, error)
	Logout(ctx context.Context, refreshToken string) error
}

type AuthHandler struct{ svc AuthService }

func NewAuthHandler(svc AuthService) *AuthHandler { return &AuthHandler{svc: svc} }

// Routes is mounted from main.go via r.Route("/auth", authHandler.Routes).
func (h *AuthHandler) Routes(r chi.Router) {
	r.Post("/login", h.Login)
	r.Post("/refresh", h.Refresh)
	r.Post("/logout", h.Logout)
}

func (h *AuthHandler) Login(w http.ResponseWriter, r *http.Request) {
	var body struct {
		Email    string `json:"email"`
		Password string `json:"password"`
	}
	if err := json.NewDecoder(r.Body).Decode(&body); err != nil {
		response.Error(w, newValidationErr("invalid request body"))
		return
	}
	pair, err := h.svc.Login(r.Context(), body.Email, body.Password)
	if err != nil {
		response.Error(w, err)
		return
	}
	response.JSON(w, http.StatusOK, pair)
}

func (h *AuthHandler) Refresh(w http.ResponseWriter, r *http.Request) {
	var body struct {
		RefreshToken string `json:"refresh_token"`
	}
	if err := json.NewDecoder(r.Body).Decode(&body); err != nil {
		response.Error(w, newValidationErr("invalid request body"))
		return
	}
	pair, err := h.svc.Refresh(r.Context(), body.RefreshToken)
	if err != nil {
		response.Error(w, err)
		return
	}
	response.JSON(w, http.StatusOK, pair)
}

func (h *AuthHandler) Logout(w http.ResponseWriter, r *http.Request) {
	var body struct {
		RefreshToken string `json:"refresh_token"`
	}
	_ = json.NewDecoder(r.Body).Decode(&body)
	if err := h.svc.Logout(r.Context(), body.RefreshToken); err != nil {
		response.Error(w, err)
		return
	}
	w.WriteHeader(http.StatusNoContent)
}
