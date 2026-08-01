package navmenu

import (
	"context"
	"fmt"
	"strings"

	"ptik/pkg/apperror"

	"github.com/google/uuid"
)

type Service struct{ repo Repository }

func NewService(repo Repository) *Service { return &Service{repo: repo} }

func (s *Service) List(ctx context.Context) ([]NavItem, error) {
	return s.repo.List(ctx)
}

func (s *Service) Get(ctx context.Context, id string) (*NavItem, error) {
	x, err := s.repo.GetByID(ctx, id)
	if err != nil {
		return nil, fmt.Errorf("navmenu.Service.Get: %w", err)
	}
	if x == nil {
		return nil, apperror.New(apperror.CodeNotFound, "menu navigasi tidak ditemukan")
	}
	return x, nil
}

func (s *Service) Create(ctx context.Context, in Input) (*NavItem, error) {
	if err := validate(in); err != nil {
		return nil, err
	}
	x, err := s.repo.Create(ctx, "nav-"+uuid.NewString(), normalize(in))
	if err != nil {
		return nil, fmt.Errorf("navmenu.Service.Create: %w", err)
	}
	return x, nil
}

func (s *Service) Update(ctx context.Context, id string, in Input) (*NavItem, error) {
	if err := validate(in); err != nil {
		return nil, err
	}
	existing, err := s.repo.GetByID(ctx, id)
	if err != nil {
		return nil, fmt.Errorf("navmenu.Service.Update: %w", err)
	}
	if existing == nil {
		return nil, apperror.New(apperror.CodeNotFound, "menu navigasi tidak ditemukan")
	}
	x, err := s.repo.Update(ctx, id, normalize(in))
	if err != nil {
		return nil, fmt.Errorf("navmenu.Service.Update: %w", err)
	}
	return x, nil
}

func (s *Service) Delete(ctx context.Context, id string) error {
	if err := s.repo.Delete(ctx, id); err != nil {
		return fmt.Errorf("navmenu.Service.Delete: %w", err)
	}
	return nil
}

func (s *Service) Reorder(ctx context.Context, ids []string) error {
	if len(ids) == 0 {
		return apperror.New(apperror.CodeValidation, "daftar id wajib diisi")
	}
	if err := s.repo.Reorder(ctx, ids); err != nil {
		return fmt.Errorf("navmenu.Service.Reorder: %w", err)
	}
	return nil
}

func validate(in Input) error {
	if strings.TrimSpace(in.Label) == "" {
		return apperror.New(apperror.CodeValidation, "label wajib diisi")
	}
	if in.Type != TypeLink && in.Type != TypeDropdown {
		return apperror.New(apperror.CodeValidation, "tipe menu tidak valid")
	}
	if in.Type == TypeLink && strings.TrimSpace(in.Path) == "" {
		return apperror.New(apperror.CodeValidation, "path wajib diisi untuk menu link")
	}
	return nil
}

func normalize(in Input) Input {
	in.Label = strings.TrimSpace(in.Label)
	in.Path = strings.TrimSpace(in.Path)
	in.Items = normalizeLeaves(in.Items)
	return in
}

// normalizeLeaves trims each leaf's fields and drops rows left fully blank by
// the admin's repeatable-list form.
func normalizeLeaves(leaves []NavLeaf) []NavLeaf {
	out := make([]NavLeaf, 0, len(leaves))
	for _, l := range leaves {
		l.Label = strings.TrimSpace(l.Label)
		l.To = strings.TrimSpace(l.To)
		if l.Label == "" && l.To == "" {
			continue
		}
		out = append(out, l)
	}
	return out
}
