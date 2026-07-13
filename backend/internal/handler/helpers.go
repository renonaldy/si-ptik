package handler

import "ptik/pkg/apperror"

func newValidationErr(msg string) error { return apperror.New(apperror.CodeValidation, msg) }
