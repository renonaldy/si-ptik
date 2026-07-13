package wisudawan

import (
	"context"
	"fmt"
	"strings"

	"ptik/pkg/apperror"

	"github.com/google/uuid"
)

type Service struct{ repo Repository }

func NewService(repo Repository) *Service { return &Service{repo: repo} }

func (s *Service) List(ctx context.Context, search string) ([]Wisudawan, error) {
	return s.repo.List(ctx, strings.TrimSpace(search))
}

func (s *Service) Get(ctx context.Context, id string) (*Wisudawan, error) {
	x, err := s.repo.GetByID(ctx, id)
	if err != nil {
		return nil, fmt.Errorf("wisudawan.Service.Get: %w", err)
	}
	if x == nil {
		return nil, apperror.New(apperror.CodeNotFound, "wisudawan tidak ditemukan")
	}
	return x, nil
}

func (s *Service) Create(ctx context.Context, in Input) (*Wisudawan, error) {
	if err := validate(in); err != nil {
		return nil, err
	}
	x, err := s.repo.Create(ctx, "wisudawan-"+uuid.NewString(), normalize(in))
	if err != nil {
		return nil, fmt.Errorf("wisudawan.Service.Create: %w", err)
	}
	return x, nil
}

func (s *Service) Update(ctx context.Context, id string, in Input) (*Wisudawan, error) {
	if err := validate(in); err != nil {
		return nil, err
	}
	existing, err := s.repo.GetByID(ctx, id)
	if err != nil {
		return nil, fmt.Errorf("wisudawan.Service.Update: %w", err)
	}
	if existing == nil {
		return nil, apperror.New(apperror.CodeNotFound, "wisudawan tidak ditemukan")
	}
	x, err := s.repo.Update(ctx, id, normalize(in))
	if err != nil {
		return nil, fmt.Errorf("wisudawan.Service.Update: %w", err)
	}
	return x, nil
}

func (s *Service) Delete(ctx context.Context, id string) error {
	if err := s.repo.Delete(ctx, id); err != nil {
		return fmt.Errorf("wisudawan.Service.Delete: %w", err)
	}
	return nil
}

func validate(in Input) error {
	if strings.TrimSpace(in.NamaWisudawan) == "" {
		return apperror.New(apperror.CodeValidation, "nama wisudawan wajib diisi")
	}
	return nil
}

func normalize(in Input) Input {
	in.NamaWisudawan = strings.TrimSpace(in.NamaWisudawan)
	in.NPM = strings.TrimSpace(in.NPM)
	in.JudulSkripsi = strings.TrimSpace(in.JudulSkripsi)
	in.Pembimbing = strings.TrimSpace(in.Pembimbing)
	in.TanggalSidang = strings.TrimSpace(in.TanggalSidang)
	in.Foto = strings.TrimSpace(in.Foto)
	return in
}
