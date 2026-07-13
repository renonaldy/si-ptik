package pendaftaran

import "context"

type Repository interface {
	List(ctx context.Context, search string) ([]Pendaftaran, error)
	GetByID(ctx context.Context, id string) (*Pendaftaran, error)
	Create(ctx context.Context, id string, in Input) (*Pendaftaran, error)
	Update(ctx context.Context, id string, in Input) (*Pendaftaran, error)
	Delete(ctx context.Context, id string) error
}
