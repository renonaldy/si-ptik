package skripsi

import "time"

// Skripsi — ported from the Laravel `skripsis` table.
type Skripsi struct {
	ID           string    `json:"id"`
	Nama         string    `json:"nama"`
	NPM          string    `json:"npm"`
	JudulSkripsi string    `json:"judul_skripsi"`
	Pembimbing   string    `json:"pembimbing"`
	File         string    `json:"file"`
	CreatedAt    time.Time `json:"created_at"`
	UpdatedAt    time.Time `json:"updated_at"`
}

// Input carries the writable fields for create/update.
type Input struct {
	Nama         string `json:"nama"`
	NPM          string `json:"npm"`
	JudulSkripsi string `json:"judul_skripsi"`
	Pembimbing   string `json:"pembimbing"`
	File         string `json:"file"`
}
