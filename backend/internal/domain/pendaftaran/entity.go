package pendaftaran

import "time"

// Pendaftaran — ported/added for the public site.
type Pendaftaran struct {
	ID          string    `json:"id"`
	Nama        string    `json:"nama"`
	Email       string    `json:"email"`
	NoHP        string    `json:"no_hp"`
	AsalSekolah string    `json:"asal_sekolah"`
	Jenis       string    `json:"jenis"`
	Pesan       string    `json:"pesan"`
	CreatedAt   time.Time `json:"created_at"`
	UpdatedAt   time.Time `json:"updated_at"`
}

// Input carries the writable fields for create/update.
type Input struct {
	Nama        string `json:"nama"`
	Email       string `json:"email"`
	NoHP        string `json:"no_hp"`
	AsalSekolah string `json:"asal_sekolah"`
	Jenis       string `json:"jenis"`
	Pesan       string `json:"pesan"`
}
