package ujian

import "context"

type Repository interface {
	List(ctx context.Context, search string) ([]Ujian, error)
	GetByID(ctx context.Context, id string) (*Ujian, error)
	Create(ctx context.Context, id string, in Input) (*Ujian, error)
	Update(ctx context.Context, id string, in Input) (*Ujian, error)
	Delete(ctx context.Context, id string) error
}
