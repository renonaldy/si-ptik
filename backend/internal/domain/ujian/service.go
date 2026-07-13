package ujian

import (
	"context"
	"fmt"
	"strings"

	"ptik/pkg/apperror"

	"github.com/google/uuid"
)

type Service struct{ repo Repository }

func NewService(repo Repository) *Service { return &Service{repo: repo} }

func (s *Service) List(ctx context.Context, search string) ([]Ujian, error) {
	return s.repo.List(ctx, strings.TrimSpace(search))
}

func (s *Service) Get(ctx context.Context, id string) (*Ujian, error) {
	x, err := s.repo.GetByID(ctx, id)
	if err != nil {
		return nil, fmt.Errorf("ujian.Service.Get: %w", err)
	}
	if x == nil {
		return nil, apperror.New(apperror.CodeNotFound, "jadwal ujian tidak ditemukan")
	}
	return x, nil
}

func (s *Service) Create(ctx context.Context, in Input) (*Ujian, error) {
	if err := validate(in); err != nil {
		return nil, err
	}
	x, err := s.repo.Create(ctx, "ujian-"+uuid.NewString(), normalize(in))
	if err != nil {
		return nil, fmt.Errorf("ujian.Service.Create: %w", err)
	}
	return x, nil
}

func (s *Service) Update(ctx context.Context, id string, in Input) (*Ujian, error) {
	if err := validate(in); err != nil {
		return nil, err
	}
	existing, err := s.repo.GetByID(ctx, id)
	if err != nil {
		return nil, fmt.Errorf("ujian.Service.Update: %w", err)
	}
	if existing == nil {
		return nil, apperror.New(apperror.CodeNotFound, "jadwal ujian tidak ditemukan")
	}
	x, err := s.repo.Update(ctx, id, normalize(in))
	if err != nil {
		return nil, fmt.Errorf("ujian.Service.Update: %w", err)
	}
	return x, nil
}

// SyncFromSempro ensures a "sempro" exam entry exists for a student (idempotent by
// NPM + jenis). Called when a Sempro record is created so admins only set the schedule.
func (s *Service) SyncFromSempro(ctx context.Context, nama, npm, judul, pembimbing string) error {
	npm = strings.TrimSpace(npm)
	existing, err := s.repo.List(ctx, npm)
	if err != nil {
		return fmt.Errorf("ujian.Service.SyncFromSempro: %w", err)
	}
	for _, u := range existing {
		if u.Jenis == "sempro" && (u.NPM == npm && npm != "" || u.Nama == nama) {
			return nil // already synced
		}
	}
	_, err = s.Create(ctx, Input{
		Nama:       nama,
		NPM:        npm,
		Judul:      judul,
		Pembimbing: pembimbing,
		Jenis:      "sempro",
		Status:     "akan",
	})
	return err
}

func (s *Service) Delete(ctx context.Context, id string) error {
	if err := s.repo.Delete(ctx, id); err != nil {
		return fmt.Errorf("ujian.Service.Delete: %w", err)
	}
	return nil
}

func validate(in Input) error {
	if strings.TrimSpace(in.Nama) == "" {
		return apperror.New(apperror.CodeValidation, "nama mahasiswa wajib diisi")
	}
	return nil
}

func normalize(in Input) Input {
	in.Nama = strings.TrimSpace(in.Nama)
	in.NPM = strings.TrimSpace(in.NPM)
	in.Jenis = strings.TrimSpace(in.Jenis)
	in.Judul = strings.TrimSpace(in.Judul)
	in.Pembimbing = strings.TrimSpace(in.Pembimbing)
	in.Penguji1 = strings.TrimSpace(in.Penguji1)
	in.Penguji2 = strings.TrimSpace(in.Penguji2)
	in.Tanggal = strings.TrimSpace(in.Tanggal)
	in.Jam = strings.TrimSpace(in.Jam)
	in.JamSelesai = strings.TrimSpace(in.JamSelesai)
	in.Ruang = strings.TrimSpace(in.Ruang)
	in.Status = strings.TrimSpace(in.Status)
	in.Foto = strings.TrimSpace(in.Foto)
	in.FileSkripsi = strings.TrimSpace(in.FileSkripsi)
	in.FilePPT = strings.TrimSpace(in.FilePPT)
	if in.Jenis == "" {
		in.Jenis = "sempro"
	}
	if in.Status == "" {
		in.Status = "akan"
	}
	return in
}
