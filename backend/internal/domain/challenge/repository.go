package challenge

import "context"

type Repository interface {
	List(ctx context.Context, search, status string) ([]Challenge, error)
	GetByID(ctx context.Context, id string) (*Challenge, error)
	Create(ctx context.Context, id string, in Input) (*Challenge, error)
	Update(ctx context.Context, id string, in Input) (*Challenge, error)
	Delete(ctx context.Context, id string) error
}
