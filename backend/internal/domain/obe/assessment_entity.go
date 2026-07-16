package obe

import "time"

// Assessment jenis values (whitelist enforced by the service).
const (
	JenisTugas      = "tugas"
	JenisQuiz       = "quiz"
	JenisPraktikum  = "praktikum"
	JenisProject    = "project"
	JenisUTS        = "uts"
	JenisUAS        = "uas"
	JenisPresentasi = "presentasi"
)

// AllJenis lists every valid assessment jenis.
var AllJenis = []string{JenisTugas, JenisQuiz, JenisPraktikum, JenisProject, JenisUTS, JenisUAS, JenisPresentasi}

// Achievement status values.
const (
	StatusTercapai      = "tercapai"
	StatusBelumTercapai = "belum_tercapai"
)

// Indicator — Indikator Kinerja (IK), a child of a CPL (1 CPL → many IK).
type Indicator struct {
	ID        string    `json:"id"`
	CPLID     string    `json:"cpl_id"`
	Kode      string    `json:"kode"`
	Deskripsi string    `json:"deskripsi"`
	CreatedAt time.Time `json:"created_at"`
	UpdatedAt time.Time `json:"updated_at"`
}

type IndicatorInput struct {
	CPLID     string `json:"cpl_id"`
	Kode      string `json:"kode"`
	Deskripsi string `json:"deskripsi"`
}

// Class — a rombongan belajar of a course in an academic year.
type Class struct {
	ID            string    `json:"id"`
	CourseID      string    `json:"course_id"`
	Nama          string    `json:"nama"`
	TahunAkademik string    `json:"tahun_akademik"`
	Periode       string    `json:"periode"` // ganjil | genap
	DosenID       *string   `json:"dosen_id"`
	DosenNama     string    `json:"dosen_nama"` // denormalized for lists (LEFT JOIN dosens)
	CreatedAt     time.Time `json:"created_at"`
	UpdatedAt     time.Time `json:"updated_at"`
}

type ClassInput struct {
	CourseID      string  `json:"course_id"`
	Nama          string  `json:"nama"`
	TahunAkademik string  `json:"tahun_akademik"`
	Periode       string  `json:"periode"`
	DosenID       *string `json:"dosen_id"`
}

// ClassStudent — one roster row (module-local; no global student master exists).
type ClassStudent struct {
	ID        string    `json:"id"`
	ClassID   string    `json:"class_id"`
	NPM       string    `json:"npm"`
	Nama      string    `json:"nama"`
	CreatedAt time.Time `json:"created_at"`
	UpdatedAt time.Time `json:"updated_at"`
}

type ClassStudentInput struct {
	ClassID string `json:"class_id"`
	NPM     string `json:"npm"`
	Nama    string `json:"nama"`
}

// BulkStudentRow is one row of a pasted roster (bulk add).
type BulkStudentRow struct {
	NPM  string `json:"npm"`
	Nama string `json:"nama"`
}

type StudentsBulkInput struct {
	ClassID  string           `json:"class_id"`
	Students []BulkStudentRow `json:"students"`
}

// Assessment — one graded component of a course (Tugas/UTS/UAS/…).
type Assessment struct {
	ID            string    `json:"id"`
	CourseID      string    `json:"course_id"`
	Nama          string    `json:"nama"`
	Jenis         string    `json:"jenis"`
	Bobot         int       `json:"bobot"` // percent
	Semester      string    `json:"semester"`
	TahunAkademik string    `json:"tahun_akademik"`
	CreatedAt     time.Time `json:"created_at"`
	UpdatedAt     time.Time `json:"updated_at"`
}

type AssessmentInput struct {
	CourseID      string `json:"course_id"`
	Nama          string `json:"nama"`
	Jenis         string `json:"jenis"`
	Bobot         int    `json:"bobot"`
	Semester      string `json:"semester"`
	TahunAkademik string `json:"tahun_akademik"`
}

// AssessmentLink — one assessment↔CPMK mapping pair.
type AssessmentLink struct {
	AssessmentID string `json:"assessment_id"`
	CPMKID       string `json:"cpmk_id"`
}

