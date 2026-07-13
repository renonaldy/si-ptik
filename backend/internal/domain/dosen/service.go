package dosen

import (
	"context"
	"fmt"
	"strings"

	"ptik/pkg/apperror"

	"github.com/google/uuid"
)

type Service struct{ repo Repository }

func NewService(repo Repository) *Service { return &Service{repo: repo} }

func (s *Service) List(ctx context.Context, search string) ([]Dosen, error) {
	return s.repo.List(ctx, strings.TrimSpace(search))
}

func (s *Service) Get(ctx context.Context, id string) (*Dosen, error) {
	d, err := s.repo.GetByID(ctx, id)
	if err != nil {
		return nil, fmt.Errorf("dosen.Service.Get: %w", err)
	}
	if d == nil {
		return nil, apperror.New(apperror.CodeNotFound, "dosen tidak ditemukan")
	}
	return d, nil
}

func (s *Service) Create(ctx context.Context, in Input) (*Dosen, error) {
	if err := validate(in); err != nil {
		return nil, err
	}
	d, err := s.repo.Create(ctx, "dosen-"+uuid.NewString(), normalize(in))
	if err != nil {
		return nil, fmt.Errorf("dosen.Service.Create: %w", err)
	}
	return d, nil
}

func (s *Service) Update(ctx context.Context, id string, in Input) (*Dosen, error) {
	if err := validate(in); err != nil {
		return nil, err
	}
	existing, err := s.repo.GetByID(ctx, id)
	if err != nil {
		return nil, fmt.Errorf("dosen.Service.Update: %w", err)
	}
	if existing == nil {
		return nil, apperror.New(apperror.CodeNotFound, "dosen tidak ditemukan")
	}
	d, err := s.repo.Update(ctx, id, normalize(in))
	if err != nil {
		return nil, fmt.Errorf("dosen.Service.Update: %w", err)
	}
	return d, nil
}

func (s *Service) Delete(ctx context.Context, id string) error {
	if err := s.repo.Delete(ctx, id); err != nil {
		return fmt.Errorf("dosen.Service.Delete: %w", err)
	}
	return nil
}

func validate(in Input) error {
	if strings.TrimSpace(in.NamaDosen) == "" {
		return apperror.New(apperror.CodeValidation, "nama dosen wajib diisi")
	}
	return nil
}

func normalize(in Input) Input {
	in.NamaDosen = strings.TrimSpace(in.NamaDosen)
	in.NIK = strings.TrimSpace(in.NIK)
	in.NIDN = strings.TrimSpace(in.NIDN)
	in.NoHP = strings.TrimSpace(in.NoHP)
	in.Jabatan = strings.TrimSpace(in.Jabatan)
	in.Pangkat = strings.TrimSpace(in.Pangkat)
	in.NoSertifikasi = strings.TrimSpace(in.NoSertifikasi)
	in.Status = strings.TrimSpace(in.Status)
	in.Foto = strings.TrimSpace(in.Foto)
	in.TempatLahir = strings.TrimSpace(in.TempatLahir)
	in.TanggalLahir = strings.TrimSpace(in.TanggalLahir)
	return in
}
