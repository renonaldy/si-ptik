package skripsialumni

import "context"

type Repository interface {
	List(ctx context.Context, search string) ([]SkripsiAlumni, error)
	GetByID(ctx context.Context, id string) (*SkripsiAlumni, error)
	Create(ctx context.Context, id string, in Input) (*SkripsiAlumni, error)
	Update(ctx context.Context, id string, in Input) (*SkripsiAlumni, error)
	Delete(ctx context.Context, id string) error
}
