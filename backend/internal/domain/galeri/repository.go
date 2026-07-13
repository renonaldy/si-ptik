package galeri

import "context"

type Repository interface {
	List(ctx context.Context, search string) ([]Galeri, error)
	GetByID(ctx context.Context, id string) (*Galeri, error)
	Create(ctx context.Context, id string, in Input) (*Galeri, error)
	Update(ctx context.Context, id string, in Input) (*Galeri, error)
	Delete(ctx context.Context, id string) error
}
