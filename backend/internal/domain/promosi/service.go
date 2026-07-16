package promosi

import (
	"context"
	"fmt"
	"strings"

	"ptik/pkg/apperror"

	"github.com/google/uuid"
)

type Service struct{ repo Repository }

func NewService(repo Repository) *Service { return &Service{repo: repo} }

func (s *Service) List(ctx context.Context, search, tipe string) ([]Promosi, error) {
	return s.repo.List(ctx, strings.TrimSpace(search), strings.TrimSpace(tipe))
}

func (s *Service) Get(ctx context.Context, id string) (*Promosi, error) {
	x, err := s.repo.GetByID(ctx, id)
	if err != nil {
		return nil, fmt.Errorf("promosi.Service.Get: %w", err)
	}
	if x == nil {
		return nil, apperror.New(apperror.CodeNotFound, "promosi tidak ditemukan")
	}
	return x, nil
}

func (s *Service) Create(ctx context.Context, in Input) (*Promosi, error) {
	in = normalize(in)
	if err := validate(in); err != nil {
		return nil, err
	}
	x, err := s.repo.Create(ctx, "promosi-"+uuid.NewString(), in)
	if err != nil {
		return nil, fmt.Errorf("promosi.Service.Create: %w", err)
	}
	return x, nil
}

func (s *Service) Update(ctx context.Context, id string, in Input) (*Promosi, error) {
	in = normalize(in)
	if err := validate(in); err != nil {
		return nil, err
	}
	existing, err := s.repo.GetByID(ctx, id)
	if err != nil {
		return nil, fmt.Errorf("promosi.Service.Update: %w", err)
	}
	if existing == nil {
		return nil, apperror.New(apperror.CodeNotFound, "promosi tidak ditemukan")
	}
	x, err := s.repo.Update(ctx, id, in)
	if err != nil {
		return nil, fmt.Errorf("promosi.Service.Update: %w", err)
	}
	return x, nil
}

func (s *Service) Delete(ctx context.Context, id string) error {
	if err := s.repo.Delete(ctx, id); err != nil {
		return fmt.Errorf("promosi.Service.Delete: %w", err)
	}
	return nil
}

func validate(in Input) error {
	if in.Judul == "" {
		return apperror.New(apperror.CodeValidation, "judul wajib diisi")
	}
	if in.Tipe != TipeFlyer && in.Tipe != TipeVideo {
		return apperror.New(apperror.CodeValidation, "tipe harus 'flyer' atau 'video'")
	}
	switch in.Tipe {
	case TipeVideo:
		switch in.Sumber {
		case SumberUpload, SumberYouTube, SumberGDrive:
		default:
			return apperror.New(apperror.CodeValidation, "sumber video harus 'upload', 'youtube', atau 'gdrive'")
		}
	case TipeFlyer:
		switch in.Sumber {
		case SumberUpload, SumberGDrive:
		default:
			return apperror.New(apperror.CodeValidation, "sumber flyer harus 'upload' atau 'gdrive'")
		}
	}
	return nil
}

func normalize(in Input) Input {
	in.Judul = strings.TrimSpace(in.Judul)
	in.Tipe = strings.ToLower(strings.TrimSpace(in.Tipe))
	in.Media = strings.TrimSpace(in.Media)
	in.Sumber = strings.ToLower(strings.TrimSpace(in.Sumber))
	in.Keterangan = strings.TrimSpace(in.Keterangan)
	in.Tanggal = strings.TrimSpace(in.Tanggal)
	if in.Tipe == TipeFlyer && in.Sumber == "" {
		in.Sumber = SumberUpload // legacy flyers predate the sumber field
	}
	return in
}
