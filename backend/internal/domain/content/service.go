package content

import (
	"context"
	"fmt"
	"strings"
)

type Service struct{ repo Repository }

func NewService(repo Repository) *Service { return &Service{repo: repo} }

func (s *Service) List(ctx context.Context) ([]SiteContent, error) {
	return s.repo.List(ctx)
}

// SetMany upserts a batch of content items. Empty keys are skipped.
func (s *Service) SetMany(ctx context.Context, items []Item) error {
	for _, it := range items {
		key := strings.TrimSpace(it.Key)
		if key == "" {
			continue
		}
		if err := s.repo.Upsert(ctx, key, it.Value); err != nil {
			return fmt.Errorf("content.Service.SetMany: %w", err)
		}
	}
	return nil
}
