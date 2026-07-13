package pendaftaran

import (
	"context"
	"fmt"
	"strings"

	"ptik/pkg/apperror"

	"github.com/google/uuid"
)

type Service struct{ repo Repository }

func NewService(repo Repository) *Service { return &Service{repo: repo} }

func (s *Service) List(ctx context.Context, search string) ([]Pendaftaran, error) {
	return s.repo.List(ctx, strings.TrimSpace(search))
}

func (s *Service) Get(ctx context.Context, id string) (*Pendaftaran, error) {
	x, err := s.repo.GetByID(ctx, id)
	if err != nil {
		return nil, fmt.Errorf("pendaftaran.Service.Get: %w", err)
	}
	if x == nil {
		return nil, apperror.New(apperror.CodeNotFound, "pendaftaran tidak ditemukan")
	}
	return x, nil
}

func (s *Service) Create(ctx context.Context, in Input) (*Pendaftaran, error) {
	if err := validate(in); err != nil {
		return nil, err
	}
	x, err := s.repo.Create(ctx, "pendaftaran-"+uuid.NewString(), normalize(in))
	if err != nil {
		return nil, fmt.Errorf("pendaftaran.Service.Create: %w", err)
	}
	return x, nil
}

func (s *Service) Update(ctx context.Context, id string, in Input) (*Pendaftaran, error) {
	if err := validate(in); err != nil {
		return nil, err
	}
	existing, err := s.repo.GetByID(ctx, id)
	if err != nil {
		return nil, fmt.Errorf("pendaftaran.Service.Update: %w", err)
	}
	if existing == nil {
		return nil, apperror.New(apperror.CodeNotFound, "pendaftaran tidak ditemukan")
	}
	x, err := s.repo.Update(ctx, id, normalize(in))
	if err != nil {
		return nil, fmt.Errorf("pendaftaran.Service.Update: %w", err)
	}
	return x, nil
}

func (s *Service) Delete(ctx context.Context, id string) error {
	if err := s.repo.Delete(ctx, id); err != nil {
		return fmt.Errorf("pendaftaran.Service.Delete: %w", err)
	}
	return nil
}

func validate(in Input) error {
	if strings.TrimSpace(in.Nama) == "" {
		return apperror.New(apperror.CodeValidation, "nama wajib diisi")
	}
	return nil
}

func normalize(in Input) Input {
	in.Nama = strings.TrimSpace(in.Nama)
	in.Email = strings.TrimSpace(in.Email)
	in.NoHP = strings.TrimSpace(in.NoHP)
	in.AsalSekolah = strings.TrimSpace(in.AsalSekolah)
	in.Jenis = strings.TrimSpace(in.Jenis)
	in.Pesan = strings.TrimSpace(in.Pesan)
	return in
}
