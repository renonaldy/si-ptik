package dosen

import "context"

type Repository interface {
	List(ctx context.Context, search string) ([]Dosen, error)
	GetByID(ctx context.Context, id string) (*Dosen, error)
	Create(ctx context.Context, id string, in Input) (*Dosen, error)
	Update(ctx context.Context, id string, in Input) (*Dosen, error)
	Delete(ctx context.Context, id string) error
}
