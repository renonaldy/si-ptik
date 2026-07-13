package skripsialumni

import (
	"context"
	"fmt"
	"strings"

	"ptik/pkg/apperror"

	"github.com/google/uuid"
)

type Service struct{ repo Repository }

func NewService(repo Repository) *Service { return &Service{repo: repo} }

func (s *Service) List(ctx context.Context, search string) ([]SkripsiAlumni, error) {
	return s.repo.List(ctx, strings.TrimSpace(search))
}

func (s *Service) Get(ctx context.Context, id string) (*SkripsiAlumni, error) {
	x, err := s.repo.GetByID(ctx, id)
	if err != nil {
		return nil, fmt.Errorf("skripsialumni.Service.Get: %w", err)
	}
	if x == nil {
		return nil, apperror.New(apperror.CodeNotFound, "skripsi alumni tidak ditemukan")
	}
	return x, nil
}

func (s *Service) Create(ctx context.Context, in Input) (*SkripsiAlumni, error) {
	if err := validate(in); err != nil {
		return nil, err
	}
	x, err := s.repo.Create(ctx, "skripsi-alumni-"+uuid.NewString(), normalize(in))
	if err != nil {
		return nil, fmt.Errorf("skripsialumni.Service.Create: %w", err)
	}
	return x, nil
}

func (s *Service) Update(ctx context.Context, id string, in Input) (*SkripsiAlumni, error) {
	if err := validate(in); err != nil {
		return nil, err
	}
	existing, err := s.repo.GetByID(ctx, id)
	if err != nil {
		return nil, fmt.Errorf("skripsialumni.Service.Update: %w", err)
	}
	if existing == nil {
		return nil, apperror.New(apperror.CodeNotFound, "skripsi alumni tidak ditemukan")
	}
	x, err := s.repo.Update(ctx, id, normalize(in))
	if err != nil {
		return nil, fmt.Errorf("skripsialumni.Service.Update: %w", err)
	}
	return x, nil
}

func (s *Service) Delete(ctx context.Context, id string) error {
	if err := s.repo.Delete(ctx, id); err != nil {
		return fmt.Errorf("skripsialumni.Service.Delete: %w", err)
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
	in.JudulSkripsi = strings.TrimSpace(in.JudulSkripsi)
	in.Pembimbing = strings.TrimSpace(in.Pembimbing)
	in.File = strings.TrimSpace(in.File)
	return in
}
