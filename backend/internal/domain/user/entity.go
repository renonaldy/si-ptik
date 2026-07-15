package user

import "time"

// User is an account that can sign in to the admin panel.
type User struct {
	ID           string    `json:"id"`
	Email        string    `json:"email"`
	PasswordHash string    `json:"-"` // never serialized
	FullName     string    `json:"full_name"`
	Role         string    `json:"role"`
	CreatedAt    time.Time `json:"created_at"`
	UpdatedAt    time.Time `json:"updated_at"`
}

// CreateInput carries the writable fields when creating an account.
type CreateInput struct {
	Email    string `json:"email"`
	Password string `json:"password"`
	FullName string `json:"full_name"`
	Role     string `json:"role"`
}

// UpdateInput carries the editable fields for an existing account (password is
// changed through a dedicated reset endpoint, never here).
type UpdateInput struct {
	FullName string `json:"full_name"`
	Role     string `json:"role"`
}
