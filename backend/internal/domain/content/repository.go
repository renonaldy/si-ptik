package content

import "context"

type Repository interface {
	List(ctx context.Context) ([]SiteContent, error)
	Upsert(ctx context.Context, key, value string) error
}
