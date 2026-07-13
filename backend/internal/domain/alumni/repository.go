package alumni

import "context"

type Repository interface {
	List(ctx context.Context, search string) ([]Alumni, error)
	GetByID(ctx context.Context, id string) (*Alumni, error)
	Create(ctx context.Context, id string, in Input) (*Alumni, error)
	Update(ctx context.Context, id string, in Input) (*Alumni, error)
	Delete(ctx context.Context, id string) error
}
