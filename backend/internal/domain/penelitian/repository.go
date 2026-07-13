package penelitian

import "context"

type Repository interface {
	List(ctx context.Context, search string) ([]Penelitian, error)
	GetByID(ctx context.Context, id string) (*Penelitian, error)
	Create(ctx context.Context, id string, in Input) (*Penelitian, error)
	Update(ctx context.Context, id string, in Input) (*Penelitian, error)
	Delete(ctx context.Context, id string) error
}
