package berita

import (
	"context"
	"fmt"
	"strings"

	"ptik/pkg/apperror"

	"github.com/google/uuid"
)

type Service struct{ repo Repository }

func NewService(repo Repository) *Service { return &Service{repo: repo} }

func (s *Service) List(ctx context.Context, search string) ([]Berita, error) {
	return s.repo.List(ctx, strings.TrimSpace(search))
}

func (s *Service) Get(ctx context.Context, id string) (*Berita, error) {
	x, err := s.repo.GetByID(ctx, id)
	if err != nil {
		return nil, fmt.Errorf("berita.Service.Get: %w", err)
	}
	if x == nil {
		return nil, apperror.New(apperror.CodeNotFound, "berita tidak ditemukan")
	}
	return x, nil
}

func (s *Service) Create(ctx context.Context, in Input) (*Berita, error) {
	if err := validate(in); err != nil {
		return nil, err
	}
	x, err := s.repo.Create(ctx, "berita-"+uuid.NewString(), normalize(in))
	if err != nil {
		return nil, fmt.Errorf("berita.Service.Create: %w", err)
	}
	return x, nil
}

func (s *Service) Update(ctx context.Context, id string, in Input) (*Berita, error) {
	if err := validate(in); err != nil {
		return nil, err
	}
	existing, err := s.repo.GetByID(ctx, id)
	if err != nil {
		return nil, fmt.Errorf("berita.Service.Update: %w", err)
	}
	if existing == nil {
		return nil, apperror.New(apperror.CodeNotFound, "berita tidak ditemukan")
	}
	x, err := s.repo.Update(ctx, id, normalize(in))
	if err != nil {
		return nil, fmt.Errorf("berita.Service.Update: %w", err)
	}
	return x, nil
}

func (s *Service) Delete(ctx context.Context, id string) error {
	if err := s.repo.Delete(ctx, id); err != nil {
		return fmt.Errorf("berita.Service.Delete: %w", err)
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
	in.Ringkasan = strings.TrimSpace(in.Ringkasan)
	in.Konten = strings.TrimSpace(in.Konten)
	in.Gambar = strings.TrimSpace(in.Gambar)
	in.Penulis = strings.TrimSpace(in.Penulis)
	in.Tanggal = strings.TrimSpace(in.Tanggal)
	return in
}
