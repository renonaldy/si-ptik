package skripsi

import "context"

type Repository interface {
	List(ctx context.Context, search string) ([]Skripsi, error)
	GetByID(ctx context.Context, id string) (*Skripsi, error)
	Create(ctx context.Context, id string, in Input) (*Skripsi, error)
	Update(ctx context.Context, id string, in Input) (*Skripsi, error)
	Delete(ctx context.Context, id string) error
}
