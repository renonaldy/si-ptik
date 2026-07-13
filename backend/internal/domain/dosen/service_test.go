package dosen

import (
	"context"
	"testing"

	"ptik/pkg/apperror"
)

// fakeRepo is an in-memory Repository for testing the service in isolation.
type fakeRepo struct {
	last *Dosen
}

func (f *fakeRepo) List(ctx context.Context, search string) ([]Dosen, error) { return nil, nil }
func (f *fakeRepo) GetByID(ctx context.Context, id string) (*Dosen, error)   { return f.last, nil }
func (f *fakeRepo) Create(ctx context.Context, id string, in Input) (*Dosen, error) {
	f.last = &Dosen{ID: id, NamaDosen: in.NamaDosen, NIDN: in.NIDN}
	return f.last, nil
}
func (f *fakeRepo) Update(ctx context.Context, id string, in Input) (*Dosen, error) {
	return &Dosen{ID: id, NamaDosen: in.NamaDosen}, nil
}
func (f *fakeRepo) Delete(ctx context.Context, id string) error { return nil }

func TestCreate_RejectsEmptyName(t *testing.T) {
	s := NewService(&fakeRepo{})
	_, err := s.Create(context.Background(), Input{NamaDosen: "   "})
	if !apperror.IsCode(err, apperror.CodeValidation) {
		t.Fatalf("expected VALIDATION_ERROR, got %v", err)
	}
}

func TestCreate_TrimsName(t *testing.T) {
	s := NewService(&fakeRepo{})
	d, err := s.Create(context.Background(), Input{NamaDosen: "  Budi Santoso  "})
	if err != nil {
		t.Fatalf("unexpected error: %v", err)
	}
	if d.NamaDosen != "Budi Santoso" {
		t.Fatalf("expected trimmed name, got %q", d.NamaDosen)
	}
}

func TestUpdate_NotFound(t *testing.T) {
	s := NewService(&fakeRepo{}) // GetByID returns nil
	_, err := s.Update(context.Background(), "missing", Input{NamaDosen: "X"})
	if !apperror.IsCode(err, apperror.CodeNotFound) {
		t.Fatalf("expected NOT_FOUND, got %v", err)
	}
}
