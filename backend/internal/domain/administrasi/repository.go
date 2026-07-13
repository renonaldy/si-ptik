package administrasi

import "context"

type Repository interface {
	List(ctx context.Context, search string) ([]Administrasi, error)
	GetByID(ctx context.Context, id string) (*Administrasi, error)
	Create(ctx context.Context, id string, in Input) (*Administrasi, error)
	Update(ctx context.Context, id string, in Input) (*Administrasi, error)
	Delete(ctx context.Context, id string) error
}
