package navmenu

import "context"

type Repository interface {
	List(ctx context.Context) ([]NavItem, error)
	GetByID(ctx context.Context, id string) (*NavItem, error)
	Create(ctx context.Context, id string, in Input) (*NavItem, error)
	Update(ctx context.Context, id string, in Input) (*NavItem, error)
	Delete(ctx context.Context, id string) error
	Reorder(ctx context.Context, ids []string) error
}
