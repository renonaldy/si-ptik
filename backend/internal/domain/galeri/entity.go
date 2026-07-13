package galeri

import "time"

// Galeri — ported/added for the public site.
type Galeri struct {
	ID         string    `json:"id"`
	Judul      string    `json:"judul"`
	Gambar     string    `json:"gambar"`
	Keterangan string    `json:"keterangan"`
	Tanggal    string    `json:"tanggal"`
	CreatedAt  time.Time `json:"created_at"`
	UpdatedAt  time.Time `json:"updated_at"`
}

// Input carries the writable fields for create/update.
type Input struct {
	Judul      string `json:"judul"`
	Gambar     string `json:"gambar"`
	Keterangan string `json:"keterangan"`
	Tanggal    string `json:"tanggal"`
}
