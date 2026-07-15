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

// CRUDGuard allows reads for any authenticated user. For writes it lets the
// listed admin roles through unconditionally; any other role is allowed only if
// canWrite(role, menuKey) is true, where menuKey is the first path segment after
// the API prefix (e.g. /api/v1/dosen/123 -> "dosen"). Must run AFTER Authenticate.
func CRUDGuard(adminRoles []string, canWrite func(ctx context.Context, role, menuKey string) (bool, error)) func(http.Handler) http.Handler {
	admin := make(map[string]bool, len(adminRoles))
	for _, r := range adminRoles {
		admin[r] = true
	}
	forbidden := apperror.New(apperror.CodeForbidden, "Anda tidak memiliki akses untuk mengubah data ini")
	return func(next http.Handler) http.Handler {
		return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
			switch r.Method {
			case http.MethodPost, http.MethodPut, http.MethodPatch, http.MethodDelete:
				role := RoleFromContext(r.Context())
				if !admin[role] {
					ok, err := canWrite(r.Context(), role, menuKeyFromPath(r.URL.Path))
					if err != nil {
						response.Error(w, err)
						return
					}
					if !ok {
						response.Error(w, forbidden)
						return
					}
				}
			}
			next.ServeHTTP(w, r)
		})
	}
}

// menuKeyFromPath extracts the domain segment from an API path:
// "/api/v1/skripsi-alumni/x" -> "skripsi-alumni".
func menuKeyFromPath(path string) string {
	p := strings.TrimPrefix(path, "/api/v1/")
	if i := strings.IndexByte(p, '/'); i >= 0 {
		p = p[:i]
	}
	return p
}

// RequireRole restricts EVERY method (including reads) to the given roles. Use
// it for endpoints that must be fully hidden from lower roles — e.g. the user
// management API. Must run AFTER Authenticate.
func RequireRole(allowedRoles ...string) func(http.Handler) http.Handler {
	allowed := make(map[string]bool, len(allowedRoles))
	for _, r := range allowedRoles {
		allowed[r] = true
	}
	return func(next http.Handler) http.Handler {
		return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
			if !allowed[RoleFromContext(r.Context())] {
				response.Error(w, apperror.New(apperror.CodeForbidden, "Anda tidak memiliki akses ke halaman ini"))
				return
			}
			next.ServeHTTP(w, r)
		})
	}
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
