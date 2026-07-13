package apperror

import (
	"errors"
	"fmt"
)

const (
	CodeValidation    = "VALIDATION_ERROR"
	CodeUnprocessable = "UNPROCESSABLE_ENTITY"
	CodeNotFound      = "NOT_FOUND"
	CodeUnauthorized  = "UNAUTHORIZED"
	CodeForbidden     = "FORBIDDEN"
	CodeConflict      = "CONFLICT"
	CodeInternal      = "INTERNAL_ERROR"
)

// AppError is the client-safe error. Code+Message are sent to clients; cause is
// logged server-side only (never serialized).
type AppError struct {
	Code    string
	Message string
	cause   error
}

func (e *AppError) Error() string {
	if e.cause != nil {
		return fmt.Sprintf("[%s] %s: %v", e.Code, e.Message, e.cause)
	}
	return fmt.Sprintf("[%s] %s", e.Code, e.Message)
}

func (e *AppError) Unwrap() error { return e.cause }

func New(code, message string) *AppError { return &AppError{Code: code, Message: message} }

func Wrap(code, message string, cause error) *AppError {
	return &AppError{Code: code, Message: message, cause: cause}
}

func Internal(message string, cause error) *AppError {
	return &AppError{Code: CodeInternal, Message: message, cause: cause}
}

func IsCode(err error, code string) bool {
	var e *AppError
	if errors.As(err, &e) {
		return e.Code == code
	}
	return false
}
