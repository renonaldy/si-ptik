package user

import (
	"context"
	"fmt"

	"ptik/pkg/apperror"
)

type Service struct{ repo Repository }

func NewService(repo Repository) *Service { return &Service{repo: repo} }

// GetByID returns the user or a NOT_FOUND app error.
func (s *Service) GetByID(ctx context.Context, id string) (*User, error) {
	u, err := s.repo.GetByID(ctx, id)
	if err != nil {
		return nil, fmt.Errorf("user.Service.GetByID: %w", err)
	}
	if u == nil {
		return nil, apperror.New(apperror.CodeNotFound, "user not found")
	}
	return u, nil
}
