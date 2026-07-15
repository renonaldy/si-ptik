package obe

import "time"

// CPL categories (SN-Dikti learning-outcome groups).
const (
	KategoriSikap              = "sikap"
	KategoriPengetahuan        = "pengetahuan"
	KategoriKeterampilanUmum   = "keterampilan_umum"
	KategoriKeterampilanKhusus = "keterampilan_khusus"
)

// Curriculum — an OBE curriculum version (SK + effective date + active flag).
type Curriculum struct {
	ID             string    `json:"id"`
	Nama           string    `json:"nama"`
	Tahun          string    `json:"tahun"`
	NomorSK        string    `json:"nomor_sk"`
	TanggalBerlaku string    `json:"tanggal_berlaku"`
	IsActive       bool      `json:"is_active"`
	Deskripsi      string    `json:"deskripsi"`
	BukuURL        string    `json:"buku_url"`
	StrukturURL    string    `json:"struktur_url"`
	CreatedAt      time.Time `json:"created_at"`
	UpdatedAt      time.Time `json:"updated_at"`
}

// CurriculumInput carries the writable fields. IsActive is NOT here — it is changed
// only through the activate endpoint so exactly one curriculum stays active.
type CurriculumInput struct {
	Nama           string `json:"nama"`
	Tahun          string `json:"tahun"`
	NomorSK        string `json:"nomor_sk"`
	TanggalBerlaku string `json:"tanggal_berlaku"`
	Deskripsi      string `json:"deskripsi"`
	BukuURL        string `json:"buku_url"`
	StrukturURL    string `json:"struktur_url"`
}

// Course — a mata kuliah placed in a curriculum's semester (1..8).
type Course struct {
	ID           string    `json:"id"`
	CurriculumID string    `json:"curriculum_id"`
	Kode         string    `json:"kode"`
	Nama         string    `json:"nama"`
	SKS          int       `json:"sks"`
	Semester     int       `json:"semester"`
	Deskripsi    string    `json:"deskripsi"`
	RPSURL       string    `json:"rps_url"`
	CreatedAt    time.Time `json:"created_at"`
	UpdatedAt    time.Time `json:"updated_at"`
}

type CourseInput struct {
	CurriculumID string `json:"curriculum_id"`
	Kode         string `json:"kode"`
	Nama         string `json:"nama"`
	SKS          int    `json:"sks"`
	Semester     int    `json:"semester"`
	Deskripsi    string `json:"deskripsi"`
	RPSURL       string `json:"rps_url"`
}

// CPL — Capaian Pembelajaran Lulusan (program learning outcome).
type CPL struct {
	ID           string    `json:"id"`
	CurriculumID string    `json:"curriculum_id"`
	Kode         string    `json:"kode"`
	Deskripsi    string    `json:"deskripsi"`
	Kategori     string    `json:"kategori"`
	CreatedAt    time.Time `json:"created_at"`
	UpdatedAt    time.Time `json:"updated_at"`
}

type CPLInput struct {
	CurriculumID string `json:"curriculum_id"`
	Kode         string `json:"kode"`
	Deskripsi    string `json:"deskripsi"`
	Kategori     string `json:"kategori"`
}

// CPMK — Capaian Pembelajaran Mata Kuliah (course learning outcome); many per course.
type CPMK struct {
	ID         string    `json:"id"`
	CourseID   string    `json:"course_id"`
	Kode       string    `json:"kode"`
	Deskripsi  string    `json:"deskripsi"`
	LevelBloom string    `json:"level_bloom"`
	Target     string    `json:"target"`
	CreatedAt  time.Time `json:"created_at"`
	UpdatedAt  time.Time `json:"updated_at"`
}

type CPMKInput struct {
	CourseID   string `json:"course_id"`
	Kode       string `json:"kode"`
	Deskripsi  string `json:"deskripsi"`
	LevelBloom string `json:"level_bloom"`
	Target     string `json:"target"`
}

// RPS — one weekly Rencana Pembelajaran Semester row, optionally tied to a CPMK.
type RPS struct {
	ID         string    `json:"id"`
	CourseID   string    `json:"course_id"`
	Minggu     int       `json:"minggu"`
	CPMKID     *string   `json:"cpmk_id"`
	Materi     string    `json:"materi"`
	Metode     string    `json:"metode"`
	Assessment string    `json:"assessment"`
	CreatedAt  time.Time `json:"created_at"`
	UpdatedAt  time.Time `json:"updated_at"`
}

type RPSInput struct {
	CourseID   string  `json:"course_id"`
	Minggu     int     `json:"minggu"`
	CPMKID     *string `json:"cpmk_id"`
	Materi     string  `json:"materi"`
	Metode     string  `json:"metode"`
	Assessment string  `json:"assessment"`
}

// Link — one CPL↔CPMK mapping pair.
type Link struct {
	CPLID  string `json:"cpl_id"`
	CPMKID string `json:"cpmk_id"`
}

// MappingSetInput toggles a single CPL↔CPMK link on or off.
type MappingSetInput struct {
	CPLID  string `json:"cpl_id"`
	CPMKID string `json:"cpmk_id"`
	Linked bool   `json:"linked"`
}

// MappingMatrix — everything the matrix page needs in one payload.
type MappingMatrix struct {
	CPLs  []CPL  `json:"cpls"`
	CPMKs []CPMK `json:"cpmks"`
	Links []Link `json:"links"`
}

// Stats — dashboard numbers for one curriculum.
type Stats struct {
	Curriculum        *Curriculum    `json:"curriculum"`
	CourseCount       int            `json:"course_count"`
	CPLCount          int            `json:"cpl_count"`
	CPMKCount         int            `json:"cpmk_count"`
	RPSCount          int            `json:"rps_count"`
	TotalSKS          int            `json:"total_sks"`
	MappedCPMK        int            `json:"mapped_cpmk"`
	MappingProgress   int            `json:"mapping_progress"` // percent 0..100 of CPMK linked to ≥1 CPL
	CoursesBySemester map[int]int    `json:"courses_by_semester"`
	CPLByKategori     map[string]int `json:"cpl_by_kategori"`
}

// Counts is the raw aggregate the repository returns; the service turns it into Stats.
type Counts struct {
	CourseCount       int
	CPLCount          int
	CPMKCount         int
	RPSCount          int
	TotalSKS          int
	MappedCPMK        int
	CoursesBySemester map[int]int
	CPLByKategori     map[string]int
}

// ── Public aggregate (no-auth read of the active curriculum) ──

// PublicCourse embeds the course plus its CPMKs and the distinct CPL codes it supports.
type PublicCourse struct {
	Course
	CPMKs    []CPMK   `json:"cpmks"`
	CPLCodes []string `json:"cpl_codes"`
}

// PublicData is the full tree of the active curriculum for the public page.
type PublicData struct {
	Curriculum *Curriculum    `json:"curriculum"`
	CPLs       []CPL          `json:"cpls"`
	Courses    []PublicCourse `json:"courses"`
}
