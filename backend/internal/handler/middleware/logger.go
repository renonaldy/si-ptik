package middleware

import (
	"bufio"
	"context"
	"log/slog"
	"net"
	"net/http"
	"time"

	"github.com/google/uuid"
)

type contextKeyRequestID string

const ctxRequestID contextKeyRequestID = "request_id"

func RequestID(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		id := r.Header.Get("X-Request-ID")
		if id == "" {
			id = uuid.New().String()
		}
		ctx := context.WithValue(r.Context(), ctxRequestID, id)
		w.Header().Set("X-Request-ID", id)
		next.ServeHTTP(w, r.WithContext(ctx))
	})
}

func RequestIDFromContext(ctx context.Context) string {
	v, _ := ctx.Value(ctxRequestID).(string)
	return v
}

// LogAttrs is a per-request holder downstream middleware writes user info into,
// so the single "request" log line at the end includes it.
type LogAttrs struct{ UserID string }

type contextKeyLogAttrs string

const ctxLogAttrs contextKeyLogAttrs = "log_attrs"

func Logger(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		start := time.Now()
		attrs := &LogAttrs{}
		ctx := context.WithValue(r.Context(), ctxLogAttrs, attrs)
		rw := &responseWriter{ResponseWriter: w, status: http.StatusOK}
		next.ServeHTTP(rw, r.WithContext(ctx))

		fields := []any{
			"method", r.Method,
			"path", r.URL.Path,
			"status", rw.status,
			"duration_ms", time.Since(start).Milliseconds(),
			"request_id", RequestIDFromContext(r.Context()),
		}
		if attrs.UserID != "" {
			fields = append(fields, "user_id", attrs.UserID)
		}
		slog.Info("request", fields...)
	})
}

func SetLogUserID(ctx context.Context, userID string) {
	if a, ok := ctx.Value(ctxLogAttrs).(*LogAttrs); ok && a != nil {
		a.UserID = userID
	}
}

type responseWriter struct {
	http.ResponseWriter
	status int
}

func (rw *responseWriter) WriteHeader(code int) {
	rw.status = code
	rw.ResponseWriter.WriteHeader(code)
}

// Hijack so WebSocket upgrades work through the logging wrapper.
func (rw *responseWriter) Hijack() (net.Conn, *bufio.ReadWriter, error) {
	return rw.ResponseWriter.(http.Hijacker).Hijack()
}
