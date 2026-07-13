package alumni

import (
	"context"
	"fmt"
	"strings"

	"ptik/pkg/apperror"

	"github.com/google/uuid"
)

type Service struct{ repo Repository }

func NewService(repo Repository) *Service { return &Service{repo: repo} }

func (s *Service) List(ctx context.Context, search string) ([]Alumni, error) {
	return s.repo.List(ctx, strings.TrimSpace(search))
}

func (s *Service) Get(ctx context.Context, id string) (*Alumni, error) {
	a, err := s.repo.GetByID(ctx, id)
	if err != nil {
		return nil, fmt.Errorf("alumni.Service.Get: %w", err)
	}
	if a == nil {
		return nil, apperror.New(apperror.CodeNotFound, "alumni tidak ditemukan")
	}
	return a, nil
}

func (s *Service) Create(ctx context.Context, in Input) (*Alumni, error) {
	if err := validate(in); err != nil {
		return nil, err
	}
	a, err := s.repo.Create(ctx, "alumni-"+uuid.NewString(), normalize(in))
	if err != nil {
		return nil, fmt.Errorf("alumni.Service.Create: %w", err)
	}
	return a, nil
}

func (s *Service) Update(ctx context.Context, id string, in Input) (*Alumni, error) {
	if err := validate(in); err != nil {
		return nil, err
	}
	existing, err := s.repo.GetByID(ctx, id)
	if err != nil {
		return nil, fmt.Errorf("alumni.Service.Update: %w", err)
	}
	if existing == nil {
		return nil, apperror.New(apperror.CodeNotFound, "alumni tidak ditemukan")
	}
	a, err := s.repo.Update(ctx, id, normalize(in))
	if err != nil {
		return nil, fmt.Errorf("alumni.Service.Update: %w", err)
	}
	return a, nil
}

func (s *Service) Delete(ctx context.Context, id string) error {
	if err := s.repo.Delete(ctx, id); err != nil {
		return fmt.Errorf("alumni.Service.Delete: %w", err)
	}
	return nil
}

func validate(in Input) error {
	if strings.TrimSpace(in.NamaAlumni) == "" {
		return apperror.New(apperror.CodeValidation, "nama alumni wajib diisi")
	}
	return nil
}

func normalize(in Input) Input {
	in.NamaAlumni = strings.TrimSpace(in.NamaAlumni)
	in.NPM = strings.TrimSpace(in.NPM)
	in.TempatLahir = strings.TrimSpace(in.TempatLahir)
	in.TanggalLahir = strings.TrimSpace(in.TanggalLahir)
	return in
}
