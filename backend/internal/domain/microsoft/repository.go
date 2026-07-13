package microsoft

import "context"

type Repository interface {
	List(ctx context.Context, search string) ([]Microsoft, error)
	GetByID(ctx context.Context, id string) (*Microsoft, error)
	Create(ctx context.Context, id string, in Input) (*Microsoft, error)
	Update(ctx context.Context, id string, in Input) (*Microsoft, error)
	Delete(ctx context.Context, id string) error
}
