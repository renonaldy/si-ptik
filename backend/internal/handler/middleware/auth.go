package middleware

import (
	"context"
	"net/http"
	"strings"

	"ptik/pkg/apperror"
	"ptik/pkg/jwtutil"
	"ptik/pkg/response"
)

type contextKey string

const (
	ctxUserID contextKey = "user_id"
	ctxRole   contextKey = "role"
)

type AuthMiddleware struct{ jwt *jwtutil.JWT }

func NewAuthMiddleware(jwt *jwtutil.JWT) *AuthMiddleware { return &AuthMiddleware{jwt: jwt} }

// Authenticate validates the Bearer access token and injects user id + role into ctx.
func (m *AuthMiddleware) Authenticate(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		token := extractBearer(r)
		if token == "" {
			response.Error(w, apperror.New(apperror.CodeUnauthorized, "missing authorization header"))
			return
		}
		claims, err := m.jwt.Validate(token)
		if err != nil {
			response.Error(w, err)
			return
		}
		ctx := context.WithValue(r.Context(), ctxUserID, claims.UserID)
		ctx = context.WithValue(ctx, ctxRole, claims.Role)
		SetLogUserID(ctx, claims.UserID)
		next.ServeHTTP(w, r.WithContext(ctx))
	})
}

func UserIDFromContext(ctx context.Context) string {
	v, _ := ctx.Value(ctxUserID).(string)
	return v
}

func RoleFromContext(ctx context.Context) string {
	v, _ := ctx.Value(ctxRole).(string)
	return v
}

// WriteGuard allows GET/HEAD/OPTIONS for any authenticated user, but restricts
// mutating methods (POST/PUT/PATCH/DELETE) to the given roles. Must run AFTER Authenticate.
func WriteGuard(allowedRoles ...string) func(http.Handler) http.Handler {
	allowed := make(map[string]bool, len(allowedRoles))
	for _, r := range allowedRoles {
		allowed[r] = true
	}
	return func(next http.Handler) http.Handler {
		return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
			switch r.Method {
			case http.MethodPost, http.MethodPut, http.MethodPatch, http.MethodDelete:
				if !allowed[RoleFromContext(r.Context())] {
					response.Error(w, apperror.New(apperror.CodeForbidden, "Anda tidak memiliki akses untuk mengubah data"))
					return
				}
			}
			next.ServeHTTP(w, r)
		})
	}
}

func extractBearer(r *http.Request) string {
	h := r.Header.Get("Authorization")
	if strings.HasPrefix(h, "Bearer ") {
		return strings.TrimPrefix(h, "Bearer ")
	}
	if t := r.URL.Query().Get("token"); t != "" { // WebSocket clients can't set headers
		return t
	}
	return ""
}
