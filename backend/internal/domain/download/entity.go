package download

import "time"

// Download — ported/added for the public site.
type Download struct {
	ID         string    `json:"id"`
	Judul      string    `json:"judul"`
	Keterangan string    `json:"keterangan"`
	Kategori   string    `json:"kategori"`
	File       string    `json:"file"`
	CreatedAt  time.Time `json:"created_at"`
	UpdatedAt  time.Time `json:"updated_at"`
}

// Input carries the writable fields for create/update.
type Input struct {
	Judul      string `json:"judul"`
	Keterangan string `json:"keterangan"`
	Kategori   string `json:"kategori"`
	File       string `json:"file"`
}
