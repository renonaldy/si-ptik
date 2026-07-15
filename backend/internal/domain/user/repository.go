package user

import "context"

type Repository interface {
	GetByID(ctx context.Context, id string) (*User, error)
	GetByEmail(ctx context.Context, email string) (*User, error)
	List(ctx context.Context, search string) ([]User, error)
	Create(ctx context.Context, u *User) error
	Update(ctx context.Context, id, email, fullName, role string) (*User, error)
	UpdatePassword(ctx context.Context, id, passwordHash string) error
	Delete(ctx context.Context, id string) error
}
