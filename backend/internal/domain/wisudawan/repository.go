package wisudawan

import "context"

type Repository interface {
	List(ctx context.Context, search string) ([]Wisudawan, error)
	GetByID(ctx context.Context, id string) (*Wisudawan, error)
	Create(ctx context.Context, id string, in Input) (*Wisudawan, error)
	Update(ctx context.Context, id string, in Input) (*Wisudawan, error)
	Delete(ctx context.Context, id string) error
}