type AssessmentMappingSetInput struct {
	AssessmentID string `json:"assessment_id"`
	CPMKID       string `json:"cpmk_id"`
	Linked       bool   `json:"linked"`
}

// AssessmentMappingMatrix — everything the assessment↔CPMK matrix needs.
type AssessmentMappingMatrix struct {
	Assessments []Assessment     `json:"assessments"`
	CPMKs       []CPMK           `json:"cpmks"`
	Links       []AssessmentLink `json:"links"`
}

// IKLink — one IK↔CPMK mapping pair.
type IKLink struct {
	IKID   string `json:"ik_id"`
	CPMKID string `json:"cpmk_id"`
}

type IKMappingSetInput struct {
	IKID   string `json:"ik_id"`
	CPMKID string `json:"cpmk_id"`
	Linked bool   `json:"linked"`
}

// IKMappingMatrix — IK↔CPMK matrix payload (CPLs included for row grouping).
type IKMappingMatrix struct {
	IKs   []Indicator `json:"iks"`
	CPLs  []CPL       `json:"cpls"`
	CPMKs []CPMK      `json:"cpmks"`
	Links []IKLink    `json:"links"`
}

// ScoreCell — one student × assessment score (0..100).
type ScoreCell struct {
	StudentID    string  `json:"student_id"`
	AssessmentID string  `json:"assessment_id"`
	Score        float64 `json:"score"`
}

// ScoresSaveInput saves a batch of cells for one class (grid "Simpan Semua").
type ScoresSaveInput struct {
	ClassID string      `json:"class_id"`
	Scores  []ScoreCell `json:"scores"`
}

// ScoreMatrix — the score-entry grid payload for one class.
type ScoreMatrix struct {
	Class       *Class         `json:"class"`
	Students    []ClassStudent `json:"students"`
	Assessments []Assessment   `json:"assessments"`
	Scores      []ScoreCell    `json:"scores"`
	BobotTotal  int            `json:"bobot_total"`
}

// ── Achievement results ──

// ResultRow — one computed attainment value (per student, per CPMK/CPL/IK).
type ResultRow struct {
	RefID  string  `json:"ref_id"` // cpmk_id / cpl_id / ik_id
	Nilai  float64 `json:"nilai"`  // percent, 2 decimals
	Status string  `json:"status"` // tercapai | belum_tercapai
}

// StudentResults — all computed rows for one student.
type StudentResults struct {
	Student ClassStudent `json:"student"`
	CPMK    []ResultRow  `json:"cpmk"`
	CPL     []ResultRow  `json:"cpl"`
	IK      []ResultRow  `json:"ik"`
}

// AggRow — class-level aggregate for one CPMK/CPL/IK: mean over assessed students.
type AggRow struct {
	RefID    string  `json:"ref_id"`
	Nilai    float64 `json:"nilai"`    // class average (assessed students only)
	Tercapai int     `json:"tercapai"` // students at/above threshold
	Dinilai  int     `json:"dinilai"`  // students with a computed value
}

// ClassResults — the full achievement payload for one class. Recomputed (and
// persisted to the obe_*_results tables) on every read so it never goes stale.
type ClassResults struct {
	Class      *Class       `json:"class"`
	Course     *Course      `json:"course"`
	Threshold  int          `json:"threshold"`   // curriculum default (%)
	BobotTotal int          `json:"bobot_total"` // Σ bobot of in-scope assessments (warn when ≠ 100)
	CPMKs      []CPMK       `json:"cpmks"`
	CPLs       []CPL        `json:"cpls"`
	IKs        []Indicator  `json:"iks"`
	Students   []StudentResults `json:"students"`
	ClassCPMK  []AggRow     `json:"class_cpmk"`
	ClassCPL   []AggRow     `json:"class_cpl"`
	ClassIK    []AggRow     `json:"class_ik"`
}

// StoredResult is one row the engine persists into an obe_*_results table.
type StoredResult struct {
	ID        string
	StudentID string
	RefID     string
	Nilai     float64
	Status    string
}
