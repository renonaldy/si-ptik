package sumbangan

import "context"

type Repository interface {
	List(ctx context.Context, search string) ([]Sumbangan, error)
	GetByID(ctx context.Context, id string) (*Sumbangan, error)
	Create(ctx context.Context, id string, in Input) (*Sumbangan, error)
	Update(ctx context.Context, id string, in Input) (*Sumbangan, error)
	Delete(ctx context.Context, id string) error
}
