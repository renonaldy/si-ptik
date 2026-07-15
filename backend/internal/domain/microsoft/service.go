package microsoft

import (
	"context"
	"fmt"
	"strings"

	"ptik/pkg/apperror"

	"github.com/google/uuid"
)

type Service struct{ repo Repository }

func NewService(repo Repository) *Service { return &Service{repo: repo} }

func (s *Service) List(ctx context.Context, search string) ([]Microsoft, error) {
	return s.repo.List(ctx, strings.TrimSpace(search))
}

func (s *Service) Get(ctx context.Context, id string) (*Microsoft, error) {
	x, err := s.repo.GetByID(ctx, id)
	if err != nil {
		return nil, fmt.Errorf("microsoft.Service.Get: %w", err)
	}
	if x == nil {
		return nil, apperror.New(apperror.CodeNotFound, "pendaftaran pelatihan tidak ditemukan")
	}
	return x, nil
}

func (s *Service) Create(ctx context.Context, in Input) (*Microsoft, error) {
	if err := validate(in); err != nil {
		return nil, err
	}
	x, err := s.repo.Create(ctx, "microsoft-"+uuid.NewString(), normalize(in))
	if err != nil {
		return nil, fmt.Errorf("microsoft.Service.Create: %w", err)
	}
	return x, nil
}

func (s *Service) Update(ctx context.Context, id string, in Input) (*Microsoft, error) {
	if err := validate(in); err != nil {
		return nil, err
	}
	existing, err := s.repo.GetByID(ctx, id)
	if err != nil {
		return nil, fmt.Errorf("microsoft.Service.Update: %w", err)
	}
	if existing == nil {
		return nil, apperror.New(apperror.CodeNotFound, "pendaftaran pelatihan tidak ditemukan")
	}
	x, err := s.repo.Update(ctx, id, normalize(in))
	if err != nil {
		return nil, fmt.Errorf("microsoft.Service.Update: %w", err)
	}
	return x, nil
}

// UpdateStatus approves/rejects (or resets) a registration. Restricted to admin
// roles at the routing layer (WriteGuard).
func (s *Service) UpdateStatus(ctx context.Context, id, status string) (*Microsoft, error) {
	status = strings.ToLower(strings.TrimSpace(status))
	switch status {
	case StatusPending, StatusApproved, StatusRejected:
	default:
		return nil, apperror.New(apperror.CodeValidation, "status tidak valid")
	}
	existing, err := s.repo.GetByID(ctx, id)
	if err != nil {
		return nil, fmt.Errorf("microsoft.Service.UpdateStatus: %w", err)
	}
	if existing == nil {
		return nil, apperror.New(apperror.CodeNotFound, "pendaftaran pelatihan tidak ditemukan")
	}
	x, err := s.repo.UpdateStatus(ctx, id, status)
	if err != nil {
		return nil, fmt.Errorf("microsoft.Service.UpdateStatus: %w", err)
	}
	return x, nil
}

func (s *Service) Delete(ctx context.Context, id string) error {
	if err := s.repo.Delete(ctx, id); err != nil {
		return fmt.Errorf("microsoft.Service.Delete: %w", err)
	}
	return nil
}

func validate(in Input) error {
	if strings.TrimSpace(in.Nama) == "" {
		return apperror.New(apperror.CodeValidation, "nama wajib diisi")
	}
	if strings.TrimSpace(in.NPM) == "" {
		return apperror.New(apperror.CodeValidation, "npm wajib diisi")
	}
	return nil
}

func normalize(in Input) Input {
	in.Nama = strings.TrimSpace(in.Nama)
	in.NPM = strings.TrimSpace(in.NPM)
	in.JenisPelatihan = strings.TrimSpace(in.JenisPelatihan)
	in.BuktiPembayaran = strings.TrimSpace(in.BuktiPembayaran)
	return in
}
