package sempro

import (
	"context"
	"fmt"
	"strings"

	"ptik/pkg/apperror"

	"github.com/google/uuid"
)

// UjianSyncer mirrors a created Sempro into the exam schedule (Jadwal Ujian) so
// admins only need to set the schedule afterwards. Optional (may be nil).
type UjianSyncer interface {
	SyncFromSempro(ctx context.Context, nama, npm, judul, pembimbing string) error
}

type Service struct {
	repo   Repository
	syncer UjianSyncer
}

func NewService(repo Repository, syncer UjianSyncer) *Service {
	return &Service{repo: repo, syncer: syncer}
}

func (s *Service) List(ctx context.Context, search string) ([]Sempro, error) {
	return s.repo.List(ctx, strings.TrimSpace(search))
}

func (s *Service) Get(ctx context.Context, id string) (*Sempro, error) {
	x, err := s.repo.GetByID(ctx, id)
	if err != nil {
		return nil, fmt.Errorf("sempro.Service.Get: %w", err)
	}
	if x == nil {
		return nil, apperror.New(apperror.CodeNotFound, "seminar proposal tidak ditemukan")
	}
	return x, nil
}

func (s *Service) Create(ctx context.Context, in Input) (*Sempro, error) {
	if err := validate(in); err != nil {
		return nil, err
	}
	x, err := s.repo.Create(ctx, "sempro-"+uuid.NewString(), normalize(in))
	if err != nil {
		return nil, fmt.Errorf("sempro.Service.Create: %w", err)
	}
	// Auto-sync into Jadwal Ujian (best-effort; never fail the Sempro create).
	if s.syncer != nil {
		_ = s.syncer.SyncFromSempro(ctx, x.Nama, x.NPM, x.Judul, x.Pembimbing)
	}
	return x, nil
}

func (s *Service) Update(ctx context.Context, id string, in Input) (*Sempro, error) {
	if err := validate(in); err != nil {
		return nil, err
	}
	existing, err := s.repo.GetByID(ctx, id)
	if err != nil {
		return nil, fmt.Errorf("sempro.Service.Update: %w", err)
	}
	if existing == nil {
		return nil, apperror.New(apperror.CodeNotFound, "seminar proposal tidak ditemukan")
	}
	x, err := s.repo.Update(ctx, id, normalize(in))
	if err != nil {
		return nil, fmt.Errorf("sempro.Service.Update: %w", err)
	}
	return x, nil
}

func (s *Service) Delete(ctx context.Context, id string) error {
	if err := s.repo.Delete(ctx, id); err != nil {
		return fmt.Errorf("sempro.Service.Delete: %w", err)
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
	in.NPM = strings.TrimSpace(in.NPM)
	in.Judul = strings.TrimSpace(in.Judul)
	in.Pembimbing = strings.TrimSpace(in.Pembimbing)
	in.File = strings.TrimSpace(in.File)
	return in
}
