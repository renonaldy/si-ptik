package promosi

import "context"

type Repository interface {
	List(ctx context.Context, search, tipe string) ([]Promosi, error)
	GetByID(ctx context.Context, id string) (*Promosi, error)
	Create(ctx context.Context, id string, in Input) (*Promosi, error)
	Update(ctx context.Context, id string, in Input) (*Promosi, error)
	Delete(ctx context.Context, id string) error
}
