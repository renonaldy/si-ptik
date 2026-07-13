package sempro

import "context"

type Repository interface {
	List(ctx context.Context, search string) ([]Sempro, error)
	GetByID(ctx context.Context, id string) (*Sempro, error)
	Create(ctx context.Context, id string, in Input) (*Sempro, error)
	Update(ctx context.Context, id string, in Input) (*Sempro, error)
	Delete(ctx context.Context, id string) error
}
