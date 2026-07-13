package download

import "context"

type Repository interface {
	List(ctx context.Context, search string) ([]Download, error)
	GetByID(ctx context.Context, id string) (*Download, error)
	Create(ctx context.Context, id string, in Input) (*Download, error)
	Update(ctx context.Context, id string, in Input) (*Download, error)
	Delete(ctx context.Context, id string) error
}
