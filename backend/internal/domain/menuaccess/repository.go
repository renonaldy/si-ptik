package menuaccess

import "context"

type Repository interface {
	List(ctx context.Context) ([]RoleMenu, error)
	Get(ctx context.Context, role string) (*RoleMenu, error)
	Upsert(ctx context.Context, role string, menuKeys, writeKeys []string) error
}
