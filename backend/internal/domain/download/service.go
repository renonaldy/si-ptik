package download

import (
	"context"
	"fmt"
	"strings"

	"ptik/pkg/apperror"

	"github.com/google/uuid"
)

type Service struct{ repo Repository }

func NewService(repo Repository) *Service { return &Service{repo: repo} }

func (s *Service) List(ctx context.Context, search string) ([]Download, error) {
	return s.repo.List(ctx, strings.TrimSpace(search))
}

func (s *Service) Get(ctx context.Context, id string) (*Download, error) {
	x, err := s.repo.GetByID(ctx, id)
	if err != nil {
		return nil, fmt.Errorf("download.Service.Get: %w", err)
	}
	if x == nil {
		return nil, apperror.New(apperror.CodeNotFound, "download tidak ditemukan")
	}
	return x, nil
}

func (s *Service) Create(ctx context.Context, in Input) (*Download, error) {
	if err := validate(in); err != nil {
		return nil, err
	}
	x, err := s.repo.Create(ctx, "download-"+uuid.NewString(), normalize(in))
	if err != nil {
		return nil, fmt.Errorf("download.Service.Create: %w", err)
	}
	return x, nil
}

func (s *Service) Update(ctx context.Context, id string, in Input) (*Download, error) {
	if err := validate(in); err != nil {
		return nil, err
	}
	existing, err := s.repo.GetByID(ctx, id)
	if err != nil {
		return nil, fmt.Errorf("download.Service.Update: %w", err)
	}
	if existing == nil {
		return nil, apperror.New(apperror.CodeNotFound, "download tidak ditemukan")
	}
	x, err := s.repo.Update(ctx, id, normalize(in))
	if err != nil {
		return nil, fmt.Errorf("download.Service.Update: %w", err)
	}
	return x, nil
}

func (s *Service) Delete(ctx context.Context, id string) error {
	if err := s.repo.Delete(ctx, id); err != nil {
		return fmt.Errorf("download.Service.Delete: %w", err)
	}
	return nil
}

func validate(in Input) error {
	if strings.TrimSpace(in.Judul) == "" {
		return apperror.New(apperror.CodeValidation, "judul wajib diisi")
	}
	return nil
}

func normalize(in Input) Input {
	in.Judul = strings.TrimSpace(in.Judul)
	in.Keterangan = strings.TrimSpace(in.Keterangan)
	in.Kategori = strings.TrimSpace(in.Kategori)
	in.File = strings.TrimSpace(in.File)
	return in
}
