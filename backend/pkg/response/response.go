package response

import (
	"encoding/json"
	"errors"
	"log/slog"
	"net/http"

	"ptik/pkg/apperror"
)

// Response is the standard API envelope: { data, error?, meta? }.
type Response[T any] struct {
	Data  T          `json:"data"`
	Error *ErrorBody `json:"error,omitempty"`
	Meta  *Meta      `json:"meta,omitempty"`
}

type ErrorBody struct {
	Code    string `json:"code"`
	Message string `json:"message"`
}

type Meta struct {
	Total  int `json:"total,omitempty"`
	Page   int `json:"page,omitempty"`
	Limit  int `json:"limit,omitempty"`
	Offset int `json:"offset,omitempty"`
}

const genericInternalMessage = "Terjadi kesalahan pada server. Silakan coba lagi nanti."

// JSON writes a success envelope.
func JSON[T any](w http.ResponseWriter, status int, data T) {
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(status)
	json.NewEncoder(w).Encode(Response[T]{Data: data})
}

// WithMeta writes a success envelope that carries pagination meta.
func WithMeta[T any](w http.ResponseWriter, status int, data T, meta Meta) {
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(status)
	json.NewEncoder(w).Encode(Response[T]{Data: data, Meta: &meta})
}

// Error is the single central place that maps an error -> HTTP status + safe body.
func Error(w http.ResponseWriter, err error) {
	w.Header().Set("Content-Type", "application/json")

	var appErr *apperror.AppError
	if errors.As(err, &appErr) {
		status := codeToStatus(appErr.Code)
		if status >= http.StatusInternalServerError {
			slog.Error("request failed", "code", appErr.Code, "message", appErr.Message, "cause", causeOf(appErr))
		}
		w.WriteHeader(status)
		json.NewEncoder(w).Encode(Response[any]{Error: &ErrorBody{Code: appErr.Code, Message: appErr.Message}})
		return
	}

	// Unhandled — never leak internals.
	slog.Error("unhandled error", "err", err.Error())
	w.WriteHeader(http.StatusInternalServerError)
	json.NewEncoder(w).Encode(Response[any]{Error: &ErrorBody{Code: apperror.CodeInternal, Message: genericInternalMessage}})
}

func causeOf(err error) string {
	if u := errors.Unwrap(err); u != nil {
		return u.Error()
	}
	return err.Error()
}

func codeToStatus(code string) int {
	switch code {
	case apperror.CodeValidation:
		return http.StatusBadRequest
	case apperror.CodeUnprocessable:
		return http.StatusUnprocessableEntity
	case apperror.CodeNotFound:
		return http.StatusNotFound
	case apperror.CodeUnauthorized:
		return http.StatusUnauthorized
	case apperror.CodeForbidden:
		return http.StatusForbidden
	case apperror.CodeConflict:
		return http.StatusConflict
	default:
		return http.StatusInternalServerError
	}
}
