package obe

import "context"

// Repository is the OBE data-access contract. The concrete pgx implementation
// lives in internal/repository/postgres/obe.go. Reads that find nothing return
// (nil, nil) for single rows and empty slices for lists.
type Repository interface {
	// Curriculums
	ListCurriculums(ctx context.Context) ([]Curriculum, error)
	GetCurriculum(ctx context.Context, id string) (*Curriculum, error)
	GetActiveCurriculum(ctx context.Context) (*Curriculum, error)
	CreateCurriculum(ctx context.Context, id string, in CurriculumInput) (*Curriculum, error)
	UpdateCurriculum(ctx context.Context, id string, in CurriculumInput) (*Curriculum, error)
	DeleteCurriculum(ctx context.Context, id string) error
	// SetActiveCurriculum activates id and deactivates every other row (single transaction).
	SetActiveCurriculum(ctx context.Context, id string) (*Curriculum, error)

	// Courses
	ListCourses(ctx context.Context, curriculumID string, semester int) ([]Course, error)
	GetCourse(ctx context.Context, id string) (*Course, error)
	CreateCourse(ctx context.Context, id string, in CourseInput) (*Course, error)
	UpdateCourse(ctx context.Context, id string, in CourseInput) (*Course, error)
	DeleteCourse(ctx context.Context, id string) error

	// CPL
	ListCPL(ctx context.Context, curriculumID string) ([]CPL, error)
	GetCPL(ctx context.Context, id string) (*CPL, error)
	CreateCPL(ctx context.Context, id string, in CPLInput) (*CPL, error)
	UpdateCPL(ctx context.Context, id string, in CPLInput) (*CPL, error)
	DeleteCPL(ctx context.Context, id string) error

	// CPMK
	ListCPMKByCourse(ctx context.Context, courseID string) ([]CPMK, error)
	ListCPMKByCurriculum(ctx context.Context, curriculumID string) ([]CPMK, error)
	GetCPMK(ctx context.Context, id string) (*CPMK, error)
	CreateCPMK(ctx context.Context, id string, in CPMKInput) (*CPMK, error)
	UpdateCPMK(ctx context.Context, id string, in CPMKInput) (*CPMK, error)
	DeleteCPMK(ctx context.Context, id string) error

	// RPS
	ListRPS(ctx context.Context, courseID string) ([]RPS, error)
	GetRPS(ctx context.Context, id string) (*RPS, error)
	CreateRPS(ctx context.Context, id string, in RPSInput) (*RPS, error)
	UpdateRPS(ctx context.Context, id string, in RPSInput) (*RPS, error)
	DeleteRPS(ctx context.Context, id string) error

	// Mapping (CPL ↔ CPMK)
	ListLinksByCurriculum(ctx context.Context, curriculumID string) ([]Link, error)
	AddLink(ctx context.Context, cplID, cpmkID string) error
	RemoveLink(ctx context.Context, cplID, cpmkID string) error

	// Stats — aggregate counts for one curriculum.
	CountsFor(ctx context.Context, curriculumID string) (*Counts, error)
}
