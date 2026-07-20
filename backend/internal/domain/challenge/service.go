package challenge

import (
	"context"
	"fmt"
	"strings"

	"ptik/pkg/apperror"

	"github.com/google/uuid"
)

type Service struct{ repo Repository }

func NewService(repo Repository) *Service { return &Service{repo: repo} }

func (s *Service) List(ctx context.Context, search, status string) ([]Challenge, error) {
	return s.repo.List(ctx, strings.TrimSpace(search), strings.TrimSpace(status))
}

func (s *Service) Get(ctx context.Context, id string) (*Challenge, error) {
	x, err := s.repo.GetByID(ctx, id)
	if err != nil {
		return nil, fmt.Errorf("challenge.Service.Get: %w", err)
	}
	if x == nil {
		return nil, apperror.New(apperror.CodeNotFound, "challenge tidak ditemukan")
	}
	return x, nil
}

func (s *Service) Create(ctx context.Context, in Input) (*Challenge, error) {
	if err := validate(in); err != nil {
		return nil, err
	}
	x, err := s.repo.Create(ctx, "challenge-"+uuid.NewString(), normalize(in))
	if err != nil {
		return nil, fmt.Errorf("challenge.Service.Create: %w", err)
	}
	return x, nil
}

func (s *Service) Update(ctx context.Context, id string, in Input) (*Challenge, error) {
	if err := validate(in); err != nil {
		return nil, err
	}
	existing, err := s.repo.GetByID(ctx, id)
	if err != nil {
		return nil, fmt.Errorf("challenge.Service.Update: %w", err)
	}
	if existing == nil {
		return nil, apperror.New(apperror.CodeNotFound, "challenge tidak ditemukan")
	}
	x, err := s.repo.Update(ctx, id, normalize(in))
	if err != nil {
		return nil, fmt.Errorf("challenge.Service.Update: %w", err)
	}
	return x, nil
}

func (s *Service) Delete(ctx context.Context, id string) error {
	if err := s.repo.Delete(ctx, id); err != nil {
		return fmt.Errorf("challenge.Service.Delete: %w", err)
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
	in.Deskripsi = strings.TrimSpace(in.Deskripsi)
	in.Poster = strings.TrimSpace(in.Poster)
	in.Lampiran = strings.TrimSpace(in.Lampiran)
	in.LinkDaftar = strings.TrimSpace(in.LinkDaftar)
	in.TanggalMulai = strings.TrimSpace(in.TanggalMulai)
	in.TanggalSelesai = strings.TrimSpace(in.TanggalSelesai)
	in.Status = strings.TrimSpace(in.Status)
	if in.Status == "" {
		in.Status = "aktif"
	}
	in.TemaSubjudul = strings.TrimSpace(in.TemaSubjudul)
	in.Tema = normalizePoints(in.Tema)
	in.Aturan = normalizePoints(in.Aturan)
	in.Penilaian = normalizePoints(in.Penilaian)
	in.PenilaianIntro = strings.TrimSpace(in.PenilaianIntro)
	in.Hadiah = normalizePoints(in.Hadiah)
	in.HadiahIntro = strings.TrimSpace(in.HadiahIntro)
	in.Hashtags = normalizeHashtags(in.Hashtags)
	in.CaptionTemplate = strings.TrimSpace(in.CaptionTemplate)
	return in
}

// normalizeHashtags trims each tag and drops blank rows from the admin's
// repeatable-list form.
func normalizeHashtags(tags []string) []string {
	out := make([]string, 0, len(tags))
	for _, t := range tags {
		t = strings.TrimSpace(t)
		if t == "" {
			continue
		}
		out = append(out, t)
	}
	return out
}

// normalizePoints trims each point's fields and drops rows left fully blank
// by the admin's repeatable-list form.
func normalizePoints(points []Point) []Point {
	out := make([]Point, 0, len(points))
	for _, p := range points {
		p.Icon = strings.TrimSpace(p.Icon)
		p.Judul = strings.TrimSpace(p.Judul)
		p.Keterangan = strings.TrimSpace(p.Keterangan)
		if p.Judul == "" && p.Keterangan == "" {
			continue
		}
		out = append(out, p)
	}
	return out
}
