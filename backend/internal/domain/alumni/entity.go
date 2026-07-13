package alumni

import "time"

// Alumni — ported from the Laravel `alumnis` table (AlumniController::add_alumni).
type Alumni struct {
	ID           string    `json:"id"`
	NamaAlumni   string    `json:"nama_alumni"`
	NPM          string    `json:"npm"`
	TempatLahir  string    `json:"tempat"`  // "tempat lahir"
	TanggalLahir string    `json:"tanggal"` // ISO date string (YYYY-MM-DD)
	CreatedAt    time.Time `json:"created_at"`
	UpdatedAt    time.Time `json:"updated_at"`
}

// Input carries the writable fields for create/update.
type Input struct {
	NamaAlumni   string `json:"nama_alumni"`
	NPM          string `json:"npm"`
	TempatLahir  string `json:"tempat"`
	TanggalLahir string `json:"tanggal"`
}
