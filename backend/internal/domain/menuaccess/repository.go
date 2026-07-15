package menuaccess

import "context"

type Repository interface {
	List(ctx context.Context) ([]UserMenu, error)
	Get(ctx context.Context, userID string) (*UserMenu, error)
	Upsert(ctx context.Context, userID string, menuKeys, writeKeys []string) error
}
