package obe

import "context"

// AssessmentRepository is the data-access contract for the assessment &
// achievement half of the OBE module. The concrete pgx implementation lives in
// internal/repository/postgres/obe_assessment.go. Same conventions as
// Repository: single-row reads return (nil, nil) when not found; lists return
// empty slices, never nil.
type AssessmentRepository interface {
	// Indicators (IK)
	ListIndicators(ctx context.Context, curriculumID, cplID string) ([]Indicator, error)
	GetIndicator(ctx context.Context, id string) (*Indicator, error)
	CreateIndicator(ctx context.Context, id string, in IndicatorInput) (*Indicator, error)
	UpdateIndicator(ctx context.Context, id string, in IndicatorInput) (*Indicator, error)
	DeleteIndicator(ctx context.Context, id string) error

	// IK ↔ CPMK links
	ListIKLinksByCurriculum(ctx context.Context, curriculumID string) ([]IKLink, error)
	AddIKLink(ctx context.Context, ikID, cpmkID string) error
	RemoveIKLink(ctx context.Context, ikID, cpmkID string) error

	// Classes — filter by courseID and/or curriculumID (either may be empty).
	ListClasses(ctx context.Context, courseID, curriculumID string) ([]Class, error)
	GetClass(ctx context.Context, id string) (*Class, error)
	CreateClass(ctx context.Context, id string, in ClassInput) (*Class, error)
	UpdateClass(ctx context.Context, id string, in ClassInput) (*Class, error)
	DeleteClass(ctx context.Context, id string) error

	// Class roster
	ListStudents(ctx context.Context, classID string) ([]ClassStudent, error)
	GetStudent(ctx context.Context, id string) (*ClassStudent, error)
	CreateStudent(ctx context.Context, id string, in ClassStudentInput) (*ClassStudent, error)
	// CreateStudents bulk-inserts rows (ids pre-minted, index-aligned with rows),
	// skipping NPMs already present in the class; returns how many were inserted.
	CreateStudents(ctx context.Context, classID string, ids []string, rows []BulkStudentRow) (int, error)
	UpdateStudent(ctx context.Context, id string, in ClassStudentInput) (*ClassStudent, error)
	DeleteStudent(ctx context.Context, id string) error

	// Assessments
	ListAssessments(ctx context.Context, courseID string) ([]Assessment, error)
	GetAssessment(ctx context.Context, id string) (*Assessment, error)
	CreateAssessment(ctx context.Context, id string, in AssessmentInput) (*Assessment, error)
	UpdateAssessment(ctx context.Context, id string, in AssessmentInput) (*Assessment, error)
	DeleteAssessment(ctx context.Context, id string) error
	// SumBobot totals the weights of a course's assessments in one tahun_akademik,
	// excluding excludeID (pass "" on create) — backs the ≤100% validation.
	SumBobot(ctx context.Context, courseID, tahunAkademik, excludeID string) (int, error)

	// Assessment ↔ CPMK links
	ListAssessmentLinksByCourse(ctx context.Context, courseID string) ([]AssessmentLink, error)
	AddAssessmentLink(ctx context.Context, assessmentID, cpmkID string) error
	RemoveAssessmentLink(ctx context.Context, assessmentID, cpmkID string) error

	// Scores
	ListScoresByClass(ctx context.Context, classID string) ([]ScoreCell, error)
	// UpsertScores writes cells keyed on (student_id, assessment_id); ids are
	// pre-minted, index-aligned, and only used for fresh inserts.
	UpsertScores(ctx context.Context, ids []string, cells []ScoreCell) error

	// Results — atomically replace all stored results for the given students.
	// classID keys a per-class advisory lock so concurrent recomputes serialize
	// instead of deadlocking on the shared rows.
	ReplaceResults(ctx context.Context, classID string, studentIDs []string, cpmk, cpl, ik []StoredResult) error
}
