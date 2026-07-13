package berita

import "context"

type Repository interface {
	List(ctx context.Context, search string) ([]Berita, error)
	GetByID(ctx context.Context, id string) (*Berita, error)
	Create(ctx context.Context, id string, in Input) (*Berita, error)
	Update(ctx context.Context, id string, in Input) (*Berita, error)
	Delete(ctx context.Context, id string) error
}
