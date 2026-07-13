package middleware

import (
	"log/slog"
	"net/http"

	"ptik/pkg/apperror"
	"ptik/pkg/response"
)

func Recover(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		defer func() {
			if err := recover(); err != nil {
				slog.Error("panic recovered", "err", err, "path", r.URL.Path,
					"request_id", RequestIDFromContext(r.Context()))
				response.Error(w, apperror.New(apperror.CodeInternal, "an unexpected error occurred"))
			}
		}()
		next.ServeHTTP(w, r)
	})
}
